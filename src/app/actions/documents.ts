'use server';

import { revalidatePath } from 'next/cache';

import { requireStudent } from '@/lib/auth/guards';
import { getProfileById } from '@/lib/db/profiles';
import { createDocument, findDocumentByType, replaceDocumentOfType, replaceFindings } from '@/lib/db/documents';
import { uploadAndAnalyseDocument } from '@/lib/documents/uploadService';
import { analyzeDocumentSafely } from '@/lib/ai';
import { describeDemoDocument, digiLockerService } from '@/lib/digilocker/service';
import { DOCUMENT_TYPE_LABEL } from '@/lib/domain/workflow';
import type { DocumentType } from '@/types';

export interface DocumentState {
  error?: string;
  message?: string;
  degraded?: boolean;
  provider?: 'GROQ' | 'MOCK';
}

const DOCUMENT_TYPES = Object.keys(DOCUMENT_TYPE_LABEL) as DocumentType[];

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

export async function uploadDocumentAction(_prev: DocumentState, formData: FormData): Promise<DocumentState> {
  const user = await requireStudent();
  if (!getProfileById(user.studentId)) return { error: 'Complete your profile before uploading documents.' };

  const documentType = text(formData, 'documentType') as DocumentType;
  if (!DOCUMENT_TYPES.includes(documentType)) return { error: 'Choose the type of document you are uploading.' };

  const documentName = text(formData, 'documentName') || DOCUMENT_TYPE_LABEL[documentType];
  const declaredName = text(formData, 'declaredName') || null;
  const expiryDate = text(formData, 'expiryDate') || null;

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Choose a file to upload. PDF, JPG, PNG and WEBP are accepted.' };
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const result = await uploadAndAnalyseDocument({
      studentId: user.studentId,
      documentType,
      documentName,
      declaredName,
      expiryDate,
      file: { name: file.name, type: file.type || 'application/octet-stream', size: file.size, bytes },
    });

    revalidatePath('/student/documents');
    revalidatePath('/student/dashboard');

    return {
      message: `${result.document.documentName} added to your wallet.`,
      provider: result.provider,
      degraded: result.degraded,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'The document could not be uploaded.' };
  }
}

export async function importFromDigiLockerAction(_prev: DocumentState, formData: FormData): Promise<DocumentState> {
  const user = await requireStudent();
  const profile = getProfileById(user.studentId);
  if (!profile) return { error: 'Complete your profile first.' };

  const externalId = text(formData, 'externalId');
  if (!externalId) return { error: 'Choose a demo record to import.' };

  const available = await digiLockerService.listDocuments();
  const record = available.find((item) => item.externalId === externalId);
  if (!record) return { error: 'That demo record is no longer available.' };

  const analysis = await analyzeDocumentSafely({
    fileName: `${record.externalId}.json`,
    mimeType: 'application/json',
    selectedType: record.documentType,
    declaredName: profile.fullName,
    textHint: `${record.documentName} ${record.issuer} ${record.issuedOn}`,
    expectedTypes: DOCUMENT_TYPES.map((type) => ({ type, label: DOCUMENT_TYPE_LABEL[type] })),
    profile: {
      fullName: profile.fullName,
      institution: profile.institution,
      course: profile.course,
      annualFamilyIncome: profile.annualFamilyIncome,
    },
  });

  const input = {
    studentId: user.studentId,
    documentType: record.documentType,
    documentName: record.documentName,
    source: 'DIGILOCKER' as const,
    fileName: null,
    status: 'UPLOADED' as const,
    expiryDate: null,
    extractedData: {
      name: profile.fullName,
      issuingAuthority: record.issuer,
      issueDate: record.issuedOn,
      documentNumber: record.externalId,
    },
    extractionConfidence: analysis.result.confidence,
  };

  /* Importing over an existing record of the same type keeps the wallet tidy:
     the previous file is archived rather than deleted. */
  const document = findDocumentByType(user.studentId, record.documentType)
    ? replaceDocumentOfType(user.studentId, record.documentType, input).document
    : createDocument(input);

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

  revalidatePath('/student/documents');
  revalidatePath('/student/dashboard');

  return {
    message: `Imported from the demo DigiLocker connection: ${describeDemoDocument(record)}.`,
    provider: analysis.result.provider,
    degraded: analysis.degraded,
  };
}

export async function deleteDocumentAction(formData: FormData): Promise<void> {
  const user = await requireStudent();
  const documentId = text(formData, 'documentId');
  if (!documentId) return;

  const { getDocumentById } = await import('@/lib/db/documents');
  const document = getDocumentById(documentId);
  if (!document || document.studentId !== user.studentId) return;

  const { getDb, nowIso } = await import('@/lib/db/client');
  getDb().prepare("UPDATE documents SET status = 'EXPIRED', updated_at = ? WHERE id = ?").run(nowIso(), documentId);

  revalidatePath('/student/documents');
}
