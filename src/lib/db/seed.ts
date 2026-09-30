/**
 * Deterministic seed for the Aletheia prototype.
 *
 *   npm run db:seed    — seed only when the database is empty
 *   npm run db:reset   — wipe and re-seed
 *
 * Keep the schema/plan of this module dependency-free of Next request
 * lifecycle: it is imported by src/lib/db/client.ts so the database can be
 * auto-seeded on first open (serverless /tmp databases start empty).
 *
 * Scheme data comes from src/data/schemes.ts (docs/source-of-truth/*.md).
 * All personal data is synthetic.
 */

import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';

import { getDb, nowIso, stringifyJson } from './client';
import { hashPassword } from '../auth/password';
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_EMAIL as ADMIN_EMAIL,
  DEMO_APPLICATION,
  DEMO_APPLICATION_DOCUMENTS,
  DEMO_APPLICATION_SEQUENCE_START,
  DEMO_AI_FINDINGS,
  DEMO_DOCUMENTS,
  DEMO_PASSWORD,
  DEMO_STUDENT_EMAIL,
  demoAdmin,
  demoStudentProfile,
} from '../../data/demo';
import { SEED_SCHEMES, SCHEME_VERIFIED_AT } from '../../data/schemes';

export interface SeedOptions {
  reset?: boolean;
  log?: boolean;
}

let LOG = true;

function log(message: string): void {
  if (LOG) console.log(message);
}

export function databaseFile(): string {
  return path.resolve(process.cwd(), process.env.DATABASE_PATH || '.data/aletheia.db');
}

export function wipeDatabase(): void {
  const file = databaseFile();
  for (const suffix of ['', '-wal', '-shm']) {
    const target = `${file}${suffix}`;
    if (existsSync(target)) rmSync(target);
  }
  log(`· cleared ${path.relative(process.cwd(), file)}`);
}

