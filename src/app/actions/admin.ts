'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth/guards';
import { getApplicationById, listApplicationDocuments, recordActivity, updateApplicationDocumentStatus, changeApplicationStatus } from '@/lib/db/applications';
import { createDeficiency } from '@/lib/db/deficiencies';
import { createNotification } from '@/lib/db/applications';
import { getDocumentById, updateDocumentStatus, listFindings } from '@/lib/db/documents';
import { getProfileById } from '@/lib/db/profiles';
import { getSchemeByIdWithRelations, getSchemeById } from '@/lib/db/schemes';
import { analyzeDocumentSafely } from '@/lib/ai';
import { aiProviderLabel } from '@/lib/ai';
import { evaluateRules } from '@/lib/matching/engine';
import { APPLICATION_STATUS_LABEL, DOCUMENT_TYPE_LABEL } from '@/lib/domain/workflow';
import type { ApplicationDocumentStatus, ApplicationStatus, DeficiencyType, DocumentType } from '@/types';

export interface ReviewState {
  error?: string;
  message?: string;
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

const APPLICATION_DOCUMENT_STATUSES: ApplicationDocumentStatus[] = [
  'MISSING',
  'SUBMITTED',
  'UNDER_REVIEW',
  'ACCEPTED',
  'NEEDS_CORRECTION',
];

const DEFICIENCY_TYPES: DeficiencyType[] = [
  'MISSING_DOCUMENT',
  'INVALID_DOCUMENT',
  'OUTDATED_DOCUMENT',
  'INCONSISTENT_INFORMATION',
  'MISSING_INFORMATION',
  'OTHER',
];

export async function reviewDocumentAction(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const admin = await requireAdmin();
  const applicationId = text(formData, 'applicationId');
  const applicationDocumentId = text(formData, 'applicationDocumentId');
  const status = text(formData, 'status') as ApplicationDocumentStatus;
  const notes = text(formData, 'notes');

  if (!APPLICATION_DOCUMENT_STATUSES.includes(status)) return { error: 'Choose a document status.' };

  const application = getApplicationById(applicationId);
  if (!application) return { error: 'Application not found.' };

  const record = listApplicationDocuments(applicationId).find((item) => item.id === applicationDocumentId);
  if (!record) return { error: 'That document is not part of this application.' };

  updateApplicationDocumentStatus(applicationDocumentId, status, notes || null);

  if (record.documentId) {
    if (status === 'ACCEPTED') updateDocumentStatus(record.documentId, 'VERIFIED');
    if (status === 'NEEDS_CORRECTION') updateDocumentStatus(record.documentId, 'NEEDS_ATTENTION');
  }

  recordActivity({
    applicationId,
    actorId: admin.id,
    actorRole: 'ADMIN',
    eventType: status === 'ACCEPTED' ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REVIEWED',
    description: `${DOCUMENT_TYPE_LABEL[record.requiredDocumentType] ?? 'Document'} marked ${status.toLowerCase().replace(/_/g, ' ')}.${notes ? ` Note: ${notes}` : ''}`,
    metadata: { document: DOCUMENT_TYPE_LABEL[record.requiredDocumentType] ?? record.requiredDocumentType },
  });

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath('/admin/applications');
  revalidatePath('/admin/dashboard');

  return { message: 'Document review saved.' };
}

export async function createDeficiencyAction(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const admin = await requireAdmin();
  const applicationId = text(formData, 'applicationId');
  const type = text(formData, 'type') as DeficiencyType;
  const requiredDocumentType = text(formData, 'requiredDocumentType') as DocumentType | '';
  const description = text(formData, 'description');
  const requiredAction = text(formData, 'requiredAction');
  const documentId = text(formData, 'documentId') || null;
  const moveStatus = text(formData, 'moveStatus') === 'yes';

  if (!DEFICIENCY_TYPES.includes(type)) return { error: 'Choose what kind of correction is needed.' };
  if (description.length < 10) return { error: 'Explain the issue in at least a sentence.' };
  if (requiredAction.length < 10) return { error: 'Say exactly what the student must do.' };

  const application = getApplicationById(applicationId);
  if (!application) return { error: 'Application not found.' };
  if (application.status === 'COMPLETED') return { error: 'This application is already completed.' };

  const profile = getProfileById(application.studentId);
  const scheme = getSchemeById(application.schemeId);
  const title = requiredDocumentType
    ? `${DOCUMENT_TYPE_LABEL[requiredDocumentType] ?? requiredDocumentType} — correction needed`
    : 'Application information — correction needed';

  const deficiency = createDeficiency({
    applicationId,
    documentId: documentId || null,
    requiredDocumentType: requiredDocumentType || null,
    type,
    title,
    description,
    requiredAction,
    createdBy: admin.id,
  });

  recordActivity({
    applicationId,
    actorId: admin.id,
    actorRole: 'ADMIN',
    eventType: 'DEFICIENCY_CREATED',
    description: `Correction requested: ${title}. Student action: ${requiredAction}`,
    metadata: { deficiencyId: deficiency.id },
  });

  if (profile) {
    createNotification({
      userId: profile.userId,
      type: 'DEFICIENCY_CREATED',
      title: 'Correction requested',
      message: `${title} — ${requiredAction}`,
      relatedApplicationId: applicationId,
      relatedDocumentId: documentId,
    });
  }

  if (moveStatus && application.status !== 'DEFICIENT') {
    changeApplicationStatus({
      applicationId,
      next: 'DEFICIENT',
      actorId: admin.id,
      actorRole: 'ADMIN',
      note: 'Status set to Deficient because a correction was requested.',
    });
  }

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath('/admin/applications');
  revalidatePath('/admin/dashboard');

  return {
    message: `${title}. ${profile?.fullName ?? 'The student'} has been notified${
      scheme ? ` about ${scheme.shortName}` : ''
    }.`,
  };
}

export async function updateStatusAction(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const admin = await requireAdmin();
  const applicationId = text(formData, 'applicationId');
  const next = text(formData, 'next') as ApplicationStatus;
  const note = text(formData, 'note');

  const application = getApplicationById(applicationId);
  if (!application) return { error: 'Application not found.' };

  try {
    changeApplicationStatus({
      applicationId,
      next,
      actorId: admin.id,
      actorRole: 'ADMIN',
      note: note || `Status updated to ${APPLICATION_STATUS_LABEL[next]}.`,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'The status could not be changed.' };
  }

  const profile = getProfileById(application.studentId);
  if (profile) {
    createNotification({
      userId: profile.userId,
      type: 'STATUS_CHANGED',
      title: `Status updated to ${APPLICATION_STATUS_LABEL[next]}`,
      message: `${application.applicationNumber} is now at the ${APPLICATION_STATUS_LABEL[next]} stage.`,
      relatedApplicationId: applicationId,
    });
  }

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath('/admin/applications');
  revalidatePath('/admin/dashboard');

  return { message: `Status updated to ${APPLICATION_STATUS_LABEL[next]}.` };
}

export async function runPrescreeningAction(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const admin = await requireAdmin();
  const applicationId = text(formData, 'applicationId');

  const application = getApplicationById(applicationId);
  if (!application) return { error: 'Application not found.' };
  const profile = getProfileById(application.studentId);
  if (!profile) return { error: 'Student profile not found.' };

  const records = listApplicationDocuments(applicationId).filter((record) => record.documentId);
  if (records.length === 0) return { error: 'This application has no documents to pre-screen.' };

  let findingsCount = 0;
  let degradedReason: string | null = null;
  for (const record of records) {
    const document = getDocumentById(record.documentId!);
    if (!document) continue;

    const analysis = await analyzeDocumentSafely({
      fileName: document.fileName ?? `${document.documentType}.pdf`,
      mimeType: document.mimeType ?? 'application/pdf',
      selectedType: document.documentType,
      declaredName: typeof document.extractedData?.name === 'string' ? document.extractedData.name : null,
      textHint: null,
      expectedTypes: [],
      profile: {
        fullName: profile.fullName,
        institution: profile.institution,
        course: profile.course,
        annualFamilyIncome: profile.annualFamilyIncome,
      },
    });

    const existing = listFindings(document.id);
    for (const finding of analysis.result.findings) {
      const duplicate = existing.some(
        (item) => item.title === finding.title && item.description === finding.description,
      );
      if (duplicate) continue;
      findingsCount += 1;
    }

    if (analysis.degraded) degradedReason = analysis.error;

    const { replaceFindings } = await import('@/lib/db/documents');
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
  }

  recordActivity({
    applicationId,
    actorId: admin.id,
    actorRole: 'AI',
    eventType: 'DOCUMENT_REVIEWED',
    description: `Pre-screening pass completed using ${aiProviderLabel()}. ${records.length} document(s) read, ${findingsCount} new observation(s) recorded. No eligibility decision was made.`,
  });

  revalidatePath(`/admin/applications/${applicationId}`);

  return {
    message: `Pre-screening pass complete. ${records.length} document(s) read, ${findingsCount} new observation(s) recorded. Observations are advisory — decide each document yourself.`,
    ...(degradedReason
      ? { error: `The AI provider was unavailable (${degradedReason}). The offline provider was used.` }
      : {}),
  };
}

export async function openApplicationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  redirect(`/admin/applications/${text(formData, 'applicationId')}`);
}
