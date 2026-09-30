'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireStudent, requireUser } from '@/lib/auth/guards';
import { getProfileById } from '@/lib/db/profiles';
import { getSchemeBySlugWithRelations } from '@/lib/db/schemes';
import { getDocumentById } from '@/lib/db/documents';
import {
  createDraftApplication,
  findOpenApplication,
  getApplicationForStudent,
  recordActivity,
  setApplicationDocument,
  submitApplication,
  updateApplicationDraft,
} from '@/lib/db/applications';
import { createNotification, markNotificationsRead } from '@/lib/db/applications';
import { createNotificationForAdmins } from '@/lib/db/applications';
import { resolveDeficiency, markDeficiencyReviewed } from '@/lib/db/deficiencies';
import { draftFromProfile } from '@/lib/applications/draft';
import { DOCUMENT_TYPE_LABEL } from '@/lib/domain/workflow';
import type { ApplicationDraftData, DocumentType } from '@/types';

export interface ApplicationState {
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
  applicationId?: string;
}

const STEPS = ['personal', 'education', 'household', 'documents', 'review'] as const;

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function readDraft(formData: FormData): ApplicationDraftData {
  const documents: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('document:') && typeof value === 'string' && value) {
      documents[key.slice('document:'.length)] = value;
    }
  }
  const merged = text(formData, 'draft');
  const base: ApplicationDraftData = merged
    ? (JSON.parse(merged) as ApplicationDraftData)
    : {
        personal: { fullName: '', dateOfBirth: '', gender: '', mobile: '', email: '', state: '', district: '' },
        education: {
          educationLevel: '',
          course: '',
          institution: '',
          academicYear: '',
          previousQualification: '',
          percentageOrCgpa: '',
        },
        household: {
          annualFamilyIncome: '',
          householdSize: '',
          primaryOccupation: '',
          category: '',
          isST: false,
          isPVTG: false,
        },
        documents,
        declaration: { accepted: formData.get('declaration') === 'on' },
      };

  return {
    ...base,
    documents,
    declaration: { accepted: formData.get('declaration') === 'on' },
  };
}

function validateDraft(draft: ApplicationDraftData, step: string): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 'personal') {
    if (draft.personal.fullName.length < 3) errors.fullName = 'Enter your full name.';
    if (!draft.personal.dateOfBirth) errors.dateOfBirth = 'Date of birth is required.';
    if (!draft.personal.state) errors.state = 'Select your state.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.personal.email)) errors.email = 'Enter a valid email address.';
  }

  if (step === 'education') {
    if (!draft.education.educationLevel) errors.educationLevel = 'Select your education level.';
    if (draft.education.course.length < 2) errors.course = 'Enter your course or programme.';
    if (draft.education.institution.length < 2) errors.institution = 'Enter your institution.';
    if (!draft.education.academicYear) errors.academicYear = 'Enter your year of study.';
  }

  if (step === 'household') {
    if (!/^\d{1,9}$/.test(draft.household.annualFamilyIncome))
      errors.annualFamilyIncome = 'Enter the annual family income in digits.';
    if (!/^\d{1,2}$/.test(draft.household.householdSize)) errors.householdSize = 'Enter the household size.';
    if (draft.household.primaryOccupation.trim().length < 2)
      errors.primaryOccupation = 'Describe the primary occupation of the family.';
    if (!draft.household.category) errors.category = 'Select your social category.';
  }

  return errors;
}

async function resolveApplication(applicationId: string | null, slug: string) {
  const user = await requireStudent();
  const profile = getProfileById(user.studentId);
  if (!profile) throw new Error('Complete your profile before applying.');

  const scheme = getSchemeBySlugWithRelations(slug);
  if (!scheme) throw new Error('Scheme not found.');

  if (applicationId) {
    const existing = getApplicationForStudent(applicationId, profile.id);
    if (existing) return { user, profile, scheme, application: existing };
  }

  const open = findOpenApplication(profile.id, scheme.id);
  if (open) {
    redirect(`/student/applications/${open.id}?existing=1`);
  }

  const draft = draftFromProfile(profile);
  const application = createDraftApplication({ studentId: profile.id, schemeId: scheme.id, draftData: draft });
  return { user, profile, scheme, application };
}

export async function saveDraftAction(_prev: ApplicationState, formData: FormData): Promise<ApplicationState> {
  const applicationId = text(formData, 'applicationId') || null;
  const slug = text(formData, 'slug');
  const step = text(formData, 'step');

  const { application } = await resolveApplication(applicationId, slug);
  const draft = readDraft(formData);

  const errors = validateDraft(draft, step);
  if (Object.keys(errors).length > 0) {
    return { error: 'Please correct the highlighted fields before continuing.', fieldErrors: errors };
  }

  updateApplicationDraft(application.id, draft, STEPS.indexOf(step as (typeof STEPS)[number]) + 1);
  revalidatePath(`/student/applications/new/${slug}`);

  return { message: 'Draft saved.', applicationId: application.id };
}

