import { createDocument, listFindings, replaceFindings } from '@/lib/db/documents';
import { getProfileById } from '@/lib/db/profiles';
import { analyzeDocumentSafely } from '@/lib/ai';
import { DOCUMENT_TYPE_LABEL } from '@/lib/domain/workflow';
import { storeUpload, validateUpload, type StoredFile } from '@/lib/storage/uploads';
import type { DocumentType, StudentDocument } from '@/types';

/**
 * Upload → classify → extract → consistency check → persist.
 *
 * AI output is advisory only: it produces findings, never a rejection
 * (docs/02-REQUIREMENTS.md §3.4).
 */

export interface UploadDocumentInput {
  studentId: string;
  documentType: DocumentType;
  documentName: string;
  declaredName: string | null;
  expiryDate: string | null;
  file: { name: string; type: string; size: number; bytes: Buffer };
  source?: 'UPLOAD' | 'DIGILOCKER' | 'IMPORTED';
}

export interface UploadDocumentResult {
  document: StudentDocument;
  provider: 'GROQ' | 'MOCK';
  degraded: boolean;
  note: string | null;
  error: string | null;
}

export async function uploadAndAnalyseDocument(input: UploadDocumentInput): Promise<UploadDocumentResult> {
  const validation = validateUpload({
    fileName: input.file.name,
    mimeType: input.file.type,
    size: input.file.size,
  });
  if (!validation.ok) throw new Error(validation.error);

  const profile = getProfileById(input.studentId);
  if (!profile) throw new Error('Student profile not found.');

  const stored: StoredFile = storeUpload({
    studentId: input.studentId,
    fileName: input.file.name,
    mimeType: input.file.type,
    bytes: input.file.bytes,
  });

  const expectedTypes = (Object.keys(DOCUMENT_TYPE_LABEL) as DocumentType[]).map((type) => ({
    type,
    label: DOCUMENT_TYPE_LABEL[type],
  }));

  const analysis = await analyzeDocumentSafely({
    fileName: input.file.name,
    mimeType: input.file.type,
    selectedType: input.documentType,
    declaredName: input.declaredName,
    textHint: null,
    expectedTypes,
    profile: {
      fullName: profile.fullName,
      institution: profile.institution,
      course: profile.course,
      annualFamilyIncome: profile.annualFamilyIncome,
    },
  });

  const classificationWarning = analysis.result.findings.some(
    (finding) => finding.type === 'DOCUMENT_CLASSIFICATION' && finding.severity === 'WARNING',
  );
  const attention = classificationWarning || analysis.result.degraded;

  const document = createDocument({
    studentId: input.studentId,
    documentType: input.documentType,
    documentName: input.documentName,
    source: input.source ?? 'UPLOAD',
    fileName: stored.fileName,
    storageKey: stored.storageKey,
    mimeType: stored.mimeType,
    fileSize: stored.fileSize,
    status: attention ? 'NEEDS_ATTENTION' : 'UPLOADED',
    expiryDate: input.expiryDate,
    extractedData: analysis.result.fields,
    extractionConfidence: analysis.result.confidence,
  });

  replaceFindings(
    document.id,
    analysis.result.findings.map((finding) => ({
      type: finding.type,
      severity: finding.severity,
      title: finding.title,
      description: finding.description,
      confidence: finding.confidence,
    })),
  );

  return {
    document,
    provider: analysis.result.provider,
    degraded: analysis.degraded,
    note: analysis.result.note,
    error: analysis.error,
  };
}

export { listFindings };
