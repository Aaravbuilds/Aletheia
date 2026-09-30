'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Field, Select, Textarea } from '@/components/ui/field';
import { Alert } from '@/components/ui/feedback';
import { submitCorrectionAction, type ApplicationState } from '@/app/actions/applications';
import { DOCUMENT_STATUS_LABEL, DOCUMENT_TYPE_LABEL } from '@/lib/domain/workflow';
import type { Deficiency, StudentDocument } from '@/types';

export function CorrectionForm({
  deficiency,
  applicationId,
  candidates,
}: {
  deficiency: Deficiency;
  applicationId: string;
  candidates: StudentDocument[];
}) {
  const [state, action] = useActionState<ApplicationState, FormData>(submitCorrectionAction, {});
  const requiredType = deficiency.requiredDocumentType ?? 'OTHER';

  if (state.message) {
    return <Alert tone="success">{state.message}</Alert>;
  }

  const options = candidates.filter(
    (document) => document.documentType === requiredType || document.documentType === 'OTHER',
  );

  return (
    <form action={action} className="space-y-3">
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <input type="hidden" name="applicationId" value={applicationId} />
      <input type="hidden" name="deficiencyId" value={deficiency.id} />
      <input type="hidden" name="requiredDocumentType" value={requiredType} />

      <Field
        label="Which document are you sending as the correction?"
        htmlFor="documentId"
        required
        hint="Attach a document from your wallet. If you uploaded a new file, add it to the wallet first."
      >
        <Select id="documentId" name="documentId" defaultValue="" required>
          <option value="" disabled>
            Choose a document
          </option>
          {options.map((document) => (
            <option key={document.id} value={document.id}>
              {document.documentName} — {DOCUMENT_STATUS_LABEL[document.status]} ·{' '}
              {DOCUMENT_TYPE_LABEL[document.documentType]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="What did you change?" htmlFor="note" required hint="One line is enough. The officer sees this note.">
        <Textarea id="note" name="note" className="min-h-20" required />
      </Field>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Send correction
    </Button>
  );
}