export async function saveAndGoNextAction(_prev: ApplicationState, formData: FormData): Promise<ApplicationState> {
  return saveDraftAction(_prev, formData);
}

export async function submitApplicationAction(_prev: ApplicationState, formData: FormData): Promise<ApplicationState> {
  const applicationId = text(formData, 'applicationId');
  const slug = text(formData, 'slug');
  const declaration = formData.get('declaration') === 'on';

  if (!applicationId) return { error: 'Save the draft before submitting.' };
  if (!declaration) return { error: 'Accept the declaration before submitting.' };

  const user = await requireStudent();
  const profile = getProfileById(user.studentId);
  if (!profile) return { error: 'Complete your profile before submitting.' };

  const application = getApplicationForStudent(applicationId, profile.id);
  if (!application) return { error: 'Application not found.' };
  if (application.status !== 'DRAFT') return { error: 'This application has already been submitted.' };

  const scheme = getSchemeBySlugWithRelations(slug);
  if (!scheme) return { error: 'Scheme not found.' };

  const draft = readDraft(formData);
  const errors = {
    ...validateDraft(draft, 'personal'),
    ...validateDraft(draft, 'education'),
    ...validateDraft(draft, 'household'),
  };
  if (Object.keys(errors).length > 0) {
    return { error: 'Some sections are incomplete. Go back and correct them.', fieldErrors: errors };
  }

  const selected: Record<string, string> = {};
  for (const [type, documentId] of Object.entries(draft.documents)) {
    const document = getDocumentById(documentId);
    if (!document || document.studentId !== profile.id) continue;
    if (document.status === 'NEEDS_ATTENTION' || document.status === 'INVALID' || document.status === 'EXPIRED') {
      continue;
    }
    selected[type] = documentId;
  }

  const readinessGap = scheme.requiredDocuments.filter(
    (item) => item.required && !selected[item.documentType],
  );
  if (readinessGap.length > 0) {
    return {
      error: `Attach a document for every required item. Still missing: ${readinessGap
        .map((item) => item.documentName)
        .join(', ')}. You can still submit — the reviewing officer will see the gap.`,
    };
  }

  updateApplicationDraft(application.id, draft, 6, declaration);

  try {
    const result = submitApplication(application.id, selected, declaration, user.id);
    revalidatePath('/student/applications');
    revalidatePath('/student/dashboard');
    redirect(`/student/applications/${application.id}?submitted=${result.number}`);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) throw error;
    return { error: error instanceof Error ? error.message : 'The application could not be submitted.' };
  }
}

export async function submitCorrectionAction(_prev: ApplicationState, formData: FormData): Promise<ApplicationState> {
  const user = await requireStudent();
  const profile = getProfileById(user.studentId);
  if (!profile) return { error: 'Profile not found.' };

  const applicationId = text(formData, 'applicationId');
  const deficiencyId = text(formData, 'deficiencyId');
  const requiredType = text(formData, 'requiredDocumentType') as DocumentType;
  const documentId = text(formData, 'documentId');
  const note = text(formData, 'note');

  const application = getApplicationForStudent(applicationId, profile.id);
  if (!application) return { error: 'Application not found.' };

  const document = getDocumentById(documentId);
  if (!document || document.studentId !== profile.id) return { error: 'Choose a document from your wallet.' };
  if (!note) return { error: 'Describe what you changed in one line.' };

  setApplicationDocument(application.id, requiredType, documentId, true);
  resolveDeficiency(deficiencyId, documentId);
  markDeficiencyReviewed(deficiencyId);

  recordActivity({
    applicationId: application.id,
    actorId: user.id,
    actorRole: 'STUDENT',
    eventType: 'CORRECTION_SUBMITTED',
    description: `Correction submitted for: ${DOCUMENT_TYPE_LABEL[requiredType] ?? requiredType}. ${note}`,
    metadata: { document: document.documentName },
  });

  createNotification({
    userId: user.id,
    type: 'CORRECTION_RECEIVED',
    title: 'Correction submitted',
    message: `Your correction for ${document.documentName} was sent back to the reviewing officer.`,
    relatedApplicationId: application.id,
    relatedDocumentId: documentId,
  });

  createNotificationForAdmins({
    type: 'CORRECTION_RECEIVED',
    title: 'Correction received',
    message: `${profile.fullName} submitted a correction for ${DOCUMENT_TYPE_LABEL[requiredType] ?? requiredType}: ${note}`,
    relatedApplicationId: application.id,
    relatedDocumentId: documentId,
  });

  revalidatePath(`/student/applications/${application.id}`);
  revalidatePath('/student/applications');
  revalidatePath('/student/dashboard');
  revalidatePath('/admin/applications');
  revalidatePath('/admin/dashboard');

  return { message: 'Correction submitted. A reviewing officer will look at it next.' };
}

export async function markNotificationsReadAction(): Promise<void> {
  const user = await requireUser();
  markNotificationsRead(user.id);
  revalidatePath('/', 'layout');
}
