import { fromBool, getDb, nowIso, toBool } from '@/lib/db/client';
import type {
  EducationLevel,
  Gender,
  ProfileCompletion,
  ProfileSectionStatus,
  SocialCategory,
  StudentProfile,
} from '@/types';

interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  mobile: string | null;
  email: string;
  state: string | null;
  district: string | null;
  category: string | null;
  is_st: number;
  is_pvtg: number;
  education_level: string | null;
  course: string | null;
  institution: string | null;
  academic_year: string | null;
  previous_qualification: string | null;
  percentage_or_cgpa: string | null;
  annual_family_income: number | null;
  household_size: number | null;
  primary_occupation: string | null;
  created_at: string;
  updated_at: string;
}

function mapProfile(row: ProfileRow): StudentProfile {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    gender: row.gender as Gender | null,
    mobile: row.mobile,
    email: row.email,
    state: row.state,
    district: row.district,
    category: row.category as SocialCategory | null,
    isST: toBool(row.is_st),
    isPVTG: toBool(row.is_pvtg),
    educationLevel: row.education_level as EducationLevel | null,
    course: row.course,
    institution: row.institution,
    academicYear: row.academic_year,
    previousQualification: row.previous_qualification,
    percentageOrCgpa: row.percentage_or_cgpa,
    annualFamilyIncome: row.annual_family_income,
    householdSize: row.household_size,
    primaryOccupation: row.primary_occupation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getProfileById(studentId: string): StudentProfile | null {
  const row = getDb().prepare('SELECT * FROM student_profiles WHERE id = ?').get(studentId) as
    | ProfileRow
    | undefined;
  return row ? mapProfile(row) : null;
}

export function getProfileByUserId(userId: string): StudentProfile | null {
  const row = getDb().prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(userId) as
    | ProfileRow
    | undefined;
  return row ? mapProfile(row) : null;
}

export interface ProfileInput {
  fullName?: string;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  mobile?: string | null;
  email?: string;
  state?: string | null;
  district?: string | null;
  category?: SocialCategory | null;
  isST?: boolean;
  isPVTG?: boolean;
  educationLevel?: EducationLevel | null;
  course?: string | null;
  institution?: string | null;
  academicYear?: string | null;
  previousQualification?: string | null;
  percentageOrCgpa?: string | null;
  annualFamilyIncome?: number | null;
  householdSize?: number | null;
  primaryOccupation?: string | null;
}

export function updateProfile(studentId: string, input: ProfileInput): void {
  const current = getProfileById(studentId);
  if (!current) throw new Error('Student profile not found');

  const merged = { ...current, ...input };
  getDb()
    .prepare(
      `UPDATE student_profiles SET
        full_name = ?, date_of_birth = ?, gender = ?, mobile = ?, email = ?,
        state = ?, district = ?, category = ?, is_st = ?, is_pvtg = ?,
        education_level = ?, course = ?, institution = ?, academic_year = ?,
        previous_qualification = ?, percentage_or_cgpa = ?, annual_family_income = ?,
        household_size = ?, primary_occupation = ?, updated_at = ?
      WHERE id = ?`,
    )
    .run(
      merged.fullName,
      merged.dateOfBirth ?? null,
      merged.gender ?? null,
      merged.mobile ?? null,
      merged.email,
      merged.state ?? null,
      merged.district ?? null,
      merged.category ?? null,
      fromBool(merged.isST),
      fromBool(merged.isPVTG),
      merged.educationLevel ?? null,
      merged.course ?? null,
      merged.institution ?? null,
      merged.academicYear ?? null,
      merged.previousQualification ?? null,
      merged.percentageOrCgpa ?? null,
      merged.annualFamilyIncome ?? null,
      merged.householdSize ?? null,
      merged.primaryOccupation ?? null,
      nowIso(),
      studentId,
    );
}

/* ------------------------------------------------------------------ */
/* Profile completion (derived, never stored)                          */
/* ------------------------------------------------------------------ */

const SECTION_FIELDS: {
  key: ProfileSectionStatus['key'];
  label: string;
  fields: { key: keyof StudentProfile; label: string; required: boolean }[];
}[] = [
  {
    key: 'personal',
    label: 'Personal details',
    fields: [
      { key: 'fullName', label: 'Full name', required: true },
      { key: 'dateOfBirth', label: 'Date of birth', required: true },
      { key: 'gender', label: 'Gender', required: true },
      { key: 'mobile', label: 'Mobile number', required: true },
      { key: 'state', label: 'State', required: true },
      { key: 'district', label: 'District', required: true },
    ],
  },
  {
    key: 'category',
    label: 'Category information',
    fields: [
      { key: 'category', label: 'Social category', required: true },
      { key: 'isST', label: 'Scheduled Tribe status', required: false },
    ],
  },
  {
    key: 'education',
    label: 'Education',
    fields: [
      { key: 'educationLevel', label: 'Education level', required: true },
      { key: 'course', label: 'Course / programme', required: true },
      { key: 'institution', label: 'Institution', required: true },
      { key: 'academicYear', label: 'Academic year', required: true },
      { key: 'previousQualification', label: 'Previous qualification', required: true },
      { key: 'percentageOrCgpa', label: 'Percentage / CGPA', required: false },
    ],
  },
  {
    key: 'household',
    label: 'Household',
    fields: [
      { key: 'annualFamilyIncome', label: 'Annual family income', required: true },
      { key: 'householdSize', label: 'Household size', required: true },
      { key: 'primaryOccupation', label: 'Primary occupation', required: true },
    ],
  },
];

function hasValue(profile: StudentProfile, key: keyof StudentProfile): boolean {
  const value = profile[key];
  if (typeof value === 'boolean') return true;
  if (typeof value === 'number') return !Number.isNaN(value);
  return typeof value === 'string' && value.trim().length > 0;
}

export function calculateProfileCompletion(profile: StudentProfile): ProfileCompletion {
  const sections: ProfileSectionStatus[] = SECTION_FIELDS.map((section) => {
    const missingFields = section.fields
      .filter((field) => field.required && !hasValue(profile, field.key))
      .map((field) => field.label);
    const filled = section.fields.filter((field) => hasValue(profile, field.key)).length;
    return {
      key: section.key,
      label: section.label,
      completion: Math.round((filled / section.fields.length) * 100),
      missingFields,
    };
  });

  const requiredTotal = SECTION_FIELDS.reduce((sum, s) => sum + s.fields.filter((f) => f.required).length, 0);
  const requiredFilled = SECTION_FIELDS.reduce((sum, s) => {
    return sum + s.fields.filter((field) => field.required && hasValue(profile, field.key)).length;
  }, 0);

  return {
    percent: Math.round((requiredFilled / requiredTotal) * 100),
    sections,
    missingFields: sections.flatMap((s) => s.missingFields),
    isComplete: requiredFilled === requiredTotal,
  };
}
