'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2, Flag, ScanSearch } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { Alert } from '@/components/ui/feedback';
import {
  createDeficiencyAction,
  reviewDocumentAction,
  runPrescreeningAction,
  updateStatusAction,
  type ReviewState,
} from '@/app/actions/admin';
import {
  APPLICATION_DOCUMENT_STATUS_LABEL,
  DEFICIENCY_TYPE_LABEL,
  DOCUMENT_TYPE_LABEL,
} from '@/lib/domain/workflow';
import type {
  ApplicationDocumentStatus,
  ApplicationStatus,
  DeficiencyType,
  DocumentType,
} from '@/types';

export function DocumentReviewForm({
  applicationId,
  applicationDocumentId,
  currentStatus,
  requiredDocumentType,
  notes,
}: {
  applicationId: string;
  applicationDocumentId: string;
  currentStatus: ApplicationDocumentStatus;
  requiredDocumentType: DocumentType;
  notes: string | null;
}) {
  const [state, action] = useActionState<ReviewState, FormData>(reviewDocumentAction, {});

  return (
    <form action={action} className="space-y-3">
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}

      <input type="hidden" name="applicationId" value={applicationId} />
      <input type="hidden" name="applicationDocumentId" value={applicationDocumentId} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Decision" htmlFor={`status-${applicationDocumentId}`} required>
          <Select id={`status-${applicationDocumentId}`} name="status" defaultValue={currentStatus}>
            {(['UNDER_REVIEW', 'ACCEPTED', 'NEEDS_CORRECTION'] as ApplicationDocumentStatus[]).map((status) => (
              <option key={status} value={status}>
                {APPLICATION_DOCUMENT_STATUS_LABEL[status]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Review note"
          htmlFor={`notes-${applicationDocumentId}`}
          hint={`About ${DOCUMENT_TYPE_LABEL[requiredDocumentType]}.`}
        >
          <Input id={`notes-${applicationDocumentId}`} name="notes" defaultValue={notes ?? ''} />
        </Field>
      </div>

      <ReviewSubmit label="Save decision" />
    </form>
  );
}

export function DeficiencyForm({
  applicationId,
  documents,
  defaultDocumentType,
}: {
  applicationId: string;
  documents: { id: string; label: string }[];
  defaultDocumentType?: DocumentType | null;
}) {
  const [state, action] = useActionState<ReviewState, FormData>(createDeficiencyAction, {});

  return (
    <form action={action} className="space-y-3.5">
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}

      <input type="hidden" name="applicationId" value={applicationId} />

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="What is wrong?" htmlFor="type" required>
          <Select id="type" name="type" defaultValue="MISSING_DOCUMENT" required>
            {(Object.keys(DEFICIENCY_TYPE_LABEL) as DeficiencyType[]).map((type) => (
              <option key={type} value={type}>
                {DEFICIENCY_TYPE_LABEL[type]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Document concerned" htmlFor="requiredDocumentType" hint="Leave as “No specific document” for profile information issues.">
          <Select id="requiredDocumentType" name="requiredDocumentType" defaultValue={defaultDocumentType ?? ''}>
            <option value="">No specific document</option>
            {(Object.keys(DOCUMENT_TYPE_LABEL) as DocumentType[]).map((type) => (
              <option key={type} value={type}>
                {DOCUMENT_TYPE_LABEL[type]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {documents.length > 0 ? (
        <Field label="Attach the document under review" htmlFor="documentId" hint="Optional. Links the request to a specific file.">
          <Select id="documentId" name="documentId" defaultValue="">
            <option value="">No file attached</option>
            {documents.map((document) => (
              <option key={document.id} value={document.id}>
                {document.label}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <Field label="Explain the issue" htmlFor="description" required hint="The student sees this text.">
        <Textarea id="description" name="description" className="min-h-20" required />
      </Field>

      <Field label="What should the student do?" htmlFor="requiredAction" required hint="Actionable and specific.">
        <Textarea id="requiredAction" name="requiredAction" className="min-h-20" required />
      </Field>

      <label className="flex items-start gap-2 text-sm text-ink">
        <input type="checkbox" name="moveStatus" value="yes" defaultChecked className="mt-0.5" />
        <span>
          Move the application to <span className="font-medium">Deficient — action required</span> while this is open.
        </span>
      </label>

      <ReviewSubmit label="Request correction" icon="flag" />
    </form>
  );
}

export function StatusForm({
  applicationId,
  currentStatus,
  allowed,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
  allowed: ApplicationStatus[];
}) {
  const [state, action] = useActionState<ReviewState, FormData>(updateStatusAction, {});

  if (allowed.length === 0) {
    return (
      <Alert tone="success" title="Workflow complete">
        This application has reached the end of the configured workflow.
      </Alert>
    );
  }

  return (
    <form action={action} className="space-y-3">
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}

      <input type="hidden" name="applicationId" value={applicationId} />
      <input type="hidden" name="currentStatus" value={currentStatus} />

      <Field label="Move to" htmlFor="next" required hint="Only stages allowed from the current one are offered.">
        <Select id="next" name="next" defaultValue={allowed[0]} required>
          {allowed.map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, ' ').toLowerCase()}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Note for the record" htmlFor="note">
        <Input id="note" name="note" placeholder="Optional internal note" />
      </Field>

      <ReviewSubmit label="Update status" icon="check" />
    </form>
  );
}

export function PrescreeningButton({ applicationId }: { applicationId: string }) {
  const [state, action] = useActionState<ReviewState, FormData>(runPrescreeningAction, {});

  return (
    <form action={action} className="space-y-3">
      {state.error ? <Alert tone="warning">{state.error}</Alert> : null}
      {state.message ? <Alert tone="info">{state.message}</Alert> : null}
      <input type="hidden" name="applicationId" value={applicationId} />
      <PrescreenButton />
    </form>
  );
}

function PrescreenButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" loading={pending}>
      <ScanSearch className="h-4 w-4" aria-hidden />
      Run document pre-screening
    </Button>
  );
}

function ReviewSubmit({ label, icon }: { label: string; icon?: 'check' | 'flag' }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {icon === 'check' ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : null}
      {icon === 'flag' ? <Flag className="h-4 w-4" aria-hidden /> : null}
      {label}
    </Button>
  );
}
