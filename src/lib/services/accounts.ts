import { getDb, newId, nowIso } from '@/lib/db/client';

/**
 * Account creation. Students get an empty profile that they complete in the
 * product; administrators are created by the seed script only.
 */

export function createUserWithProfile(
  userId: string,
  input: { fullName: string; email: string; mobile?: string | null },
): string {
  const db = getDb();
  const profileId = newId('stu');
  const now = nowIso();
  db.prepare(
    `INSERT INTO student_profiles
      (id, user_id, full_name, date_of_birth, gender, mobile, email, state, district, category, is_st, is_pvtg,
       education_level, course, institution, academic_year, previous_qualification, percentage_or_cgpa,
       annual_family_income, household_size, primary_occupation, created_at, updated_at)
     VALUES (?, ?, ?, NULL, NULL, ?, ?, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?, ?)`,
  ).run(profileId, userId, input.fullName, input.mobile ?? null, input.email, now, now);
  return profileId;
}
