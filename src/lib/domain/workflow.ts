import type { ApplicationStatus, DocumentStatus, DocumentType, MatchStatus } from '@/types';

/**
 * Application workflow (docs/05-TECH-ARCHITECTURE.md §21–22).
 * Transitions are validated server-side; the UI only ever offers allowed ones.
 */

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'DOCUMENT_VERIFICATION',
  'INSTITUTE_VERIFICATION',
  'UNDER_REVIEW',
  'DECISION_PENDING',
  'COMPLETED',
];

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  DOCUMENT_VERIFICATION: 'Document Verification',
  INSTITUTE_VERIFICATION: 'Institute Verification',
  UNDER_REVIEW: 'Under Review',
  DEFICIENT: 'Deficient — action required',
  CORRECTION_RECEIVED: 'Correction Received',
  DECISION_PENDING: 'Decision Pending',
  COMPLETED: 'Completed',
};

export const APPLICATION_STATUS_TONE: Record<
  ApplicationStatus,
  'neutral' | 'info' | 'success' | 'warning' | 'error'
> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  DOCUMENT_VERIFICATION: 'info',
  INSTITUTE_VERIFICATION: 'info',
  UNDER_REVIEW: 'info',
  DEFICIENT: 'warning',
  CORRECTION_RECEIVED: 'info',
  DECISION_PENDING: 'info',
  COMPLETED: 'success',
};

export const APPLICATION_STATUS_DESCRIPTION: Record<ApplicationStatus, string> = {
  DRAFT: 'The application is being prepared and has not been submitted yet.',
  SUBMITTED: 'The application has been submitted and is queued for processing.',
  DOCUMENT_VERIFICATION:
    'The submitted documents are being checked. AI findings are advisory and a human reviewer makes the decision.',
  INSTITUTE_VERIFICATION: 'The institute is verifying the enrolment and course information.',
  UNDER_REVIEW: 'The application is under substantive review by a reviewing officer.',
  DEFICIENT: 'A correction has been requested. The student action is listed on the tracking page.',
  CORRECTION_RECEIVED: 'The student has submitted a correction and the application has returned to the queue.',
  DECISION_PENDING: 'The application is at the final decision stage.',
  COMPLETED: 'The application has reached the end of the configured workflow.',
};

export const ALLOWED_STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['DOCUMENT_VERIFICATION'],
  DOCUMENT_VERIFICATION: ['INSTITUTE_VERIFICATION', 'UNDER_REVIEW'],
  INSTITUTE_VERIFICATION: ['UNDER_REVIEW', 'DOCUMENT_VERIFICATION'],
  UNDER_REVIEW: ['DEFICIENT', 'DECISION_PENDING', 'INSTITUTE_VERIFICATION'],
  DEFICIENT: ['CORRECTION_RECEIVED'],
  CORRECTION_RECEIVED: ['UNDER_REVIEW', 'DECISION_PENDING'],
  DECISION_PENDING: ['COMPLETED', 'UNDER_REVIEW'],
  COMPLETED: [],
};

/** Statuses in which a new application to the same scheme is blocked. */
export const OPEN_APPLICATION_STATUSES: ApplicationStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'DOCUMENT_VERIFICATION',
  'INSTITUTE_VERIFICATION',
  'UNDER_REVIEW',
  'DEFICIENT',
  'CORRECTION_RECEIVED',
  'DECISION_PENDING',
];

export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}

export function isOpenStatus(status: ApplicationStatus): boolean {
  return OPEN_APPLICATION_STATUSES.includes(status);
}

/* ------------------------------------------------------------------ */
/* Match status presentation                                           */
/* ------------------------------------------------------------------ */

export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  MATCH: 'Likely Match',
  ACTION_REQUIRED: 'Action Required',
  NOT_MATCHING: 'Not Currently Matching',
};

export const MATCH_STATUS_TONE: Record<MatchStatus, 'success' | 'warning' | 'neutral'> = {
  MATCH: 'success',
  ACTION_REQUIRED: 'warning',
  NOT_MATCHING: 'neutral',
};

