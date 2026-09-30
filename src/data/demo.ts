import type { DocumentStatus, DocumentType, ExtractedDocumentData } from '@/types';

/**
 * Deterministic synthetic demonstration data.
 * No real student data is used anywhere in Aletheia.
 */

export const DEMO_STUDENT_EMAIL = 'demo.student@aletheia.app';
export const DEMO_ADMIN_EMAIL = 'demo.admin@aletheia.app';
export const DEMO_PASSWORD = 'Aletheia@2026';

export const DEMO_APPLICATION_NUMBER = 'TRB-2026-00841';
export const DEMO_APPLICATION_NUMBER_PREFIX = 'TRB-2026-';
export const DEMO_APPLICATION_SEQUENCE_START = 841;

export const demoStudentProfile = {
  fullName: 'Rahul Kumar',
  dateOfBirth: '2004-07-18',
  gender: 'MALE' as const,
  mobile: '+91 98765 43210',
  email: DEMO_STUDENT_EMAIL,
  state: 'Gujarat',
  district: 'Dahod',
  category: 'ST' as const,
  isST: true,
  isPVTG: false,
  educationLevel: 'UNDERGRADUATE' as const,
  course: 'B.Tech (Computer Engineering)',
  institution: 'Sankalp Institute of Technology, Ahmedabad',
  academicYear: '3rd Year',
  previousQualification: 'Higher Secondary (Class XII), CBSE',
  percentageOrCgpa: '82.4%',
  annualFamilyIncome: 420000,
  householdSize: 5,
  primaryOccupation: 'Daily wage labour',
};

export const demoAdmin = {
  fullName: 'Meera Desai',
  email: DEMO_ADMIN_EMAIL,
  designation: 'Scholarship Review Officer (Demonstration)',
};

export interface SeedDocumentRecord {
  key: string;
  documentType: DocumentType;
  documentName: string;
  source: 'UPLOAD' | 'DIGILOCKER' | 'IMPORTED';
  fileName: string | null;
  status: DocumentStatus;
  uploadedAt: string;
  expiryDate: string | null;
  extractedData: ExtractedDocumentData | null;
  extractionConfidence: number | null;
}

/**
 * Five clean documents plus an income certificate that carries an
 * assistive name-variation finding. The income certificate is the subject of
 * the administrator's correction request in the demo.
 */
export const DEMO_DOCUMENTS: SeedDocumentRecord[] = [
  {
    key: 'doc_st',
    documentType: 'ST_CERTIFICATE',
    documentName: 'Scheduled Tribe Certificate',
    source: 'UPLOAD',
    fileName: 'st-certificate.pdf',
    status: 'VERIFIED',
    uploadedAt: '2026-07-12T09:20:00.000Z',
    expiryDate: null,
    extractedData: {
      name: 'Rahul Kumar',
      certificateType: 'Scheduled Tribe (ST)',
      documentNumber: 'ST-GJ-2019-044271',
      issuingAuthority: 'District Collector, Dahod',
      issueDate: '2019-08-14',
    },
    extractionConfidence: 0.95,
  },
  {
    key: 'doc_marksheet',
    documentType: 'MARKSHEET',
    documentName: 'Class XII Marksheet',
    source: 'UPLOAD',
    fileName: 'class-xii-marksheet.pdf',
    status: 'VERIFIED',
    uploadedAt: '2026-07-12T09:26:00.000Z',
    expiryDate: null,
    extractedData: {
      name: 'Rahul Kumar',
      institution: 'Gujarat Secondary and Higher Secondary Education Board',
      course: 'Higher Secondary (Science)',
    },
    extractionConfidence: 0.92,
  },
  {
    key: 'doc_college_id',
    documentType: 'IDENTITY_DOCUMENT',
    documentName: 'College Identity Card',
    source: 'UPLOAD',
    fileName: 'college-id-card.jpg',
    status: 'VERIFIED',
    uploadedAt: '2026-07-12T09:31:00.000Z',
    expiryDate: '2027-06-30T00:00:00.000Z',
    extractedData: {
      name: 'Rahul Kumar',
      institution: 'Sankalp Institute of Technology, Ahmedabad',
      course: 'B.Tech (Computer Engineering)',
      documentNumber: 'SIT/CE/22/1184',
    },
    extractionConfidence: 0.9,
  },
  {
    key: 'doc_bank',
    documentType: 'BANK_PROOF',
    documentName: 'Bank Passbook Proof',
    source: 'UPLOAD',
    fileName: 'bank-passbook-proof.pdf',
    status: 'VERIFIED',
    uploadedAt: '2026-07-13T11:02:00.000Z',
    expiryDate: null,
    extractedData: {
      name: 'Rahul Kumar',
      documentNumber: 'XXXXXX4417',
      issuingAuthority: 'Bank branch, Anand',
    },
    extractionConfidence: 0.88,
  },
  {
    key: 'doc_admission',
    documentType: 'ADMISSION_PROOF',
    documentName: 'Admission Letter — B.Tech',
    source: 'UPLOAD',
    fileName: 'admission-letter.pdf',
    status: 'VERIFIED',
    uploadedAt: '2026-07-13T11:08:00.000Z',
    expiryDate: null,
    extractedData: {
      name: 'Rahul Kumar',
      institution: 'Sankalp Institute of Technology, Ahmedabad',
      course: 'B.Tech (Computer Engineering)',
      issueDate: '2022-07-28',
    },
    extractionConfidence: 0.93,
  },
  {
    key: 'doc_income',
    documentType: 'INCOME_CERTIFICATE',
    documentName: 'Income Certificate',
    source: 'UPLOAD',
    fileName: 'income-certificate.jpg',
    status: 'NEEDS_ATTENTION',
    uploadedAt: '2026-08-04T15:44:00.000Z',
    expiryDate: '2026-12-31T00:00:00.000Z',
    extractedData: {
      /* Intentional variation used for the assistive consistency-check demo. */
      name: 'Rahul K.',
      income: '420000',
      financialYear: '2025-26',
      issuingAuthority: 'Taluka Panchayat, Dahod',
      issueDate: '2026-02-11',
    },
    extractionConfidence: 0.74,
  },
];

