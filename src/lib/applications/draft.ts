import type { ApplicationDraftData, EducationLevel, Gender, SocialCategory } from '@/types';

/**
 * Builds the initial wizard draft from a student profile.
 *
 * Kept outside the server-action module so both server components and
 * actions can reuse it without re-exporting a non-action from a
 * `'use server'` file (which Next.js rejects at build time).
 */
export function draftFromProfile(profile: {
  fullName: string;
  dateOfBirth: string | null;
  gender: string | null;
  mobile: string | null;
  email: string;
  state: string | null;
  district: string | null;
  educationLevel: string | null;
  course: string | null;
  institution: string | null;
  academicYear: string | null;
  previousQualification: string | null;
  percentageOrCgpa: string | null;
  annualFamilyIncome: number | null;
  householdSize: number | null;
  primaryOccupation: string | null;
  category: string | null;
  isST: boolean;
  isPVTG: boolean;
}): ApplicationDraftData {
  return {
    personal: {
      fullName: profile.fullName,
      dateOfBirth: profile.dateOfBirth ?? '',
      gender: (profile.gender as Gender | null) ?? '',
      mobile: profile.mobile ?? '',
      email: profile.email,
      state: profile.state ?? '',
      district: profile.district ?? '',
    },
    education: {
      educationLevel: (profile.educationLevel as EducationLevel | null) ?? '',
      course: profile.course ?? '',
      institution: profile.institution ?? '',
      academicYear: profile.academicYear ?? '',
      previousQualification: profile.previousQualification ?? '',
      percentageOrCgpa: profile.percentageOrCgpa ?? '',
    },
    household: {
      annualFamilyIncome: profile.annualFamilyIncome === null ? '' : String(profile.annualFamilyIncome),
      householdSize: profile.householdSize === null ? '' : String(profile.householdSize),
      primaryOccupation: profile.primaryOccupation ?? '',
      category: (profile.category as SocialCategory | null) ?? '',
      isST: profile.isST,
      isPVTG: profile.isPVTG,
    },
    documents: {},
    declaration: { accepted: false },
  };
}
