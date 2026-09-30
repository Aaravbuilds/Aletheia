'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Download, FileSearch, Sparkles, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/field';
import { Alert, EmptyState } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { DOCUMENT_SOURCE_LABEL, DOCUMENT_STATUS_LABEL, DOCUMENT_TYPE_LABEL } from '@/lib/domain/workflow';
import { uploadDocumentAction, importFromDigiLockerAction, type DocumentState } from '@/app/actions/documents';
import type { DigiLockerDocument, DocumentType, StudentDocument } from '@/types';
import { formatDate, formatINR, maskDocumentNumber } from '@/lib/utils';

const UPLOAD_TYPES: DocumentType[] = [
  'ST_CERTIFICATE',
  'INCOME_CERTIFICATE',
  'MARKSHEET',
  'COLLEGE_ID',
  'ADMISSION_PROOF',
  'ADMISSION_OFFER',
  'BONAFIDE_CERTIFICATE',
  'BANK_PROOF',
  'FEE_RECEIPT',
  'PASSPORT_DOCUMENT',
  'IDENTITY_DOCUMENT',
  'OTHER',
];

export function UploadDocumentForm() {
  const [state, action] = useActionState<DocumentState, FormData>(uploadDocumentAction, {});

  return (
    <form action={action} className="space-y-4">
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.message ? (
        <Alert tone={state.degraded ? 'warning' : 'success'}>
          {state.message}
          {state.provider === 'MOCK' ? (
            <span className="mt-1 block text-xs">
              Processed by the offline demonstration provider — no AI request was made.
            </span>
          ) : null}
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Document type" htmlFor="documentType" required>
          <Select id="documentType" name="documentType" defaultValue="" required>
            <option value="" disabled>
              Choose a type
            </option>
            {UPLOAD_TYPES.map((type) => (
              <option key={type} value={type}>
                {DOCUMENT_TYPE_LABEL[type]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Document name" htmlFor="documentName" hint="Leave blank to use the standard name.">
          <Input id="documentName" name="documentName" placeholder="e.g. Income Certificate 2025-26" />
        </Field>

        <Field
          label="Name printed on this document"
          htmlFor="declaredName"
          hint="Used for the offline consistency check against your profile."
          className="sm:col-span-2"
        >
          <Input id="declaredName" name="declaredName" placeholder="e.g. Rahul Kumar" />
        </Field>

        <Field label="Valid until" htmlFor="expiryDate" hint="Only if the document has an expiry date.">
          <Input id="expiryDate" name="expiryDate" type="date" />
        </Field>

        <Field label="File" htmlFor="file" required hint="PDF, JPG, PNG or WEBP, up to 5 MB.">
          <input
            id="file"
            name="file"
            type="file"
            required
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm file:mr-3 file:rounded-sm file:border-0 file:bg-parchment file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink"
          />
        </Field>
      </div>

      <UploadButton />
    </form>
  );
}

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      <Upload className="h-4 w-4" aria-hidden />
      Add to wallet
    </Button>
  );
}

export function DigiLockerImportForm({ records }: { records: DigiLockerDocument[] }) {
  const [state, action] = useActionState<DocumentState, FormData>(importFromDigiLockerAction, {});

  return (
    <form action={action} className="space-y-3">
      <Alert tone="warning" title="Demo DigiLocker Connection">
        This is a demonstration only. Aletheia does not connect to DigiLocker or any government service, and no
        consent request is sent anywhere. The records below are synthetic.
      </Alert>

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}

      <ul className="space-y-2">
        {records.map((record) => (
          <li key={record.externalId} className="flex items-center justify-between gap-3 rounded-md border border-line bg-canvas/60 px-3 py-2">
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink">{record.documentName}</span>
              <span className="block truncate text-xs text-muted">
                {record.issuer} · {record.issuedOn} · {record.sizeLabel}
              </span>
            </span>
            <Button type="submit" name="externalId" value={record.externalId} size="sm" variant="secondary">
              <Download className="h-3.5 w-3.5" aria-hidden />
              Import
            </Button>
          </li>
        ))}
      </ul>
    </form>
  );
}

export function DocumentWallet({ documents }: { documents: StudentDocument[] }) {
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'ATTENTION'>('ALL');

  const available = documents.filter((document) =>
    ['VERIFIED', 'UPLOADED', 'PROCESSING'].includes(document.status),
  );
  const attention = documents.filter((document) =>
    ['NEEDS_ATTENTION', 'INVALID', 'EXPIRED'].includes(document.status),
  );

  const visible =
    filter === 'AVAILABLE' ? available : filter === 'ATTENTION' ? attention : documents;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')}>
          All ({documents.length})
        </FilterButton>
        <FilterButton active={filter === 'AVAILABLE'} onClick={() => setFilter('AVAILABLE')}>
          Ready to use ({available.length})
        </FilterButton>
        <FilterButton active={filter === 'ATTENTION'} onClick={() => setFilter('ATTENTION')}>
          Needs attention ({attention.length})
        </FilterButton>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-6 w-6" aria-hidden />}
          title={filter === 'ALL' ? 'Your wallet is empty' : 'Nothing in this group'}
          description={
            filter === 'ALL'
              ? 'Upload a document once and reuse it in every application that needs it.'
              : 'Change the filter to see your other documents.'
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((document) => (
            <li key={document.id} className="rounded-lg border border-line bg-surface p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{document.documentName}</p>
                  <p className="mt-0.5 text-xs text-muted">{DOCUMENT_TYPE_LABEL[document.documentType]}</p>
                </div>
                <DocumentStatusPill status={document.status} />
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div>
                  <dt className="text-muted">Source</dt>
                  <dd className="text-ink">{DOCUMENT_SOURCE_LABEL[document.source]}</dd>
                </div>
                <div>
                  <dt className="text-muted">Added</dt>
                  <dd className="text-ink">{formatDate(document.uploadedAt)}</dd>
                </div>
                {document.expiryDate ? (
                  <div>
                    <dt className="text-muted">Valid until</dt>
                    <dd className="text-ink">{formatDate(document.expiryDate)}</dd>
                  </div>
                ) : null}
                {document.extractionConfidence !== null ? (
                  <div>
                    <dt className="text-muted">Read confidence</dt>
                    <dd className="text-ink">{Math.round(document.extractionConfidence * 100)}%</dd>
                  </div>
                ) : null}
              </dl>

              <ExtractedFields document={document} />

              {document.findings && document.findings.length > 0 ? (
                <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                  {document.findings.map((finding) => (
                    <li key={finding.id} className="text-xs">
                      <span
                        className={
                          finding.severity === 'WARNING' || finding.severity === 'HIGH'
                            ? 'font-medium text-[#8a5c14]'
                            : 'text-muted'
                        }
                      >
                        {finding.title}
                      </span>
                      <span className="block text-muted">{finding.description}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-3 border-t border-line pt-3">
                <Link
                  href={`/api/documents/${document.id}/file`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-maroon hover:underline underline-offset-4"
                >
                  <FileSearch className="h-3.5 w-3.5" aria-hidden />
                  {document.hasFile ? 'View file' : 'View record'}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? 'inline-flex h-8 items-center rounded-full border border-maroon bg-maroon px-3 text-xs font-medium text-surface'
          : 'inline-flex h-8 items-center rounded-full border border-line bg-surface px-3 text-xs font-medium text-muted transition-colors hover:border-maroon/40 hover:text-maroon'
      }
    >
      {children}
    </button>
  );
}

function DocumentStatusPill({ status }: { status: StudentDocument['status'] }) {
  const tone =
    status === 'VERIFIED' || status === 'UPLOADED'
      ? 'success'
      : status === 'NEEDS_ATTENTION' || status === 'INVALID'
        ? 'warning'
        : status === 'EXPIRED'
          ? 'error'
          : 'neutral';
  return <Badge tone={tone}>{DOCUMENT_STATUS_LABEL[status]}</Badge>;
}

function ExtractedFields({ document }: { document: StudentDocument }) {
  const extracted = document.extractedData;
  if (!extracted) return null;

  const rows: { label: string; value: string }[] = [];
  if (typeof extracted.name === 'string' && extracted.name) {
    rows.push({ label: 'Name on document', value: extracted.name });
  }
  if (typeof extracted.documentNumber === 'string' && extracted.documentNumber) {
    rows.push({ label: 'Document number', value: maskDocumentNumber(extracted.documentNumber) });
  }
  if (typeof extracted.financialYear === 'string' && extracted.financialYear) {
    rows.push({ label: 'Financial year', value: extracted.financialYear });
  }
  if (typeof extracted.institution === 'string' && extracted.institution) {
    rows.push({ label: 'Institution', value: extracted.institution });
  }
  if (typeof extracted.course === 'string' && extracted.course) {
    rows.push({ label: 'Course', value: extracted.course });
  }
  if (typeof extracted.issuingAuthority === 'string' && extracted.issuingAuthority) {
    rows.push({ label: 'Issuing authority', value: extracted.issuingAuthority });
  }
  if (extracted.issueDate) {
    const raw = String(extracted.issueDate);
    if (raw) rows.push({ label: 'Issue date', value: formatDate(raw) });
  }
  if (extracted.income !== null && extracted.income !== undefined && extracted.income !== '') {
    const amount = Number(extracted.income);
    rows.push({ label: 'Recorded income', value: Number.isNaN(amount) ? String(extracted.income) : formatINR(amount) });
  }

  if (rows.length === 0) return null;

  return (
    <div className="mt-3 rounded-md border border-line/70 bg-canvas/50 px-3 py-2.5">
      <p className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted">What Aletheia read</p>
      <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {rows.slice(0, 6).map((row) => (
          <div key={row.label}>
            <dt className="truncate text-muted">{row.label}</dt>
            <dd className="truncate text-ink" title={row.value}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      {document.extractionConfidence !== null ? (
        <p className="mt-1.5 text-[0.625rem] text-muted/80">
          Read automatically. These values are observations for a reviewer — not a verification.
        </p>
      ) : null}
    </div>
  );
}
