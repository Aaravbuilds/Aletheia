import { getDb, newId, nowIso } from '@/lib/db/client';
import type { Deficiency, DeficiencyStatus, DeficiencyType, DocumentType } from '@/types';

interface DeficiencyRow {
  id: string;
  application_id: string;
  document_id: string | null;
  required_document_type: DocumentType | null;
  type: DeficiencyType;
  title: string;
  description: string;
  required_action: string;
  status: DeficiencyStatus;
  created_by: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_document_id: string | null;
}

function mapDeficiency(row: DeficiencyRow): Deficiency {
  return {
    id: row.id,
    applicationId: row.application_id,
    documentId: row.document_id,
    requiredDocumentType: row.required_document_type,
    type: row.type,
    title: row.title,
    description: row.description,
    requiredAction: row.required_action,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
    resolvedDocumentId: row.resolved_document_id,
  };
}

export function createDeficiency(input: {
  applicationId: string;
  documentId?: string | null;
  requiredDocumentType?: DocumentType | null;
  type: DeficiencyType;
  title: string;
  description: string;
  requiredAction: string;
  createdBy: string | null;
}): Deficiency {
  const id = newId('def');
  getDb()
    .prepare(
      `INSERT INTO deficiencies
        (id, application_id, document_id, required_document_type, type, title, description,
         required_action, status, created_by, created_at, resolved_at, resolved_document_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?, NULL, NULL)`,
    )
    .run(
      id,
      input.applicationId,
      input.documentId ?? null,
      input.requiredDocumentType ?? null,
      input.type,
      input.title,
      input.description,
      input.requiredAction,
      input.createdBy,
      nowIso(),
    );
  return getDeficiencyById(id)!;
}

export function getDeficiencyById(id: string): Deficiency | null {
  const row = getDb().prepare('SELECT * FROM deficiencies WHERE id = ?').get(id) as DeficiencyRow | undefined;
  return row ? mapDeficiency(row) : null;
}

export function listDeficiencies(applicationId: string): Deficiency[] {
  const rows = getDb()
    .prepare('SELECT * FROM deficiencies WHERE application_id = ? ORDER BY created_at DESC, rowid DESC')
    .all(applicationId) as DeficiencyRow[];
  return rows.map(mapDeficiency);
}

export function listOpenDeficiencies(applicationId: string): Deficiency[] {
  return listDeficiencies(applicationId).filter((d) => d.status === 'OPEN');
}

export function listAllOpenDeficiencies(): (Deficiency & { applicationNumber: string; studentId: string })[] {
  const rows = getDb()
    .prepare(
      `SELECT d.*, a.application_number, a.student_id FROM deficiencies d
       JOIN applications a ON a.id = d.application_id
       WHERE d.status = 'OPEN' ORDER BY d.created_at DESC`,
    )
    .all() as (DeficiencyRow & { application_number: string; student_id: string })[];
  return rows.map((row) => ({
    ...mapDeficiency(row),
    applicationNumber: row.application_number,
    studentId: row.student_id,
  }));
}

export function resolveDeficiency(id: string, resolvedDocumentId: string | null, status: DeficiencyStatus = 'RESOLVED'): void {
  getDb()
    .prepare('UPDATE deficiencies SET status = ?, resolved_at = ?, resolved_document_id = ? WHERE id = ?')
    .run(status, nowIso(), resolvedDocumentId, id);
}

export function markDeficiencyReviewed(id: string): void {
  getDb().prepare("UPDATE deficiencies SET status = 'REVIEWED' WHERE id = ?").run(id);
}

export function countOpenDeficiencies(applicationId: string): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS count FROM deficiencies WHERE application_id = ? AND status = 'OPEN'")
    .get(applicationId) as { count: number };
  return row.count;
}

export function listDeficienciesForStudent(studentId: string): Deficiency[] {
  const rows = getDb()
    .prepare(
      `SELECT d.* FROM deficiencies d
       JOIN applications a ON a.id = d.application_id
       WHERE a.student_id = ?
       ORDER BY d.created_at DESC, d.rowid DESC`,
    )
    .all(studentId) as DeficiencyRow[];
  return rows.map(mapDeficiency);
}
