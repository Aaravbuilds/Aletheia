/* Shared domain types for Aletheia.
 * Values follow docs/06-DATA-AI-SPECS.md (data model) and
 * docs/source-of-truth/*.md (scheme information).
 */

export type UserRole = 'STUDENT' | 'ADMIN';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export type SocialCategory = 'ST' | 'SC' | 'OBC' | 'GENERAL';

export type EducationLevel =
  | 'CLASS_10'
  | 'CLASS_12'
  | 'POST_MATRIC'
  | 'UNDERGRADUATE'
  | 'POSTGRADUATE'
  | 'M_PHIL'
  | 'PH_D'
  | 'POST_DOCTORAL';

export type SchemeType = 'SCHOLARSHIP' | 'FELLOWSHIP';

export type SchemeClass = 'CENTRALLY_SPONSORED' | 'CENTRAL_SECTOR';

/* ------------------------------------------------------------------ */
/* Eligibility rules                                                   */
/* ------------------------------------------------------------------ */

export type EligibilityRuleType =
  | 'CATEGORY'
  | 'ST_STATUS'
  | 'PVTG_STATUS'
  | 'EDUCATION_LEVEL'
  | 'FAMILY_INCOME'
  | 'STATE'
  | 'INSTITUTION'
  | 'COURSE'
  | 'ACADEMIC_SCORE';

export type EligibilityOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'LESS_THAN_OR_EQUAL'
  | 'GREATER_THAN_OR_EQUAL'
  | 'IN'
  | 'IN_LIST'
  | 'EXISTS'
  | 'REQUIRES_VERIFICATION';

export type RuleOutcome = 'MET' | 'UNMET' | 'INFORMATION_REQUIRED' | 'VERIFICATION_REQUIRED';

export interface EligibilityRule {
  id: string;
  schemeId: string;
  ruleType: EligibilityRuleType;
  operator: EligibilityOperator;
  /** JSON-encoded rule operand. */
  value: string | null;
  label: string;
  description: string;
  required: boolean;
  sortOrder: number;
}

/* ------------------------------------------------------------------ */
/* Required documents                                                  */
/* ------------------------------------------------------------------ */

export type DocumentType =
  | 'ST_CERTIFICATE'
  | 'INCOME_CERTIFICATE'
  | 'MARKSHEET'
  | 'COLLEGE_ID'
  | 'ADMISSION_PROOF'
  | 'ADMISSION_OFFER'
  | 'BONAFIDE_CERTIFICATE'
  | 'BANK_PROOF'
  | 'FEE_RECEIPT'
  | 'PASSPORT_DOCUMENT'
  | 'IDENTITY_DOCUMENT'
  | 'OTHER';

export type DocumentCategory =
  | 'IDENTITY'
  | 'CATEGORY'
  | 'EDUCATION'
  | 'INCOME'
  | 'BANK'
  | 'INSTITUTION'
  | 'OTHER';

/**
 * `VERIFIED`  — the requirement is stated in the recorded official source.
 * `INDICATIVE` — the source lists the item as potential/typical application
 *               information but states the exact list must be taken from the
 *               current official application instructions.
 */
export type RequirementSource = 'VERIFIED' | 'INDICATIVE';

export interface RequiredDocument {
  id: string;
  schemeId: string;
  documentType: DocumentType;
  documentName: string;
  required: boolean;
  description: string;
  requirementSource: RequirementSource;
  sortOrder: number;
}

/* ------------------------------------------------------------------ */
/* Schemes                                                             */
/* ------------------------------------------------------------------ */

export interface ScholarshipScheme {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  targetGroup: string;
  type: SchemeType;
  schemeClass: SchemeClass;
  provider: string;
  isActive: boolean;
  applicationStartDate: string | null;
  applicationEndDate: string | null;
  selectionYear: string | null;
  schemeVersion: string;
  lastVerifiedAt: string;
  sourceUrl: string;
  sourceTitle: string;
  /** Scheme notes sourced verbatim (or near-verbatim) from the source-of-truth files. */
  benefits: string[];
  importantNotes: string[];
  benefitsVerificationNote: string | null;
  applicationChannelNote: string;
}

export interface SchemeWithRelations extends ScholarshipScheme {
  rules: EligibilityRule[];
  requiredDocuments: RequiredDocument[];
}

/* ------------------------------------------------------------------ */
/* Matching                                                            */
/* ------------------------------------------------------------------ */