/* ------------------------------------------------------------------ */
/* Document presentation                                               */
/* ------------------------------------------------------------------ */

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  ST_CERTIFICATE: 'Scheduled Tribe Certificate',
  INCOME_CERTIFICATE: 'Income Certificate',
  MARKSHEET: 'Marksheet / Academic Record',
  COLLEGE_ID: 'College ID',
  ADMISSION_PROOF: 'Admission Proof',
  ADMISSION_OFFER: 'Admission Offer',
  BONAFIDE_CERTIFICATE: 'Bonafide Certificate',
  BANK_PROOF: 'Bank Proof',
  FEE_RECEIPT: 'Fee Receipt',
  PASSPORT_DOCUMENT: 'Passport Document',
  IDENTITY_DOCUMENT: 'Identity Document',
  OTHER: 'Other Document',
};

export const DOCUMENT_CATEGORY_LABEL: Record<string, string> = {
  IDENTITY: 'Identity',
  CATEGORY: 'Category / ST',
  EDUCATION: 'Education',
  INCOME: 'Income / Household',
  BANK: 'Bank',
  INSTITUTION: 'Institution / Admission',
  OTHER: 'Other',
};

export const DOCUMENT_TYPE_CATEGORY: Record<DocumentType, string> = {
  ST_CERTIFICATE: 'CATEGORY',
  INCOME_CERTIFICATE: 'INCOME',
  MARKSHEET: 'EDUCATION',
  COLLEGE_ID: 'IDENTITY',
  ADMISSION_PROOF: 'INSTITUTION',
  ADMISSION_OFFER: 'INSTITUTION',
  BONAFIDE_CERTIFICATE: 'INSTITUTION',
  BANK_PROOF: 'BANK',
  FEE_RECEIPT: 'INSTITUTION',
  PASSPORT_DOCUMENT: 'IDENTITY',
  IDENTITY_DOCUMENT: 'IDENTITY',
  OTHER: 'OTHER',
};

export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  UPLOADED: 'Available',
  PROCESSING: 'Processing',
  VERIFIED: 'Verified',
  NEEDS_ATTENTION: 'Needs Attention',
  INVALID: 'Invalid',
  EXPIRED: 'Expired',
};

export const DOCUMENT_SOURCE_LABEL = {
  UPLOAD: 'Uploaded',
  DIGILOCKER: 'DigiLocker (Demo)',
  IMPORTED: 'Imported',
} as const;

export const APPLICATION_DOCUMENT_STATUS_LABEL = {
  MISSING: 'Missing',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ACCEPTED: 'Accepted',
  NEEDS_CORRECTION: 'Needs Correction',
} as const;

export const DEFICIENCY_TYPE_LABEL = {
  MISSING_DOCUMENT: 'Missing document',
  INVALID_DOCUMENT: 'Invalid document',
  OUTDATED_DOCUMENT: 'Outdated document',
  INCONSISTENT_INFORMATION: 'Inconsistent information',
  MISSING_INFORMATION: 'Missing information',
  OTHER: 'Other',
} as const;

export const ACTIVITY_EVENT_LABEL = {
  APPLICATION_CREATED: 'Application created',
  APPLICATION_SUBMITTED: 'Application submitted',
  DOCUMENT_UPLOADED: 'Document uploaded',
  DOCUMENT_REVIEWED: 'Document reviewed',
  DOCUMENT_VERIFIED: 'Document verified',
  DEFICIENCY_CREATED: 'Correction requested',
  CORRECTION_SUBMITTED: 'Correction submitted',
  STATUS_CHANGED: 'Status updated',
  APPLICATION_COMPLETED: 'Application completed',
} as const;

export const NOTIFICATION_TYPE_LABEL = {
  APPLICATION_SUBMITTED: 'Application',
  DOCUMENT_UPDATE: 'Document',
  DEFICIENCY_CREATED: 'Correction needed',
  CORRECTION_RECEIVED: 'Correction',
  STATUS_CHANGED: 'Status',
  DOCUMENT_VERIFIED: 'Document',
  SYSTEM: 'System',
} as const;

export const EDUCATION_LEVEL_LABEL = {
  CLASS_10: 'Class X (Secondary)',
  CLASS_12: 'Class XII (Higher Secondary)',
  POST_MATRIC: 'Post-matric',
  UNDERGRADUATE: 'Undergraduate',
  POSTGRADUATE: 'Postgraduate',
  M_PHIL: 'M.Phil',
  PH_D: 'Ph.D',
  POST_DOCTORAL: 'Post-doctoral',
} as const;

export const SOCIAL_CATEGORY_LABEL = {
  ST: 'Scheduled Tribe (ST)',
  SC: 'Scheduled Caste (SC)',
  OBC: 'Other Backward Class (OBC)',
  GENERAL: 'General',
} as const;

export const GENDER_LABEL = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
} as const;
