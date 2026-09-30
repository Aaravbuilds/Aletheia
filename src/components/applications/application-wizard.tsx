'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Check, ChevronLeft, ChevronRight, FileCheck2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/field';
import { Alert, Progress } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { EDUCATION_LEVEL_LABEL, GENDER_LABEL, SOCIAL_CATEGORY_LABEL } from '@/lib/domain/workflow';
import { cn, formatINR } from '@/lib/utils';
import { saveDraftAction, submitApplicationAction, type ApplicationState } from '@/app/actions/applications';
import type { ApplicationDraftData, RequiredDocument, StudentDocument } from '@/types';

const STEP_LABELS = [
  { key: 'personal', label: 'Personal' },
  { key: 'education', label: 'Education' },
  { key: 'household', label: 'Household' },
  { key: 'documents', label: 'Documents' },
  { key: 'review', label: 'Review' },
] as const;

type StepKey = (typeof STEP_LABELS)[number]['key'];

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export function ApplicationWizard({
  initialApplicationId,
  schemeSlug,
  initialDraft,
  initialStep = 1,
  requiredDocuments,
  wallet,
}: {
  initialApplicationId?: string;
  schemeSlug: string;
  initialDraft: ApplicationDraftData;
  initialStep?: number;
  requiredDocuments: RequiredDocument[];
  wallet: StudentDocument[];
}) {
  const [step, setStep] = useState<StepKey>(
    STEP_LABELS[Math.min(Math.max(initialStep, 1), STEP_LABELS.length) - 1]?.key ?? 'personal',
  );
  const [draft, setDraft] = useState<ApplicationDraftData>(initialDraft);
  const [applicationId, setApplicationId] = useState(initialApplicationId);
  const [saveState, saveAction] = useActionState<ApplicationState, FormData>(saveDraftAction, {});
  const [submitState, submitAction] = useActionState<ApplicationState, FormData>(submitApplicationAction, {});

  useEffect(() => {
    if (saveState.applicationId) setApplicationId(saveState.applicationId);
  }, [saveState.applicationId]);

  useEffect(() => {
    if (saveState.message) {
      const current = STEP_LABELS.findIndex((item) => item.key === step);
      if (current < STEP_LABELS.length - 1) setStep(STEP_LABELS[current + 1].key);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [saveState.message]);

  const stepIndex = STEP_LABELS.findIndex((item) => item.key === step);
  const errors = { ...(saveState.fieldErrors ?? {}), ...(submitState.fieldErrors ?? {}) };

  const serialise = (next: ApplicationDraftData) => JSON.stringify(next);

  const hidden = (
    <>
      <input type="hidden" name="applicationId" value={applicationId} />
      <input type="hidden" name="slug" value={schemeSlug} />
      <input type="hidden" name="step" value={step} />
      <input type="hidden" name="draft" value={serialise(draft)} />
    </>
  );
  const selectedCount = Object.keys(draft.documents).length;
  const missing = requiredDocuments.filter(
    (item) => item.required && !draft.documents[item.documentType],
  ).length;

  const stepValid = useMemo(() => {
    if (step === 'personal') return draft.personal.fullName.length >= 3 && !!draft.personal.dateOfBirth && !!draft.personal.state;
    if (step === 'education') return !!draft.education.educationLevel && draft.education.course.length >= 2 && draft.education.institution.length >= 2 && !!draft.education.academicYear;
    if (step === 'household') return /^\d{1,9}$/.test(draft.household.annualFamilyIncome) && /^\d{1,2}$/.test(draft.household.householdSize) && !!draft.household.category;
    if (step === 'documents') return selectedCount > 0;
    return draft.declaration.accepted;
  }, [step, draft, selectedCount]);

  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap items-center gap-2" aria-label="Application steps">
        {STEP_LABELS.map((item, index) => {
          const state = index < stepIndex ? 'done' : index === stepIndex ? 'current' : 'todo';
          return (
            <li key={item.key} className="flex items-center gap-2">
              <span
                aria-current={state === 'current' ? 'step' : undefined}
                className={cn(
                  'inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium',
                  state === 'current' && 'border-maroon bg-maroon text-surface',
                  state === 'done' && 'border-status-success/30 bg-status-success/10 text-status-success',
                  state === 'todo' && 'border-line bg-surface text-muted',
                )}
              >
                {state === 'done' ? <Check className="h-3.5 w-3.5" aria-hidden /> : <span>{index + 1}</span>}
                {item.label}
              </span>
              {index < STEP_LABELS.length - 1 ? <span className="h-px w-4 bg-line" aria-hidden /> : null}
            </li>
          );
        })}
      </ol>

      <Progress value={stepIndex + 1} max={STEP_LABELS.length} label="" />

      {saveState.error ? <Alert tone="error">{saveState.error}</Alert> : null}
      {saveState.message ? <Alert tone="success">{saveState.message}</Alert> : null}
      {submitState.error ? <Alert tone="error">{submitState.error}</Alert> : null}

      <form action={step === 'review' ? submitAction : saveAction} className="space-y-5">
        {hidden}

        {step === 'personal' ? (
          <section className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="fullName" required error={errors.fullName}>
              <Input
                id="fullName"
                value={draft.personal.fullName}
                onChange={(event) => setDraft({ ...draft, personal: { ...draft.personal, fullName: event.target.value } })}
                required
              />
            </Field>
            <Field label="Date of birth" htmlFor="dateOfBirth" required error={errors.dateOfBirth}>
              <Input
                id="dateOfBirth"
                type="date"
                value={draft.personal.dateOfBirth}
                onChange={(event) => setDraft({ ...draft, personal: { ...draft.personal, dateOfBirth: event.target.value } })}
                required
              />
            </Field>
            <Field label="Gender" htmlFor="gender">
              <Select
                id="gender"
                value={draft.personal.gender}
                onChange={(event) =>
                  setDraft({ ...draft, personal: { ...draft.personal, gender: event.target.value as never } })
                }
              >
                <option value="">Prefer not to say</option>
                {Object.entries(GENDER_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Mobile number" htmlFor="mobile">
              <Input
                id="mobile"
                value={draft.personal.mobile}
                onChange={(event) => setDraft({ ...draft, personal: { ...draft.personal, mobile: event.target.value } })}
              />
            </Field>
            <Field label="Email address" htmlFor="email" required error={errors.email}>
              <Input
                id="email"
                type="email"
                value={draft.personal.email}
                onChange={(event) => setDraft({ ...draft, personal: { ...draft.personal, email: event.target.value } })}
                required
              />
            </Field>
            <Field label="State" htmlFor="state" required error={errors.state}>
              <Select
                id="state"
                value={draft.personal.state}
                onChange={(event) => setDraft({ ...draft, personal: { ...draft.personal, state: event.target.value } })}
                required
              >
                <option value="">Select a state</option>
                {STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="District" htmlFor="district" className="sm:col-span-2">
              <Input
                id="district"
                value={draft.personal.district}
                onChange={(event) => setDraft({ ...draft, personal: { ...draft.personal, district: event.target.value } })}
              />
            </Field>
          </section>
        ) : null}

        {step === 'education' ? (
          <section className="grid gap-4 sm:grid-cols-2">
            <Field label="Education level" htmlFor="educationLevel" required error={errors.educationLevel}>
              <Select
                id="educationLevel"
                value={draft.education.educationLevel}
                onChange={(event) =>
                  setDraft({ ...draft, education: { ...draft.education, educationLevel: event.target.value as never } })
                }
              >
                <option value="">Select a level</option>
                {Object.entries(EDUCATION_LEVEL_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Course / programme" htmlFor="course" required error={errors.course}>
              <Input
                id="course"
                value={draft.education.course}
                onChange={(event) => setDraft({ ...draft, education: { ...draft.education, course: event.target.value } })}
              />
            </Field>
            <Field label="Institution" htmlFor="institution" required error={errors.institution}>
              <Input
                id="institution"
                value={draft.education.institution}
                onChange={(event) => setDraft({ ...draft, education: { ...draft.education, institution: event.target.value } })}
              />
            </Field>
            <Field label="Academic year / year of study" htmlFor="academicYear" required error={errors.academicYear}>
              <Input
                id="academicYear"
                value={draft.education.academicYear}
                onChange={(event) => setDraft({ ...draft, education: { ...draft.education, academicYear: event.target.value } })}
              />
            </Field>
            <Field label="Previous qualification" htmlFor="previousQualification" required>
              <Input
                id="previousQualification"
                value={draft.education.previousQualification}
                onChange={(event) =>
                  setDraft({ ...draft, education: { ...draft.education, previousQualification: event.target.value } })
                }
              />
            </Field>
            <Field label="Percentage / CGPA" htmlFor="percentageOrCgpa">
              <Input
                id="percentageOrCgpa"
                value={draft.education.percentageOrCgpa}
                onChange={(event) =>
                  setDraft({ ...draft, education: { ...draft.education, percentageOrCgpa: event.target.value } })
                }
              />
            </Field>
          </section>
        ) : null}

        {step === 'household' ? (
          <section className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Annual family income (₹)" htmlFor="annualFamilyIncome" required error={errors.annualFamilyIncome}>
                <Input
                  id="annualFamilyIncome"
                  inputMode="numeric"
                  value={draft.household.annualFamilyIncome}
                  onChange={(event) =>
                    setDraft({ ...draft, household: { ...draft.household, annualFamilyIncome: event.target.value } })
                  }
                />
              </Field>
              <Field label="Household size" htmlFor="householdSize" required error={errors.householdSize}>
                <Input
                  id="householdSize"
                  inputMode="numeric"
                  value={draft.household.householdSize}
                  onChange={(event) =>
                    setDraft({ ...draft, household: { ...draft.household, householdSize: event.target.value } })
                  }
                />
              </Field>
              <Field label="Social category" htmlFor="category" required error={errors.category} className="sm:col-span-2">
                <Select
                  id="category"
                  value={draft.household.category}
                  onChange={(event) =>
                    setDraft({ ...draft, household: { ...draft.household, category: event.target.value as never } })
                  }
                >
                  <option value="">Select a category</option>
                  {Object.entries(SOCIAL_CATEGORY_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Primary occupation of the family" htmlFor="primaryOccupation" required error={errors.primaryOccupation} className="sm:col-span-2">
                <Textarea
                  id="primaryOccupation"
                  value={draft.household.primaryOccupation}
                  onChange={(event) =>
                    setDraft({ ...draft, household: { ...draft.household, primaryOccupation: event.target.value } })
                  }
                />
              </Field>
            </div>

            <label className="flex items-start gap-2.5 rounded-md border border-line bg-canvas/60 p-3">
              <Checkbox
                checked={draft.household.isST}
                onChange={(event) => setDraft({ ...draft, household: { ...draft.household, isST: event.target.checked } })}
                className="mt-0.5"
              />
              <span className="text-sm">
                <span className="block font-medium text-ink">Scheduled Tribe (ST) status</span>
                <span className="block text-xs text-muted">
                  Taken from your profile. Aletheia never infers this and never verifies it for you.
                </span>
              </span>
            </label>
          </section>
        ) : null}

        {step === 'documents' ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge tone={missing === 0 ? 'success' : 'warning'}>
                {selectedCount} of {requiredDocuments.filter((item) => item.required).length} attached
              </Badge>
              <span className="text-xs text-muted">Documents come from your wallet, so they are reusable.</span>
            </div>

            <ul className="space-y-3">
              {requiredDocuments.map((item) => {
                const options = wallet.filter((document) => document.documentType === item.documentType);
                const chosen = draft.documents[item.documentType] ?? '';
                return (
                  <li key={item.id} className="rounded-md border border-line bg-surface p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-ink">{item.documentName}</p>
                        <p className="text-xs text-muted">{item.description}</p>
                      </div>
                      <Badge tone={item.requirementSource === 'VERIFIED' ? 'info' : 'outline'}>
                        {item.requirementSource === 'VERIFIED' ? 'Recorded in source' : 'Indicative list'}
                      </Badge>
                    </div>

                    <div className="mt-3">
                      {options.length === 0 ? (
                        <p className="rounded-sm border border-dashed border-line px-3 py-2 text-xs text-muted">
                          You have no document of this type in your wallet.{' '}
                          <a href="/student/documents" className="font-medium text-maroon underline underline-offset-4">
                            Add one
                          </a>
                          .
                        </p>
                      ) : (
                        <Select
                          aria-label={`Document for ${item.documentName}`}
                          name={`document:${item.documentType}`}
                          value={chosen}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              documents: { ...draft.documents, [item.documentType]: event.target.value },
                            })
                          }
                        >
                          <option value="">Do not attach</option>
                          {options.map((document) => (
                            <option key={document.id} value={document.id}>
                              {document.documentName} — {document.status.replace(/_/g, ' ').toLowerCase()}
                            </option>
                          ))}
                        </Select>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {step === 'review' ? (
          <section className="space-y-4">
            <ReviewBlock
              title="Personal"
              rows={[
                ['Full name', draft.personal.fullName],
                ['Date of birth', draft.personal.dateOfBirth],
                ['Gender', GENDER_LABEL[draft.personal.gender as never] ?? 'Not provided'],
                ['State / district', `${draft.personal.state || '—'}${draft.personal.district ? `, ${draft.personal.district}` : ''}`],
                ['Email', draft.personal.email],
                ['Mobile', draft.personal.mobile || 'Not provided'],
              ]}
            />
            <ReviewBlock
              title="Education"
              rows={[
                ['Level', EDUCATION_LEVEL_LABEL[draft.education.educationLevel as never] ?? 'Not provided'],
                ['Course', draft.education.course || '—'],
                ['Institution', draft.education.institution || '—'],
                ['Year of study', draft.education.academicYear || '—'],
                ['Previous qualification', draft.education.previousQualification || '—'],
                ['Percentage / CGPA', draft.education.percentageOrCgpa || 'Not provided'],
              ]}
            />
            <ReviewBlock
              title="Household"
              rows={[
                ['Annual family income', draft.household.annualFamilyIncome ? formatINR(Number(draft.household.annualFamilyIncome)) : 'Not provided'],
                ['Household size', draft.household.householdSize || '—'],
                ['Category', SOCIAL_CATEGORY_LABEL[draft.household.category as never] ?? 'Not provided'],
                ['ST status', draft.household.isST ? 'Confirmed by you' : 'Not confirmed'],
                ['Primary occupation', draft.household.primaryOccupation || '—'],
              ]}
            />
            <ReviewBlock
              title="Documents attached"
              rows={requiredDocuments
                .filter((item) => draft.documents[item.documentType])
                .map((item) => [
                  item.documentName,
                  wallet.find((document) => document.id === draft.documents[item.documentType])?.documentName ?? '',
                ])}
            />

            <label className="flex items-start gap-2.5 rounded-md border border-maroon/30 bg-maroon-wash/50 p-3">
              <Checkbox
                name="declaration"
                checked={draft.declaration.accepted}
                onChange={(event) => setDraft({ ...draft, declaration: { accepted: event.target.checked } })}
                className="mt-0.5"
              />
              <span className="text-sm text-ink">
                I declare that the information given is true to the best of my knowledge and I understand that a
                reviewing officer may ask for proof of any statement. Aletheia does not submit this application to any
                government portal.
              </span>
            </label>
          </section>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={stepIndex === 0}
            onClick={() => setStep(STEP_LABELS[Math.max(0, stepIndex - 1)].key)}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <SaveHint state={saveState.message} />
            {step !== 'review' ? <SaveDraftButton /> : null}
            {step === 'review' ? (
              <SubmitButton />
            ) : (
              <Button
                type="button"
                onClick={() => setStep(STEP_LABELS[Math.min(STEP_LABELS.length - 1, stepIndex + 1)].key)}
                disabled={!stepValid}
                title={stepValid ? undefined : 'Complete this section to continue'}
              >
                Continue
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </form>

      {step === 'review' && !applicationId ? (
        <Alert tone="warning">
          Save the draft once before submitting, so the application has a reference number.
        </Alert>
      ) : null}
    </div>
  );
}

function SaveDraftButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" loading={pending}>
      <Save className="h-4 w-4" aria-hidden />
      Save draft
    </Button>
  );
}

function SaveHint({ state }: { state?: string }) {
  if (!state) return null;
  return <span className="text-xs text-status-success">{state}</span>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending}>
      <FileCheck2 className="h-4 w-4" aria-hidden />
      Submit application
    </Button>
  );
}

function ReviewBlock({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <h3 className="font-display text-base text-ink">{title}</h3>
      <dl className="mt-2 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        {rows.length === 0 ? (
          <p className="text-muted">Nothing recorded.</p>
        ) : (
          rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 border-b border-line/60 py-1 last:border-0">
              <dt className="text-muted">{label}</dt>
              <dd className="text-right text-ink">{value || '—'}</dd>
            </div>
          ))
        )}
      </dl>
    </div>
  );
}