function seedSchemes(): Map<string, string> {
  const db = getDb();
  const ids = new Map<string, string>();

  const insertScheme = db.prepare(
    `INSERT INTO scholarship_schemes
      (id, slug, name, short_name, description, target_group, type, scheme_class, provider, is_active,
       application_start_date, application_end_date, selection_year, scheme_version, last_verified_at,
       source_url, source_title, benefits_json, notes_json, benefits_verification_note,
       application_channel_note, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const insertRule = db.prepare(
    `INSERT INTO eligibility_rules
      (id, scheme_id, rule_type, operator, value, label, description, required, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const insertDocument = db.prepare(
    `INSERT INTO required_documents
      (id, scheme_id, document_type, document_name, required, description, requirement_source, sort_order)
     VALUES (?, ?, ?, ?, 1, ?, ?, ?)`,
  );

  SEED_SCHEMES.forEach((scheme, index) => {
    const schemeId = `scheme_${scheme.slug}`;
    ids.set(scheme.slug, schemeId);

    insertScheme.run(
      schemeId,
      scheme.slug,
      scheme.name,
      scheme.shortName,
      scheme.description,
      scheme.targetGroup,
      scheme.type,
      scheme.schemeClass,
      scheme.provider,
      scheme.selectionYear,
      scheme.schemeVersion,
      SCHEME_VERIFIED_AT,
      scheme.sourceUrl,
      scheme.sourceTitle,
      stringifyJson(scheme.benefits),
      stringifyJson(scheme.importantNotes),
      scheme.benefitsVerificationNote,
      scheme.applicationChannelNote,
      index + 1,
      SCHEME_VERIFIED_AT,
      SCHEME_VERIFIED_AT,
    );

    scheme.rules.forEach((rule, ruleIndex) => {
      insertRule.run(
        `rule_${scheme.slug}_${ruleIndex + 1}`,
        schemeId,
        rule.ruleType,
        rule.operator,
        rule.value,
        rule.label,
        rule.description,
        rule.required === false ? 0 : 1,
        ruleIndex + 1,
      );
    });

    scheme.documents.forEach((document, documentIndex) => {
      insertDocument.run(
        `reqdoc_${scheme.slug}_${documentIndex + 1}`,
        schemeId,
        document.documentType,
        document.documentName,
        document.description,
        document.requirementSource,
        documentIndex + 1,
      );
    });

    log(`· scheme ${scheme.shortName} (${scheme.rules.length} rules, ${scheme.documents.length} documents)`);
  });

  return ids;
}

function seedUsers(): { studentUserId: string; adminUserId: string; studentId: string } {
  const db = getDb();
  const now = nowIso();
  const passwordHash = hashPassword(DEMO_PASSWORD);

  const studentUserId = `usr_${DEMO_STUDENT_EMAIL.replace(/[^a-z0-9]/gi, '').slice(0, 18).toLowerCase()}`;
  const adminUserId = `usr_${DEMO_ADMIN_EMAIL.replace(/[^a-z0-9]/gi, '').slice(0, 18).toLowerCase()}`;

  const insertUser = db.prepare(
    'INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  insertUser.run(studentUserId, DEMO_STUDENT_EMAIL, passwordHash, demoStudentProfile.fullName, 'STUDENT', now, now);
  insertUser.run(adminUserId, ADMIN_EMAIL, passwordHash, demoAdmin.fullName, 'ADMIN', now, now);

  const studentId = 'stu_demo_rahul';
  db.prepare(
    `INSERT INTO student_profiles
      (id, user_id, full_name, date_of_birth, gender, mobile, email, state, district, category, is_st, is_pvtg,
       education_level, course, institution, academic_year, previous_qualification, percentage_or_cgpa,
       annual_family_income, household_size, primary_occupation, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    studentId,
    studentUserId,
    demoStudentProfile.fullName,
    demoStudentProfile.dateOfBirth,
    demoStudentProfile.gender,
    demoStudentProfile.mobile,
    demoStudentProfile.email,
    demoStudentProfile.state,
    demoStudentProfile.district,
    demoStudentProfile.category,
    demoStudentProfile.isST ? 1 : 0,
    demoStudentProfile.isPVTG ? 1 : 0,
    demoStudentProfile.educationLevel,
    demoStudentProfile.course,
    demoStudentProfile.institution,
    demoStudentProfile.academicYear,
    demoStudentProfile.previousQualification,
    demoStudentProfile.percentageOrCgpa,
    demoStudentProfile.annualFamilyIncome,
    demoStudentProfile.householdSize,
    demoStudentProfile.primaryOccupation,
    now,
    now,
  );

  log(`· student ${demoStudentProfile.fullName} <${DEMO_STUDENT_EMAIL}>`);
  log(`· admin    ${demoAdmin.fullName} <${DEMO_ADMIN_EMAIL}>`);

  return { studentUserId, adminUserId, studentId };
}

function seedDocuments(studentId: string): Map<string, string> {
  const db = getDb();
  const insertDocument = db.prepare(
    `INSERT INTO documents
      (id, student_id, document_type, document_name, source, file_name, storage_key, mime_type, file_size,
       status, uploaded_at, expiry_date, extracted_data, extraction_confidence, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertFinding = db.prepare(
    `INSERT INTO document_ai_findings
      (id, document_id, finding_type, severity, title, description, confidence, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const ids = new Map<string, string>();
  DEMO_DOCUMENTS.forEach((record) => {
    const documentId = record.key;
    ids.set(record.key, documentId);
    insertDocument.run(
      documentId,
      studentId,
      record.documentType,
      record.documentName,
      record.source,
      record.fileName,
      record.status,
      record.uploadedAt,
      record.expiryDate,
      stringifyJson(record.extractedData),
      record.extractionConfidence,
      record.uploadedAt,
      record.uploadedAt,
    );

    const findings = DEMO_AI_FINDINGS[record.key]?.findings ?? [];
    findings.forEach((finding, findingIndex) => {
      insertFinding.run(
        `${documentId}_finding_${findingIndex + 1}`,
        documentId,
        finding.findingType,
        finding.severity,
        finding.title,
        finding.description,
        finding.confidence,
        record.uploadedAt,
      );
    });

    log(`· document ${record.documentName} [${record.status}]${findings.length ? ` (${findings.length} findings)` : ''}`);
  });

  return ids;
}

function seedApplication(
  studentId: string,
  studentUserId: string,
  adminUserId: string,
  schemeIds: Map<string, string>,
  documentIds: Map<string, string>,
): void {
  const db = getDb();
  const schemeId = schemeIds.get(DEMO_APPLICATION.schemeSlug);
  if (!schemeId) throw new Error(`Unknown demo scheme slug: ${DEMO_APPLICATION.schemeSlug}`);

  const applicationId = 'app_demo_00841';
  const snapshot = {
    fullName: demoStudentProfile.fullName,
    dateOfBirth: demoStudentProfile.dateOfBirth,
    gender: demoStudentProfile.gender,
    category: demoStudentProfile.category,
    isST: demoStudentProfile.isST,
    isPVTG: demoStudentProfile.isPVTG,
    state: demoStudentProfile.state,
    district: demoStudentProfile.district,
    educationLevel: demoStudentProfile.educationLevel,
    course: demoStudentProfile.course,
    institution: demoStudentProfile.institution,
    academicYear: demoStudentProfile.academicYear,
    previousQualification: demoStudentProfile.previousQualification,
    percentageOrCgpa: demoStudentProfile.percentageOrCgpa,
    annualFamilyIncome: demoStudentProfile.annualFamilyIncome,
    householdSize: demoStudentProfile.householdSize,
    primaryOccupation: demoStudentProfile.primaryOccupation,
    capturedAt: DEMO_APPLICATION.submittedAt,
  };

  db.prepare(
    `INSERT INTO applications
      (id, application_number, student_id, scheme_id, status, snapshot_json, draft_json, current_step,
       declaration_accepted, cycle_label, submitted_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL, ?, 1, ?, ?, ?, ?)`,
  ).run(
    applicationId,
    DEMO_APPLICATION.applicationNumber,
    studentId,
    schemeId,
    DEMO_APPLICATION.status,
    stringifyJson(snapshot),
    DEMO_APPLICATION.currentStep,
    DEMO_APPLICATION.cycleLabel,
    DEMO_APPLICATION.submittedAt,
    DEMO_APPLICATION.createdAt,
    DEMO_APPLICATION.submittedAt,
  );

  const insertAppDoc = db.prepare(
    `INSERT INTO application_documents
      (id, application_id, document_id, required_document_type, status, is_replacement, submitted_at, reviewed_at, review_notes)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
  );
  DEMO_APPLICATION_DOCUMENTS.forEach((record, index) => {
    insertAppDoc.run(
      `appdoc_00841_${index + 1}`,
      applicationId,
      documentIds.get(record.documentKey) ?? null,
      record.requiredDocumentType,
      record.status,
      DEMO_APPLICATION.submittedAt,
      record.status === 'SUBMITTED' ? null : '2026-08-28T11:05:00.000Z',
      record.reviewNotes,
    );
  });

  const insertActivity = db.prepare(
    `INSERT INTO application_activity
      (id, application_id, actor_id, actor_role, event_type, description, metadata_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const timeline: { id: string; role: string; type: string; description: string; at: string; metadata: string | null }[] = [
    {
      id: 'act_00841_1',
      role: 'STUDENT',
      type: 'APPLICATION_CREATED',
      description: 'Draft application created for the Post-Matric Scholarship Scheme for ST Students.',
      at: DEMO_APPLICATION.createdAt,
      metadata: null,
    },
    {
      id: 'act_00841_2',
      role: 'STUDENT',
      type: 'APPLICATION_SUBMITTED',
      description: `Application ${DEMO_APPLICATION.applicationNumber} submitted with 6 documents.`,
      at: DEMO_APPLICATION.submittedAt,
      metadata: stringifyJson({ applicationNumber: DEMO_APPLICATION.applicationNumber }),
    },
    {
      id: 'act_00841_3',
      role: 'ADMIN',
      type: 'STATUS_CHANGED',
      description: 'Status updated to Document Verification.',
      at: '2026-08-09T09:30:00.000Z',
      metadata: stringifyJson({ from: 'SUBMITTED', to: 'DOCUMENT_VERIFICATION' }),
    },
    {
      id: 'act_00841_4',
      role: 'AI',
      type: 'DOCUMENT_REVIEWED',
      description:
        'Pre-screening pass completed: 6 documents read, 1 possible name variation flagged for human review.',
      at: '2026-08-09T09:31:00.000Z',
      metadata: null,
    },
    {
      id: 'act_00841_5',
      role: 'ADMIN',
      type: 'STATUS_CHANGED',
      description: 'Status updated to Under Review.',
      at: '2026-08-14T15:20:00.000Z',
      metadata: stringifyJson({ from: 'DOCUMENT_VERIFICATION', to: 'UNDER_REVIEW' }),
    },
    {
      id: 'act_00841_6',
      role: 'ADMIN',
      type: 'DOCUMENT_REVIEWED',
      description: 'Five documents accepted. Income Certificate marked as needing correction.',
      at: '2026-08-28T11:05:00.000Z',
      metadata: null,
    },
  ];
  timeline.forEach((event) => {
    insertActivity.run(
      event.id,
      applicationId,
      event.role === 'STUDENT' ? studentUserId : null,
      event.role,
      event.type,
      event.description,
      event.metadata,
      event.at,
    );
  });

  db.prepare(
    `INSERT INTO notifications (id, user_id, type, title, message, related_application_id, related_document_id, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
  ).run(
    'ntf_demo_1',
    studentUserId,
    'STATUS_CHANGED',
    'Application moved to Under Review',
    `${DEMO_APPLICATION.applicationNumber} is now being reviewed by a reviewing officer.`,
    applicationId,
    null,
    '2026-08-14T15:21:00.000Z',
  );

  db.prepare(
    `INSERT INTO notifications (id, user_id, type, title, message, related_application_id, related_document_id, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
  ).run(
    'ntf_demo_2',
    studentUserId,
    'DOCUMENT_UPDATE',
    'Income Certificate needs attention',
    'A reviewer found a possible name variation on your Income Certificate. Open the application to see the details.',
    applicationId,
    documentIds.get('doc_income') ?? null,
    '2026-08-28T11:06:00.000Z',
  );

  db.prepare(
    `INSERT INTO notifications (id, user_id, type, title, message, related_application_id, related_document_id, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
  ).run(
    'ntf_demo_admin_1',
    adminUserId,
    'STATUS_CHANGED',
    'Application reached Under Review',
    `${DEMO_APPLICATION.applicationNumber} (Rahul Kumar) is under substantive review. Check the pre-screening observations before deciding.`,
    applicationId,
    null,
    '2026-08-14T15:21:00.000Z',
  );

  db.prepare(
    `INSERT INTO notifications (id, user_id, type, title, message, related_application_id, related_document_id, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
  ).run(
    'ntf_demo_admin_2',
    adminUserId,
    'DEFICIENCY_CREATED',
    'Correction requested',
    'Income Certificate — correction needed for TRB-2026-00841. Awaiting the student response.',
    applicationId,
    documentIds.get('doc_income') ?? null,
    '2026-08-28T11:06:00.000Z',
  );

  db.prepare(
    "INSERT INTO app_counters (key, value) VALUES ('application_sequence', ?)"
  ).run(DEMO_APPLICATION_SEQUENCE_START);

  db.prepare(
    `INSERT INTO deficiencies
      (id, application_id, document_id, required_document_type, type, title, description,
       required_action, status, created_by, created_at, resolved_at, resolved_document_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?, NULL, NULL)`,
  ).run(
    'def_demo_00841',
    applicationId,
    documentIds.get('doc_income') ?? null,
    'INCOME_CERTIFICATE',
    'INVALID_DOCUMENT',
    'Income Certificate — correction needed',
    'Possible name variation: the certificate shows "Rahul K." while the application lists "Rahul Kumar".',
    'Upload a corrected or valid Income Certificate to your wallet and send it here.',
    adminUserId,
    '2026-08-28T11:05:00.000Z',
  );

  log(`· application ${DEMO_APPLICATION.applicationNumber} [${DEMO_APPLICATION.status}]`);
}

/**
 * Wipe (optionally) and seed the prototype database.
 *
 * `reset: true` deletes the database files first. When the database already
 * contains users the seed is skipped. `log: false` silences output (used by
 * the automatic serverless first-open seed).
 */
export function seedDatabase(options: SeedOptions = {}): void {
  LOG = options.log ?? true;

  log('Aletheia — seeding prototype database');
  if (options.reset) wipeDatabase();

  const db = getDb();
  const existing = db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number };
  if (existing.count > 0) {
    log('· database already contains data — nothing to do. Use `npm run db:reset` to rebuild.');
    return;
  }

  const schemeIds = seedSchemes();
  const { studentUserId, adminUserId, studentId } = seedUsers();
  const documentIds = seedDocuments(studentId);
  seedApplication(studentId, studentUserId, adminUserId, schemeIds, documentIds);

  log('');
  log('Seed complete.');
  log(`  Student: ${DEMO_STUDENT_EMAIL} / ${DEMO_PASSWORD}`);
  log(`  Admin:   ${DEMO_ADMIN_EMAIL} / ${DEMO_PASSWORD}`);
  log('');
}