export type MatchStatus = 'MATCH' | 'ACTION_REQUIRED' | 'NOT_MATCHING';

export interface MatchCondition {
  ruleId: string;
  label: string;
  description: string;
  outcome: RuleOutcome;
  required: boolean;
  /** Human readable reason, e.g. "Family income is ₹4,20,000 (published limit ₹2,50,000)." */
  detail: string;
}

export interface DocumentReadinessItem {
  requiredDocument: RequiredDocument;
  document: StudentDocument | null;
  state: 'AVAILABLE' | 'NEEDS_ATTENTION' | 'EXPIRED' | 'MISSING';
}

export interface DocumentReadiness {
  requiredCount: number;
  availableCount: number;
  missingCount: number;
  attentionCount: number;
  items: DocumentReadinessItem[];
}

export interface SchemeMatchResult {
  scheme: ScholarshipScheme;
  status: MatchStatus;
  statusLabel: string;
  conditions: MatchCondition[];
  matchedConditions: MatchCondition[];
  unmetConditions: MatchCondition[];
  informationNeeded: MatchCondition[];
  readiness: DocumentReadiness;
  application: {
    id: string;
    applicationNumber: string;
    status: ApplicationStatus;
  } | null;
}

/* ------------------------------------------------------------------ */
/* Student profile                                                     */
/* ------------------------------------------------------------------ */

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  mobile: string | null;
  email: string;
  state: string | null;
  district: string | null;
  category: SocialCategory | null;
  isST: boolean;
  isPVTG: boolean;
  educationLevel: EducationLevel | null;
  course: string | null;
  institution: string | null;
  academicYear: string | null;
  previousQualification: string | null;
  percentageOrCgpa: string | null;
  annualFamilyIncome: number | null;
  householdSize: number | null;
  primaryOccupation: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileSectionStatus {
  key: 'personal' | 'category' | 'education' | 'household';
  label: string;
  completion: number;
  missingFields: string[];
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

export type DocumentSource = 'UPLOAD' | 'DIGILOCKER' | 'IMPORTED';

export type DocumentStatus =
  | 'UPLOADED'
  | 'PROCESSING'
  | 'VERIFIED'
  | 'NEEDS_ATTENTION'
  | 'INVALID'
  | 'EXPIRED';

export interface ExtractedDocumentData {
  name?: string | null;
  income?: number | string | null;
  financialYear?: string | null;
  institution?: string | null;
  course?: string | null;
  certificateType?: string | null;
  issuingAuthority?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  documentNumber?: string | null;
  [key: string]: string | number | null | undefined;
}

export interface StudentDocument {
  id: string;
  studentId: string;
  documentType: DocumentType;
  documentName: string;
  source: DocumentSource;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  /** True when a stored file exists for this document (served through the authenticated file route). */
  hasFile: boolean;
  status: DocumentStatus;
  uploadedAt: string;
  expiryDate: string | null;
  extractedData: ExtractedDocumentData | null;
  extractionConfidence: number | null;
  createdAt: string;
  updatedAt: string;
  findings?: DocumentAiFinding[];
}

export type AiFindingType =
  | 'DOCUMENT_CLASSIFICATION'
  | 'FIELD_EXTRACTION'
  | 'NAME_VARIATION'
  | 'MISSING_FIELD'
  | 'POSSIBLE_EXPIRY'
  | 'CONSISTENCY_CHECK';

export type AiFindingSeverity = 'INFO' | 'WARNING' | 'HIGH';

export interface DocumentAiFinding {
  id: string;
  documentId: string;
  findingType: AiFindingType;
  severity: AiFindingSeverity;
  title: string;
  description: string;
  confidence: number | null;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Applications                                                        */
/* ------------------------------------------------------------------ */

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'DOCUMENT_VERIFICATION'
  | 'INSTITUTE_VERIFICATION'
  | 'UNDER_REVIEW'
  | 'DEFICIENT'
  | 'CORRECTION_RECEIVED'
  | 'DECISION_PENDING'
  | 'COMPLETED';

export type ApplicationDocumentStatus =
  | 'MISSING'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'NEEDS_CORRECTION';

export interface ApplicationSnapshot {
  fullName: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  category: SocialCategory | null;
  isST: boolean;
  isPVTG: boolean;
  state: string | null;
  district: string | null;
  educationLevel: EducationLevel | null;
  course: string | null;
  institution: string | null;
  academicYear: string | null;
  previousQualification: string | null;
  percentageOrCgpa: string | null;
  annualFamilyIncome: number | null;
  householdSize: number | null;
  primaryOccupation: string | null;
  capturedAt: string;
}

export interface ApplicationDraftData {
  personal: {
    fullName: string;
    dateOfBirth: string;
    gender: Gender | '';
    mobile: string;
    email: string;
    state: string;
    district: string;
  };
  education: {
    educationLevel: EducationLevel | '';
    course: string;
    institution: string;
    academicYear: string;
    previousQualification: string;
    percentageOrCgpa: string;
  };
  household: {
    annualFamilyIncome: string;
    householdSize: string;
    primaryOccupation: string;
    category: SocialCategory | '';
    isST: boolean;
    isPVTG: boolean;
  };
  documents: Record<string, string>;
  declaration: {
    accepted: boolean;
  };
}

export interface ApplicationRecord {
  id: string;
  applicationNumber: string;
  studentId: string;
  schemeId: string;
  status: ApplicationStatus;
  snapshot: ApplicationSnapshot | null;
  draftData: ApplicationDraftData | null;
  currentStep: number;
  declarationAccepted: boolean;
  cycleLabel: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationDocumentRecord {
  id: string;
  applicationId: string;
  documentId: string | null;
  requiredDocumentType: DocumentType;
  status: ApplicationDocumentStatus;
  isReplacement: boolean;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
}

/* ------------------------------------------------------------------ */
/* Deficiencies, activity, notifications                                */
/* ------------------------------------------------------------------ */

export type DeficiencyType =
  | 'MISSING_DOCUMENT'
  | 'INVALID_DOCUMENT'
  | 'OUTDATED_DOCUMENT'
  | 'INCONSISTENT_INFORMATION'
  | 'MISSING_INFORMATION'
  | 'OTHER';

export type DeficiencyStatus = 'OPEN' | 'RESOLVED' | 'REVIEWED';

export interface Deficiency {
  id: string;
  applicationId: string;
  documentId: string | null;
  requiredDocumentType: DocumentType | null;
  type: DeficiencyType;
  title: string;
  description: string;
  requiredAction: string;
  status: DeficiencyStatus;
  createdBy: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolvedDocumentId: string | null;
}

export type ActivityEventType =
  | 'APPLICATION_CREATED'
  | 'APPLICATION_SUBMITTED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_REVIEWED'
  | 'DOCUMENT_VERIFIED'
  | 'DEFICIENCY_CREATED'
  | 'CORRECTION_SUBMITTED'
  | 'STATUS_CHANGED'
  | 'APPLICATION_COMPLETED';

export type ActorRole = 'STUDENT' | 'ADMIN' | 'SYSTEM' | 'AI';

export interface ApplicationActivity {
  id: string;
  applicationId: string;
  actorId: string | null;
  actorRole: ActorRole;
  eventType: ActivityEventType;
  description: string;
  metadata: Record<string, string> | null;
  createdAt: string;
}

export type NotificationType =
  | 'APPLICATION_SUBMITTED'
  | 'DOCUMENT_UPDATE'
  | 'DEFICIENCY_CREATED'
  | 'CORRECTION_RECEIVED'
  | 'STATUS_CHANGED'
  | 'DOCUMENT_VERIFIED'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedApplicationId: string | null;
  relatedDocumentId: string | null;
  isRead: boolean;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* AI / DigiLocker service contracts                                   */
/* ------------------------------------------------------------------ */

export interface AiFindingDraft {
  type: AiFindingType;
  severity: AiFindingSeverity;
  title: string;
  description: string;
  confidence: number | null;
}

export interface DocumentAnalysisResult {
  documentType: DocumentType;
  documentName: string;
  confidence: number;
  fields: ExtractedDocumentData;
  findings: AiFindingDraft[];
  provider: 'GROQ' | 'MOCK';
  /** Set when AI processing was unavailable and the result is a fallback. */
  degraded: boolean;
  note: string | null;
}

export interface DigiLockerDocument {
  externalId: string;
  documentType: DocumentType;
  documentName: string;
  issuer: string;
  issuedOn: string;
  sizeLabel: string;
}

export interface ProfileCompletion {
  percent: number;
  sections: ProfileSectionStatus[];
  missingFields: string[];
  isComplete: boolean;
}
