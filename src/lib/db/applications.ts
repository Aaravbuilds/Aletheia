import { getDb, newId, nowIso, parseJson, stringifyJson } from '@/lib/db/client';
import { attachFindings, getDocumentById } from '@/lib/db/documents';
import { getProfileById } from '@/lib/db/profiles';
import { getSchemeById } from '@/lib/db/schemes';
import { canTransition, isOpenStatus } from '@/lib/domain/workflow';
import type {
  ActorRole,
  ActivityEventType,
  AppNotification,
  ApplicationActivity,
  ApplicationDocumentRecord,
  ApplicationDocumentStatus,
  ApplicationDraftData,
  ApplicationRecord,
  ApplicationSnapshot,
  ApplicationStatus,
  DocumentType,
  NotificationType,
} from '@/types';

/* ------------------------------------------------------------------ */
/* Activity                                                            */
/* ------------------------------------------------------------------ */

interface ActivityRow {
  id: string;
  application_id: string;
  actor_id: string | null;
  actor_role: ActorRole;
  event_type: ActivityEventType;
  description: string;
  metadata_json: string | null;
  created_at: string;
}

function mapActivity(row: ActivityRow): ApplicationActivity {
  return {
    id: row.id,
    applicationId: row.application_id,
    actorId: row.actor_id,
    actorRole: row.actor_role,
    eventType: row.event_type,
    description: row.description,
    metadata: parseJson<Record<string, string> | null>(row.metadata_json, null),
    createdAt: row.created_at,
  };
}

export function recordActivity(input: {
  applicationId: string;
  actorId?: string | null;
  actorRole: ActorRole;
  eventType: ActivityEventType;
  description: string;
  metadata?: Record<string, string> | null;
}): void {
  getDb()
    .prepare(
      `INSERT INTO application_activity
        (id, application_id, actor_id, actor_role, event_type, description, metadata_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      newId('act'),
      input.applicationId,
      input.actorId ?? null,
      input.actorRole,
      input.eventType,
      input.description,
      stringifyJson(input.metadata ?? null),
      nowIso(),
    );
}

export function listActivity(applicationId: string): ApplicationActivity[] {
  const rows = getDb()
    .prepare('SELECT * FROM application_activity WHERE application_id = ? ORDER BY created_at ASC, rowid ASC')
    .all(applicationId) as ActivityRow[];
  return rows.map(mapActivity);
}

export function listRecentActivity(limit = 20): (ApplicationActivity & { applicationNumber: string })[] {
  const rows = getDb()
    .prepare(
      `SELECT a.*, ap.application_number FROM application_activity a
       JOIN applications ap ON ap.id = a.application_id
       ORDER BY a.created_at DESC, a.rowid DESC LIMIT ?`,
    )
    .all(limit) as (ActivityRow & { application_number: string })[];
  return rows.map((row) => ({ ...mapActivity(row), applicationNumber: row.application_number }));
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_application_id: string | null;
  related_document_id: string | null;
  is_read: number;
  created_at: string;
}

function mapNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    relatedApplicationId: row.related_application_id,
    relatedDocumentId: row.related_document_id,
    isRead: row.is_read === 1,
    createdAt: row.created_at,
  };
}

export function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedApplicationId?: string | null;
  relatedDocumentId?: string | null;
}): void {
  getDb()
    .prepare(
      `INSERT INTO notifications
        (id, user_id, type, title, message, related_application_id, related_document_id, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    )
    .run(
      newId('ntf'),
      input.userId,
      input.type,
      input.title,
      input.message,
      input.relatedApplicationId ?? null,
      input.relatedDocumentId ?? null,
      nowIso(),
    );
}

export function listNotifications(userId: string, limit = 50): AppNotification[] {
  const rows = getDb()
    .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
    .all(userId, limit) as NotificationRow[];
  return rows.map(mapNotification);
}

export function listAdminUsers(): { id: string; fullName: string; email: string }[] {
  const rows = getDb()
    .prepare("SELECT id, full_name AS fullName, email FROM users WHERE role = 'ADMIN' ORDER BY created_at")
    .all() as { id: string; fullName: string; email: string }[];
  return rows;
}

export function createNotificationForAdmins(input: {
  type: NotificationType;
  title: string;
  message: string;
  relatedApplicationId?: string | null;
  relatedDocumentId?: string | null;
  excludeUserId?: string | null;
}): void {
  for (const admin of listAdminUsers()) {
    if (input.excludeUserId && admin.id === input.excludeUserId) continue;
    createNotification({
      userId: admin.id,
      type: input.type,
      title: input.title,
      message: input.message,
      relatedApplicationId: input.relatedApplicationId,
      relatedDocumentId: input.relatedDocumentId,
    });
  }
}

export function unreadNotificationCount(userId: string): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0')
    .get(userId) as { count: number };
  return row.count;
}

