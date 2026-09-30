'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/field';
import { Alert, Progress } from '@/components/ui/feedback';
import { EDUCATION_LEVEL_LABEL, GENDER_LABEL, SOCIAL_CATEGORY_LABEL } from '@/lib/domain/workflow';
import { saveProfileAction, type ProfileState } from '@/app/actions/profile';
import type { ProfileSectionStatus, StudentProfile } from '@/types';
import { cn } from '@/lib/utils';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const SECTIONS: { key: ProfileSectionStatus['key']; title: string; description: string }[] = [
  { key: 'personal', title: 'Personal details', description: 'As written on your school records.' },
  { key: 'category', title: 'Category information', description: 'Used only to check published eligibility conditions.' },
  { key: 'education', title: 'Education', description: 'Your current course and institution.' },
  { key: 'household', title: 'Household', description: 'Family income from all sources, used for income conditions.' },
];

export function ProfileForm({
  profile,
  completion,
  welcome,
}: {
  profile: StudentProfile;
  completion: { percent: number; sections: ProfileSectionStatus[]; missingFields: string[]; isComplete: boolean };
  welcome?: boolean;
}) {
  const [state, action] = useActionState<ProfileState, FormData>(saveProfileAction, {});
  const [open, setOpen] = useState<ProfileSectionStatus['key'] | null>('personal');

  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-6">
      {welcome ? (
        <Alert tone="info" title="Welcome to Aletheia">
          Complete these details so Aletheia can check published eligibility conditions for you. You can change them
          at any time.
        </Alert>
      ) : null}

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}

      <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink">Profile completeness</p>
          <p className="font-display text-lg text-ink">{completion.percent}%</p>
        </div>
        <Progress value={completion.percent} tone={completion.isComplete ? 'success' : 'maroon'} label="" className="mt-2" />
        {completion.missingFields.length > 0 ? (
          <p className="mt-2 text-xs text-muted">Still needed: {completion.missingFields.join(', ')}</p>
        ) : (
          <p className="mt-2 text-xs text-muted">Every field used for matching is filled in.</p>
        )}
      </div>

      {SECTIONS.map((section) => {
        const status = completion.sections.find((item) => item.key === section.key);
        const expanded = open === section.key;
        return (
          <section key={section.key} id={section.key} className="rounded-lg border border-line bg-surface shadow-soft">
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : section.key)}
              aria-expanded={expanded}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span>
                <span className="block font-display text-lg text-ink">{section.title}</span>
                <span className="block text-sm text-muted">{section.description}</span>
              </span>
              <span className="flex items-center gap-3">
                {status && status.missingFields.length > 0 ? (
                  <span className="rounded-full border border-status-warning/35 bg-status-warning/10 px-2 py-0.5 text-xs text-[#7d5412]">
                    {status.missingFields.length} missing
                  </span>
                ) : (
                  <span className="rounded-full border border-status-success/30 bg-status-success/10 px-2 py-0.5 text-xs text-status-success">
                    Complete
                  </span>
                )}
                <span className="text-xs text-muted">{status?.completion ?? 0}%</span>
              </span>
            </button>

            {expanded ? (
              <div className="space-y-4 border-t border-line px-5 py-5">
                {section.key === 'personal' ? <PersonalFields profile={profile} errors={errors} /> : null}
                {section.key === 'category' ? <CategoryFields profile={profile} errors={errors} /> : null}
                {section.key === 'education' ? <EducationFields profile={profile} errors={errors} /> : null}
                {section.key === 'household' ? <HouseholdFields profile={profile} errors={errors} /> : null}
              </div>
            ) : null}
          </section>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        <SaveButton />
        <span className="text-xs text-muted">You can save at any time — nothing is submitted to any government portal.</span>
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending}>
      Save profile
    </Button>
  );
}

