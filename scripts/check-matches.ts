import { getProfileById } from '../src/lib/db/profiles';
import { getStudentMatches, matchCounts } from '../src/lib/matching/service';
import { getSchemeByIdWithRelations } from '../src/lib/db/schemes';
import { calculateProfileCompletion } from '../src/lib/db/profiles';
import { listApplicationDocuments, listActivity } from '../src/lib/db/applications';
import { listDocumentsWithFindings } from '../src/lib/db/documents';

const profile = getProfileById('stu_demo_rahul');
if (!profile) throw new Error('demo profile missing');

const completion = calculateProfileCompletion(profile);
console.log(`Profile ${profile.fullName}: ${completion.percent}% complete, missing: ${completion.missingFields.join(', ') || 'none'}`);

const matches = getStudentMatches(profile.id);
console.log('Counts', matchCounts(matches));
for (const match of matches) {
  const scheme = getSchemeByIdWithRelations(match.scheme.id);
  console.log(`\n${match.scheme.shortName} — ${match.statusLabel}`);
  for (const condition of match.conditions) {
    console.log(`  [${condition.outcome}] ${condition.label}: ${condition.detail}`);
  }
  console.log(
    `  documents ${match.readiness.availableCount}/${match.readiness.requiredCount} (missing ${match.readiness.missingCount}, attention ${match.readiness.attentionCount})`,
  );
  console.log(`  rules in db: ${scheme?.rules.length}, required docs: ${scheme?.requiredDocuments.length}`);
}

console.log('\nWallet:');
for (const doc of listDocumentsWithFindings(profile.id)) {
  console.log(`  ${doc.documentName} [${doc.status}] findings=${doc.findings?.length ?? 0}`);
}

console.log('\nApplication documents:');
for (const record of listApplicationDocuments('app_demo_00841')) {
  console.log(`  ${record.requiredDocumentType} -> ${record.status} (${record.reviewNotes ?? 'no note'})`);
}

console.log('\nActivity:');
for (const event of listActivity('app_demo_00841')) {
  console.log(`  ${event.createdAt.slice(0, 10)} [${event.eventType}] ${event.description.slice(0, 80)}`);
}
