'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireStudent } from '@/lib/auth/guards';
import { getProfileById, updateProfile } from '@/lib/db/profiles';
import type { EducationLevel, Gender, SocialCategory } from '@/types';

export interface ProfileState {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function validate(formData: FormData) {
  const errors: Record<string, string> = {};
  const fullName = text(formData, 'fullName');
  const email = text(formData, 'email');
  const dateOfBirth = text(formData, 'dateOfBirth');
  const income = text(formData, 'annualFamilyIncome');
  const householdSize = text(formData, 'householdSize');
  const state = text(formData, 'state');

  if (fullName.length < 3) errors.fullName = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (!dateOfBirth) errors.dateOfBirth = 'Date of birth is required for age-based verification.';
  if (!state) errors.state = 'Select your state.';
  else if (!STATES.includes(state)) errors.state = 'Select a state from the list.';
  if (income && !/^\d{1,9}$/.test(income)) errors.annualFamilyIncome = 'Enter the amount in digits, without commas or symbols.';
  if (householdSize && !/^\d{1,2}$/.test(householdSize)) errors.householdSize = 'Enter a number between 1 and 20.';

  return { errors, fullName, email, dateOfBirth, income, householdSize, state };
}

export async function saveProfileAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await requireStudent();
  const profile = getProfileById(user.studentId);
  if (!profile) return { error: 'Student profile not found.' };

  const { errors, fullName, email, dateOfBirth, income, householdSize, state } = validate(formData);
  if (Object.keys(errors).length > 0) {
    return { error: 'Please correct the highlighted fields.', fieldErrors: errors };
  }

  const isSt = formData.get('isST') === 'on';
  const isPvtg = formData.get('isPVTG') === 'on';
  const category = (text(formData, 'category') || null) as SocialCategory | null;

  /* ST status is never inferred. If the student unticks ST, the category is
     cleared so the two can never contradict each other. */
  if (!isSt && category === 'ST') {
    return {
      error: 'Scheduled Tribe status and the ST category must be consistent.',
      fieldErrors: { category: 'Select a different category or confirm ST status above.' },
    };
  }

  updateProfile(user.studentId, {
    fullName,
    email,
    dateOfBirth: dateOfBirth || null,
    gender: (text(formData, 'gender') || null) as Gender | null,
    mobile: text(formData, 'mobile') || null,
    state,
    district: text(formData, 'district') || null,
    category,
    isST: isSt,
    isPVTG: isPvtg && isSt,
    educationLevel: (text(formData, 'educationLevel') || null) as EducationLevel | null,
    course: text(formData, 'course') || null,
    institution: text(formData, 'institution') || null,
    academicYear: text(formData, 'academicYear') || null,
    previousQualification: text(formData, 'previousQualification') || null,
    percentageOrCgpa: text(formData, 'percentageOrCgpa') || null,
    annualFamilyIncome: income ? Number(income) : null,
    householdSize: householdSize ? Number(householdSize) : null,
    primaryOccupation: text(formData, 'primaryOccupation') || null,
  });

  revalidatePath('/student/profile');
  revalidatePath('/student/dashboard');
  revalidatePath('/student/scholarships');

  return { message: 'Profile saved. Matching results have been recalculated.' };
}

export async function goToProfileStepAction(formData: FormData): Promise<void> {
  const section = text(formData, 'section');
  redirect(section === 'done' ? '/student/dashboard' : `/student/profile#${section}`);
}
