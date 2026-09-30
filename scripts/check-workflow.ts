/**
 * Exercises the end-to-end application workflow against a throwaway copy of
 * the seeded database. Nothing here touches the demo data.
 *
 * Run with: npm run db:flow
 */
import { copyFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.resolve(root, process.env.DATABASE_PATH || '.data/aletheia.db');
if (!existsSync(source)) {
  console.error('No seeded database found. Run "npm run db:reset" first.');
  process.exit(1);
}

const scratch = path.join(root, '.data', 'flow-check.db');
for (const suffix of ['', '-wal', '-shm']) {
  if (existsSync(`${scratch}${suffix}`)) rmSync(`${scratch}${suffix}`);
  if (existsSync(`${source}${suffix}`)) copyFileSync(`${source}${suffix}`, `${scratch}${suffix}`);
}
process.env.DATABASE_PATH = path.relative(root, scratch).split(path.sep).join('/');

let failures = 0;
function check(label: string, condition: boolean, detail = ''): void {
  if (!condition) failures += 1;
  console.log(`${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`);
}

async function main(): Promise<void> {
  const { getDb } = await import('../src/lib/db/client');
  const { getProfileById } = await import('../src/lib/db/profiles');
  const { getSchemeBySlugWithRelations } = await import('../src/lib/db/schemes');
  const {
    changeApplicationStatus,
    createDraftApplication,
    getApplicationById,
    listActivity,
    listApplicationDocuments,
    listNotifications,
    markNotificationsRead,
    submitApplication,
    unreadNotificationCount,
    updateApplicationDocumentStatus,
  } = await import('../src/lib/db/applications');
  const { createDeficiency, listDeficiencies, resolveDeficiency } = await import('../src/lib/db/deficiencies');
  const { findDocumentByType, listDocuments, updateDocumentStatus } = await import('../src/lib/db/documents');
  const { draftFromProfile } = await import('../src/lib/applications/draft');
  const { getSchemeMatch } = await import('../src/lib/matching/service');

  const profile = getProfileById('stu_demo_rahul');
  const admin = getDb().prepare("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1").get() as { id: string };
  if (!profile) {
    console.error('Demo profile missing.');
    process.exit(1);
  }
  const scheme = getSchemeBySlugWithRelations('top-class-st');
  const postMatric = getSchemeBySlugWithRelations('post-matric-st');
  if (!scheme || !postMatric) {
    console.error('Expected Top Class and Post-Matric schemes missing.');
    process.exit(1);
  }

  console.log(`\nScratch database: ${scratch}\n`);

  // 1. Matching blocks a clearly non-matching application.
  check('post-matric is not matching for ₹4.2L income', getSchemeMatch(profile.id, postMatric.id)!.status === 'NOT_MATCHING');
  const match = getSchemeMatch(profile.id, scheme.id)!;
  check('top class is actionable', match.status !== 'NOT_MATCHING', match.status);

  // 2. Draft -> submit.
  const draft = createDraftApplication({ studentId: profile.id, schemeId: scheme.id, draftData: draftFromProfile(profile) });
  check('draft starts as DRAFT', draft.status === 'DRAFT');

  const wallet = listDocuments(profile.id);
  const selection: Record<string, string> = {};
  for (const requirement of scheme.requiredDocuments) {
    const owned = wallet.find((doc) => doc.documentType === requirement.documentType && doc.status !== 'EXPIRED');
    if (owned) selection[requirement.documentType] = owned.id;
  }
  check('wallet supplies at least one required document', Object.keys(selection).length > 0, `${Object.keys(selection).length} selected`);

  const { application, number } = submitApplication(draft.id, selection, true, profile.userId);
  check('submission allocates the next number', number === 'TRB-2026-00842', number);
  check('submitted status is SUBMITTED', application.status === 'SUBMITTED');
  check('snapshot captured at submission', application.snapshot?.fullName === profile.fullName);
  check('declaration recorded', application.declarationAccepted === true);
  check(
    'application documents recorded',
    listApplicationDocuments(application.id).length === Object.keys(selection).length,
  );

  const studentNotifications = listNotifications(profile.userId);
  const adminNotifications = listNotifications(admin.id);
  check('student is notified on submission', studentNotifications.some((n) => n.type === 'APPLICATION_SUBMITTED'));
  check('admins are notified on submission', adminNotifications.some((n) => n.type === 'APPLICATION_SUBMITTED'));
  check('unread count is non-zero before marking read', unreadNotificationCount(admin.id) > 0);
  markNotificationsRead(admin.id);
  check('marking read clears the unread count', unreadNotificationCount(admin.id) === 0);
  check('read state persists', listNotifications(admin.id).find((n) => n.type === 'APPLICATION_SUBMITTED')!.isRead === true);

  // 3. Re-submission is rejected.
  try {
    submitApplication(application.id, selection, true, profile.userId);
    check('second submission is rejected', false);
  } catch {
    check('second submission is rejected', true);
  }

  // 4. Illegal transition is rejected.
  try {
    changeApplicationStatus({ applicationId: application.id, next: 'COMPLETED', actorId: admin.id, actorRole: 'ADMIN' });
    check('illegal transition is rejected', false);
  } catch {
    check('illegal transition is rejected', true);
  }

  // 5. Admin review of one document sets a correction.
  const firstRecord = listApplicationDocuments(application.id)[0];
  let correctedDocumentId: string | null = null;
  if (firstRecord) {
    updateApplicationDocumentStatus(firstRecord.id, 'NEEDS_CORRECTION', 'Possible name variation.');
    const record = listApplicationDocuments(application.id).find((item) => item.id === firstRecord.id)!;
    check('document review note persists', record.reviewNotes === 'Possible name variation.');
    correctedDocumentId = record.documentId;
  }

  // 6. Deficiency -> student correction -> resolution.
  changeApplicationStatus({ applicationId: application.id, next: 'DOCUMENT_VERIFICATION', actorId: admin.id, actorRole: 'ADMIN', note: 'Queued.' });
  const deficiency = createDeficiency({
    applicationId: application.id,
    documentId: correctedDocumentId,
    requiredDocumentType: correctedDocumentId ? 'INCOME_CERTIFICATE' : null,
    type: 'INVALID_DOCUMENT',
    title: 'Income Certificate — correction needed',
    description: 'Possible name variation between the certificate and the profile.',
    requiredAction: 'Upload a corrected or valid Income Certificate to your wallet and send it here.',
    createdBy: admin.id,
  });
  changeApplicationStatus({ applicationId: application.id, next: 'UNDER_REVIEW', actorId: admin.id, actorRole: 'ADMIN', note: 'Under review.' });
  changeApplicationStatus({ applicationId: application.id, next: 'DEFICIENT', actorId: admin.id, actorRole: 'ADMIN', note: 'Correction requested.' });
  check('deficiency is open', listDeficiencies(application.id).some((d) => d.id === deficiency.id && d.status === 'OPEN'));

  const replacement = findDocumentByType(profile.id, 'INCOME_CERTIFICATE');
  if (replacement) updateDocumentStatus(replacement.id, 'UPLOADED');
  resolveDeficiency(deficiency.id, replacement?.id ?? null);
  changeApplicationStatus({ applicationId: application.id, next: 'CORRECTION_RECEIVED', actorId: admin.id, actorRole: 'ADMIN', note: 'Correction received.' });
  check('deficiency resolved', listDeficiencies(application.id).find((d) => d.id === deficiency.id)!.status === 'RESOLVED');

  // 7. Continue to the end of the workflow.
  changeApplicationStatus({ applicationId: application.id, next: 'UNDER_REVIEW', actorId: admin.id, actorRole: 'ADMIN' });
  changeApplicationStatus({ applicationId: application.id, next: 'DECISION_PENDING', actorId: admin.id, actorRole: 'ADMIN' });
  const completed = changeApplicationStatus({ applicationId: application.id, next: 'COMPLETED', actorId: admin.id, actorRole: 'ADMIN' });
  check('application completes', completed.status === 'COMPLETED');
  check('final state persisted', getApplicationById(application.id)!.status === 'COMPLETED');

  const activity = listActivity(application.id);
  check('activity timeline records the loop', activity.length >= 8, `${activity.length} events`);
  check('activity spans student and admin roles', new Set(activity.map((e) => e.actorRole)).size >= 2);

  getDb().close();
  for (const suffix of ['', '-wal', '-shm']) {
    if (existsSync(`${scratch}${suffix}`)) rmSync(`${scratch}${suffix}`);
  }

  console.log(failures === 0 ? '\nWORKFLOW OK' : `\n${failures} WORKFLOW CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});