export const DEMO_AI_FINDINGS: Record<string, SeedDocumentRecord & { findings: AiSeedFinding[] }> = {
  doc_income: {
    ...DEMO_DOCUMENTS[5],
    findings: [
      {
        findingType: 'NAME_VARIATION' as const,
        severity: 'WARNING' as const,
        title: 'Possible name variation detected',
        description:
          'The applicant name on this document ("Rahul K.") differs from the name recorded in the student profile ("Rahul Kumar"). This is an observation for human review, not a determination.',
        confidence: 0.72,
      },
      {
        findingType: 'MISSING_FIELD' as const,
        severity: 'INFO' as const,
        title: 'Financial year not explicitly stated',
        description:
          'A financial year could not be read with confidence from this document. The certificate may need to be re-uploaded with the period clearly visible.',
        confidence: 0.51,
      },
    ],
  },
};

export interface AiSeedFinding {
  findingType: 'DOCUMENT_CLASSIFICATION' | 'FIELD_EXTRACTION' | 'NAME_VARIATION' | 'MISSING_FIELD' | 'POSSIBLE_EXPIRY' | 'CONSISTENCY_CHECK';
  severity: 'INFO' | 'WARNING' | 'HIGH';
  title: string;
  description: string;
  confidence: number | null;
}

/** Documents already attached to the seeded demonstration application. */
export const DEMO_APPLICATION_DOCUMENTS: {
  documentKey: string;
  requiredDocumentType: DocumentType;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'NEEDS_CORRECTION' | 'MISSING';
  reviewNotes: string | null;
}[] = [
  {
    documentKey: 'doc_st',
    requiredDocumentType: 'ST_CERTIFICATE',
    status: 'ACCEPTED',
    reviewNotes: 'Scheduled Tribe certificate verified against the issued record.',
  },
  {
    documentKey: 'doc_marksheet',
    requiredDocumentType: 'MARKSHEET',
    status: 'ACCEPTED',
    reviewNotes: 'Academic record legible and consistent with the profile.',
  },
  {
    documentKey: 'doc_college_id',
    requiredDocumentType: 'IDENTITY_DOCUMENT',
    status: 'ACCEPTED',
    reviewNotes: 'Institution identity card verified.',
  },
  {
    documentKey: 'doc_bank',
    requiredDocumentType: 'BANK_PROOF',
    status: 'ACCEPTED',
    reviewNotes: 'Account proof accepted for the current cycle.',
  },
  {
    documentKey: 'doc_admission',
    requiredDocumentType: 'ADMISSION_PROOF',
    status: 'ACCEPTED',
    reviewNotes: 'Admission proof matches the declared course and institution.',
  },
  {
    documentKey: 'doc_income',
    requiredDocumentType: 'INCOME_CERTIFICATE',
    status: 'NEEDS_CORRECTION',
    reviewNotes: 'Name on the certificate differs from the profile. Correction requested.',
  },
];

export const DEMO_APPLICATION = {
  applicationNumber: DEMO_APPLICATION_NUMBER,
  schemeSlug: 'post-matric-st',
  status: 'UNDER_REVIEW' as const,
  cycleLabel: '2025-26',
  currentStep: 6,
  submittedAt: '2026-08-06T10:12:00.000Z',
  createdAt: '2026-08-05T17:40:00.000Z',
};