function PersonalFields({ profile, errors }: FieldProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="fullName" required error={errors.fullName}>
          <Input id="fullName" name="fullName" defaultValue={profile.fullName} required />
        </Field>
        <Field label="Date of birth" htmlFor="dateOfBirth" required error={errors.dateOfBirth}>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={profile.dateOfBirth ?? ''} required />
        </Field>
        <Field label="Gender" htmlFor="gender">
          <Select id="gender" name="gender" defaultValue={profile.gender ?? ''}>
            <option value="">Prefer not to say</option>
            {Object.entries(GENDER_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Mobile number" htmlFor="mobile" hint="Used only for application updates in this prototype.">
          <Input id="mobile" name="mobile" defaultValue={profile.mobile ?? ''} placeholder="+91 98765 43210" />
        </Field>
        <Field label="Email address" htmlFor="email" required error={errors.email}>
          <Input id="email" name="email" type="email" defaultValue={profile.email} required />
        </Field>
        <Field label="State" htmlFor="state" required error={errors.state}>
          <Select id="state" name="state" defaultValue={profile.state ?? ''} required>
            <option value="">Select a state</option>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="District" htmlFor="district" className="sm:col-span-2">
          <Input id="district" name="district" defaultValue={profile.district ?? ''} placeholder="e.g. Dahod" />
        </Field>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        Do not enter an Aadhaar number, a bank account number or any other government identifier anywhere in Aletheia.
      </p>
    </>
  );
}

function CategoryFields({ profile, errors }: FieldProps) {
  return (
    <>
      <Field label="Social category" htmlFor="category" error={errors.category} hint="Recorded exactly as issued by the competent authority.">
        <Select id="category" name="category" defaultValue={profile.category ?? ''}>
          <option value="">Select a category</option>
          {Object.entries(SOCIAL_CATEGORY_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      <label className="flex items-start gap-2.5 rounded-md border border-line bg-canvas/60 p-3">
        <Checkbox name="isST" defaultChecked={profile.isST} className="mt-0.5" />
        <span className="text-sm">
          <span className="block font-medium text-ink">I hold Scheduled Tribe (ST) status</span>
          <span className="block text-xs text-muted">
            Confirm this only if it is recorded on your ST certificate. Aletheia never infers ST status from a name,
            district or language, and it will not verify this claim on your behalf.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-2.5 rounded-md border border-line bg-canvas/60 p-3">
        <Checkbox name="isPVTG" defaultChecked={profile.isPVTG} className="mt-0.5" />
        <span className="text-sm">
          <span className="block font-medium text-ink">I belong to a Particularly Vulnerable Tribal Group (PVTG)</span>
          <span className="block text-xs text-muted">Some schemes record a separate PVTG allocation. Optional.</span>
        </span>
      </label>
    </>
  );
}

function EducationFields({ profile, errors }: FieldProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Education level" htmlFor="educationLevel" required>
        <Select id="educationLevel" name="educationLevel" defaultValue={profile.educationLevel ?? ''}>
          <option value="">Select a level</option>
          {Object.entries(EDUCATION_LEVEL_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Course / programme" htmlFor="course" required>
        <Input id="course" name="course" defaultValue={profile.course ?? ''} placeholder="e.g. B.Tech (Computer Engineering)" />
      </Field>
      <Field label="Institution" htmlFor="institution" required>
        <Input id="institution" name="institution" defaultValue={profile.institution ?? ''} />
      </Field>
      <Field label="Academic year / year of study" htmlFor="academicYear" required>
        <Input id="academicYear" name="academicYear" defaultValue={profile.academicYear ?? ''} placeholder="e.g. 3rd Year" />
      </Field>
      <Field label="Previous qualification" htmlFor="previousQualification" required>
        <Input id="previousQualification" name="previousQualification" defaultValue={profile.previousQualification ?? ''} />
      </Field>
      <Field label="Percentage / CGPA" htmlFor="percentageOrCgpa" hint="Used only for display and merit-based schemes.">
        <Input id="percentageOrCgpa" name="percentageOrCgpa" defaultValue={profile.percentageOrCgpa ?? ''} placeholder="e.g. 82.4%" />
      </Field>
    </div>
  );
}

function HouseholdFields({ profile, errors }: FieldProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="Annual family income (₹)"
        htmlFor="annualFamilyIncome"
        required
        error={errors.annualFamilyIncome}
        hint="From all sources, before deductions. Used to check published income ceilings."
      >
        <Input id="annualFamilyIncome" name="annualFamilyIncome" inputMode="numeric" defaultValue={profile.annualFamilyIncome ?? ''} placeholder="420000" />
      </Field>
      <Field label="Household size" htmlFor="householdSize" required error={errors.householdSize}>
        <Input id="householdSize" name="householdSize" inputMode="numeric" defaultValue={profile.householdSize ?? ''} placeholder="5" />
      </Field>
      <Field label="Primary occupation of the family" htmlFor="primaryOccupation" required className="sm:col-span-2">
        <Textarea
          id="primaryOccupation"
          name="primaryOccupation"
          defaultValue={profile.primaryOccupation ?? ''}
          className="min-h-20"
        />
      </Field>
    </div>
  );
}

interface FieldProps {
  profile: StudentProfile;
  errors: Record<string, string>;
}

export { cn };