export function markNotificationsRead(userId: string): void {
  getDb().prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(userId);
}

/* ------------------------------------------------------------------ */
/* Applications                                                        */
/* ------------------------------------------------------------------ */

export interface ApplicationRow {
  id: string;
  application_number: string;
  student_id: string;
  scheme_id: string;
  status: ApplicationStatus;
  snapshot_json: string | null;
  draft_json: string | null;
  current_step: number;
  declaration_accepted: number;
  cycle_label: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ApplicationDocumentRow {
  id: string;
  application_id: string;
  document_id: string | null;
  required_document_type: DocumentType;
  status: ApplicationDocumentStatus;
  is_replacement: number;
  submitted_at: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
}

export function mapApplication(row: ApplicationRow): ApplicationRecord {
  return {
    id: row.id,
    applicationNumber: row.application_number,
    studentId: row.student_id,
    schemeId: row.scheme_id,
    status: row.status,
    snapshot: parseJson<ApplicationSnapshot | null>(row.snapshot_json, null),
    draftData: parseJson<ApplicationDraftData | null>(row.draft_json, null),
    currentStep: row.current_step,
    declarationAccepted: row.declaration_accepted === 1,
    cycleLabel: row.cycle_label,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapApplicationDocument(row: ApplicationDocumentRow): ApplicationDocumentRecord {
  return {
    id: row.id,
    applicationId: row.application_id,
    documentId: row.document_id,
    requiredDocumentType: row.required_document_type,
    status: row.status,
    isReplacement: row.is_replacement === 1,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    reviewNotes: row.review_notes,
  };
}

export function listApplicationsForStudent(studentId: string): ApplicationRecord[] {
  const rows = getDb()
    .prepare('SELECT * FROM applications WHERE student_id = ? ORDER BY created_at DESC')
    .all(studentId) as ApplicationRow[];
  return rows.map(mapApplication);
}

export function getApplicationById(id: string): ApplicationRecord | null {
  const row = getDb().prepare('SELECT * FROM applications WHERE id = ?').get(id) as ApplicationRow | undefined;
  return row ? mapApplication(row) : null;
}

export function getApplicationForStudent(applicationId: string, studentId: string): ApplicationRecord | null {
  const application = getApplicationById(applicationId);
  if (!application || application.studentId !== studentId) return null;
  return application;
}

export function getApplicationByNumber(applicationNumber: string): ApplicationRecord | null {
  const row = getDb()
    .prepare('SELECT * FROM applications WHERE application_number = ?')
    .get(applicationNumber) as ApplicationRow | undefined;
  return row ? mapApplication(row) : null;
}

export function findOpenApplication(studentId: string, schemeId: string): ApplicationRecord | null {
  const rows = getDb()
    .prepare('SELECT * FROM applications WHERE student_id = ? AND scheme_id = ?')
    .all(studentId, schemeId) as ApplicationRow[];
  const open = rows.map(mapApplication).find((app) => isOpenStatus(app.status));
  return open ?? null;
}

export function listApplicationsForScheme(schemeId: string): ApplicationRecord[] {
  const rows = getDb()
    .prepare('SELECT * FROM applications WHERE scheme_id = ? ORDER BY created_at DESC')
    .all(schemeId) as ApplicationRow[];
  return rows.map(mapApplication);
}

export function createDraftApplication(input: {
  studentId: string;
  schemeId: string;
  draftData: ApplicationDraftData;
  currentStep?: number;
}): ApplicationRecord {
  const id = newId('app');
  const now = nowIso();
  getDb()
    .prepare(
      `INSERT INTO applications
        (id, application_number, student_id, scheme_id, status, snapshot_json, draft_json, current_step,
         declaration_accepted, cycle_label, submitted_at, created_at, updated_at)
       VALUES (?, '', ?, ?, 'DRAFT', NULL, ?, ?, 0, NULL, NULL, ?, ?)`,
    )
    .run(id, input.studentId, input.schemeId, stringifyJson(input.draftData), input.currentStep ?? 1, now, now);

  recordActivity({
    applicationId: id,
    actorId: input.studentId,
    actorRole: 'STUDENT',
    eventType: 'APPLICATION_CREATED',
    description: 'Draft application created.',
  });

  return getApplicationById(id)!;
}

export function updateApplicationDraft(
  applicationId: string,
  draftData: ApplicationDraftData,
  currentStep: number,
  declarationAccepted?: boolean,
): void {
  const existing = getApplicationById(applicationId);
  getDb()
    .prepare(
      `UPDATE applications SET draft_json = ?, current_step = ?, declaration_accepted = ?, updated_at = ? WHERE id = ?`,
    )
    .run(
      stringifyJson(draftData),
      currentStep,
      declarationAccepted === undefined
        ? existing?.declarationAccepted
          ? 1
          : 0
        : declarationAccepted
          ? 1
          : 0,
      nowIso(),
      applicationId,
    );
}

function nextApplicationNumber(): string {
  const db = getDb();
  const row = db.prepare("SELECT value FROM app_counters WHERE key = 'application_sequence'").get() as
    | { value: number }
    | undefined;
  const next = (row?.value ?? 841) + 1;
  db.prepare(
    "INSERT INTO app_counters (key, value) VALUES ('application_sequence', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(next);
  return `TRB-2026-${String(next).padStart(5, '0')}`;
}

export interface SubmitApplicationResult {
  application: ApplicationRecord;
  number: string;
}

export function submitApplication(
  applicationId: string,
  selectedDocuments: Record<string, string>,
  declarationAccepted: boolean,
  actorUserId: string,
): SubmitApplicationResult {
  const db = getDb();
  const application = getApplicationById(applicationId);
  if (!application) throw new Error('Application not found');
  if (application.status !== 'DRAFT') throw new Error('Only a draft application can be submitted.');

  const profile = getProfileById(application.studentId);
  if (!profile) throw new Error('Student profile not found');

  const number = nextApplicationNumber();
  const now = nowIso();

  const snapshot: ApplicationSnapshot = {
    fullName: profile.fullName,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    category: profile.category,
    isST: profile.isST,
    isPVTG: profile.isPVTG,
    state: profile.state,
    district: profile.district,
    educationLevel: profile.educationLevel,
    course: profile.course,
    institution: profile.institution,
    academicYear: profile.academicYear,
    previousQualification: profile.previousQualification,
    percentageOrCgpa: profile.percentageOrCgpa,
    annualFamilyIncome: profile.annualFamilyIncome,
    householdSize: profile.householdSize,
    primaryOccupation: profile.primaryOccupation,
    capturedAt: now,
  };

  const insertDoc = db.prepare(
    `INSERT INTO application_documents
      (id, application_id, document_id, required_document_type, status, is_replacement, submitted_at, reviewed_at, review_notes)
     VALUES (?, ?, ?, ?, ?, 0, ?, NULL, NULL)`,
  );

  const attach = db.transaction(() => {
    db.prepare(
      `UPDATE applications SET application_number = ?, status = 'SUBMITTED', snapshot_json = ?,
        draft_json = NULL, current_step = 6, declaration_accepted = ?, submitted_at = ?, updated_at = ?
       WHERE id = ?`,
    ).run(number, stringifyJson(snapshot), declarationAccepted ? 1 : 0, now, now, applicationId);

    db.prepare('DELETE FROM application_documents WHERE application_id = ?').run(applicationId);
    for (const [requiredType, documentId] of Object.entries(selectedDocuments)) {
      if (!documentId) continue;
      insertDoc.run(newId('adoc'), applicationId, documentId, requiredType, 'SUBMITTED', now);
    }

    db.prepare(
      "UPDATE app_counters SET value = value WHERE key = 'application_sequence'",
    ).run();
  });

  attach();

  recordActivity({
    applicationId,
    actorId: profile.userId,
    actorRole: 'STUDENT',
    eventType: 'APPLICATION_SUBMITTED',
    description: `Application ${number} submitted.`,
    metadata: { applicationNumber: number },
  });

  createNotification({
    userId: actorUserId,
    type: 'APPLICATION_SUBMITTED',
    title: 'Application submitted',
    message: `Your application ${number} has been submitted and is now queued for document verification.`,
    relatedApplicationId: applicationId,
  });

  createNotificationForAdmins({
    type: 'APPLICATION_SUBMITTED',
    title: 'New application submitted',
    message: `${profile.fullName} submitted ${number} and it is queued for document verification.`,
    relatedApplicationId: applicationId,
  });

  return { application: getApplicationById(applicationId)!, number };
}

export function listApplicationDocuments(applicationId: string): ApplicationDocumentRecord[] {
  const rows = getDb()
    .prepare('SELECT * FROM application_documents WHERE application_id = ? ORDER BY required_document_type')
    .all(applicationId) as ApplicationDocumentRow[];
  return rows.map(mapApplicationDocument);
}

export function listApplicationDocumentsWithFiles(applicationId: string) {
  return listApplicationDocuments(applicationId).map((record) => ({
    record,
    document: record.documentId ? attachFindings([getDocumentById(record.documentId)!])[0] : null,
  }));
}

export function updateApplicationDocumentStatus(
  applicationDocumentId: string,
  status: ApplicationDocumentStatus,
  reviewNotes: string | null,
): void {
  getDb()
    .prepare(
      'UPDATE application_documents SET status = ?, review_notes = ?, reviewed_at = ? WHERE id = ?',
    )
    .run(status, reviewNotes, status === 'SUBMITTED' ? null : nowIso(), applicationDocumentId);
}

export function setApplicationDocument(applicationId: string, requiredType: DocumentType, documentId: string, isReplacement = false): void {
  const db = getDb();
  const existing = db
    .prepare('SELECT id FROM application_documents WHERE application_id = ? AND required_document_type = ?')
    .get(applicationId, requiredType) as { id: string } | undefined;

  if (existing) {
    db.prepare(
      'UPDATE application_documents SET document_id = ?, status = ?, is_replacement = ?, submitted_at = ?, reviewed_at = NULL, review_notes = NULL WHERE id = ?',
    ).run(documentId, 'SUBMITTED', isReplacement ? 1 : 0, nowIso(), existing.id);
    return;
  }

  db.prepare(
    `INSERT INTO application_documents
      (id, application_id, document_id, required_document_type, status, is_replacement, submitted_at, reviewed_at, review_notes)
     VALUES (?, ?, ?, ?, 'SUBMITTED', ?, ?, NULL, NULL)`,
  ).run(newId('adoc'), applicationId, documentId, requiredType, isReplacement ? 1 : 0, nowIso());
}

export function changeApplicationStatus(input: {
  applicationId: string;
  next: ApplicationStatus;
  actorId: string | null;
  actorRole: ActorRole;
  note?: string;
}): ApplicationRecord {
  const application = getApplicationById(input.applicationId);
  if (!application) throw new Error('Application not found');
  if (application.status === input.next) return application;
  if (!canTransition(application.status, input.next)) {
    throw new Error(
      `Status cannot move from "${application.status}" to "${input.next}". Allowed: ${
        canTransition(application.status, input.next) ? '' : 'none'
      }`.trim(),
    );
  }

  const previousLabel = application.status;
  getDb()
    .prepare('UPDATE applications SET status = ?, updated_at = ? WHERE id = ?')
    .run(input.next, nowIso(), input.applicationId);

  recordActivity({
    applicationId: input.applicationId,
    actorId: input.actorId,
    actorRole: input.actorRole,
    eventType: input.next === 'COMPLETED' ? 'APPLICATION_COMPLETED' : 'STATUS_CHANGED',
    description: input.note ?? `Status updated to ${input.next}.`,
    metadata: { from: previousLabel, to: input.next },
  });

  return getApplicationById(input.applicationId)!;
}

export function listAllApplications(): ApplicationRecord[] {
  const rows = getDb().prepare('SELECT * FROM applications ORDER BY created_at DESC').all() as ApplicationRow[];
  return rows.map(mapApplication);
}

export function schemeOfApplication(application: ApplicationRecord) {
  return getSchemeById(application.schemeId);
}
