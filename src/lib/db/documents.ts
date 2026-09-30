import { getDb, newId, nowIso, parseJson, stringifyJson } from '@/lib/db/client';
import type {
  AiFindingDraft,
  DocumentAiFinding,
  DocumentSource,
  DocumentStatus,
  DocumentType,
  ExtractedDocumentData,
  StudentDocument,
} from '@/types';

interface DocumentRow {
  id: string;
  student_id: string;
  document_type: DocumentType;
  document_name: string;
  source: DocumentSource;
  file_name: string | null;
  storage_key: string | null;
  mime_type: string | null;
  file_size: number | null;
  status: DocumentStatus;
  uploaded_at: string;
  expiry_date: string | null;
  extracted_data: string | null;
  extraction_confidence: number | null;
  created_at: string;
  updated_at: string;
}

interface FindingRow {
  id: string;
  document_id: string;
  finding_type: DocumentAiFinding['findingType'];
  severity: DocumentAiFinding['severity'];
  title: string;
  description: string;
  confidence: number | null;
  created_at: string;
}

function mapDocument(row: DocumentRow): StudentDocument {
  return {
    id: row.id,
    studentId: row.student_id,
    documentType: row.document_type,
    documentName: row.document_name,
    source: row.source,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    hasFile: Boolean(row.storage_key),
    status: row.status,
    uploadedAt: row.uploaded_at,
    expiryDate: row.expiry_date,
    extractedData: parseJson<ExtractedDocumentData | null>(row.extracted_data, null),
    extractionConfidence: row.extraction_confidence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapFinding(row: FindingRow): DocumentAiFinding {
  return {
    id: row.id,
    documentId: row.document_id,
    findingType: row.finding_type,
    severity: row.severity,
    title: row.title,
    description: row.description,
    confidence: row.confidence,
    createdAt: row.created_at,
  };
}

export function listDocuments(studentId: string): StudentDocument[] {
  const rows = getDb()
    .prepare('SELECT * FROM documents WHERE student_id = ? ORDER BY document_type, uploaded_at DESC')
    .all(studentId) as DocumentRow[];
  return rows.map(mapDocument);
}

export function getDocumentById(id: string): StudentDocument | null {
  const row = getDb().prepare('SELECT * FROM documents WHERE id = ?').get(id) as DocumentRow | undefined;
  return row ? mapDocument(row) : null;
}

export function findDocumentByType(
  studentId: string,
  documentType: DocumentType,
): StudentDocument | null {
  const row = getDb()
    .prepare(
      'SELECT * FROM documents WHERE student_id = ? AND document_type = ? ORDER BY uploaded_at DESC LIMIT 1',
    )
    .get(studentId, documentType) as DocumentRow | undefined;
  return row ? mapDocument(row) : null;
}

export interface CreateDocumentInput {
  studentId: string;
  documentType: DocumentType;
  documentName: string;
  source: DocumentSource;
  fileName?: string | null;
  storageKey?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  status?: DocumentStatus;
  expiryDate?: string | null;
  extractedData?: ExtractedDocumentData | null;
  extractionConfidence?: number | null;
}

export function createDocument(input: CreateDocumentInput): StudentDocument {
  const id = newId('doc');
  const now = nowIso();
  getDb()
    .prepare(
      `INSERT INTO documents
        (id, student_id, document_type, document_name, source, file_name, storage_key, mime_type,
         file_size, status, uploaded_at, expiry_date, extracted_data, extraction_confidence, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      input.studentId,
      input.documentType,
      input.documentName,
      input.source,
      input.fileName ?? null,
      input.storageKey ?? null,
      input.mimeType ?? null,
      input.fileSize ?? null,
      input.status ?? 'UPLOADED',
      now,
      input.expiryDate ?? null,
      stringifyJson(input.extractedData ?? null),
      input.extractionConfidence ?? null,
      now,
      now,
    );
  return getDocumentById(id)!;
}

/** Replaces the current document of a type, archiving the previous record. */
export function replaceDocumentOfType(
  studentId: string,
  documentType: DocumentType,
  input: CreateDocumentInput,
): { document: StudentDocument; previous: StudentDocument | null } {
  const previous = findDocumentByType(studentId, documentType);
  if (previous) {
    getDb()
      .prepare("UPDATE documents SET status = 'EXPIRED', updated_at = ? WHERE id = ?")
      .run(nowIso(), previous.id);
  }
  const document = createDocument({ ...input, studentId, documentType });
  return { document, previous };
}

export function updateDocumentStatus(documentId: string, status: DocumentStatus): void {
  getDb().prepare('UPDATE documents SET status = ?, updated_at = ? WHERE id = ?').run(status, nowIso(), documentId);
}

export function replaceFindings(documentId: string, findings: AiFindingDraft[]): DocumentAiFinding[] {
  const db = getDb();
  db.prepare('DELETE FROM document_ai_findings WHERE document_id = ?').run(documentId);
  const now = nowIso();
  const insert = db.prepare(
    `INSERT INTO document_ai_findings (id, document_id, finding_type, severity, title, description, confidence, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const finding of findings) {
    insert.run(newId('fnd'), documentId, finding.type, finding.severity, finding.title, finding.description, finding.confidence, now);
  }
  return listFindings(documentId);
}

export function listFindings(documentId: string): DocumentAiFinding[] {
  const rows = getDb()
    .prepare('SELECT * FROM document_ai_findings WHERE document_id = ? ORDER BY created_at')
    .all(documentId) as FindingRow[];
  return rows.map(mapFinding);
}

export function listDocumentsWithFindings(studentId: string): StudentDocument[] {
  return listDocuments(studentId).map((doc) => ({ ...doc, findings: listFindings(doc.id) }));
}

export function attachFindings(documents: StudentDocument[]): StudentDocument[] {
  return documents.map((doc) => ({ ...doc, findings: listFindings(doc.id) }));
}

/** Resolves the stored file for the authenticated file route. Never sent to the client. */
export function getDocumentFile(
  id: string,
): { storageKey: string; fileName: string; mimeType: string } | null {
  const row = getDb()
    .prepare('SELECT storage_key, file_name, mime_type FROM documents WHERE id = ?')
    .get(id) as { storage_key: string | null; file_name: string | null; mime_type: string | null } | undefined;
  if (!row?.storage_key) return null;
  return {
    storageKey: row.storage_key,
    fileName: row.file_name ?? 'document',
    mimeType: row.mime_type ?? 'application/octet-stream',
  };
}
