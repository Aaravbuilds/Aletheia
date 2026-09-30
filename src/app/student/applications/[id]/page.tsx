import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ExternalLink } from 'lucide-react';

import { requireStudent } from '@/lib/auth/guards';
import { getProfileById } from '@/lib/db/profiles';
import {
  getApplicationForStudent,
  listActivity,
  listApplicationDocuments,
} from '@/lib/db/applications';
import { listDeficiencies } from '@/lib/db/deficiencies';
import { getSchemeByIdWithRelations } from '@/lib/db/schemes';
import { getDocumentById, listDocumentsWithFindings } from '@/lib/db/documents';
import { ActivityTimeline, StatusTimeline } from '@/components/applications/status-timeline';
import { CorrectionForm } from '@/components/applications/correction-form';
import { ApplicationStatusBadge } from '@/components/ui/status';
import { Card, CardContent, CardHeader, CardTitle, Divider, SectionHeading } from '@/components/ui/card';
import { Alert, EmptyState } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import {
  APPLICATION_DOCUMENT_STATUS_LABEL,
  APPLICATION_STATUS_DESCRIPTION,
  DEFICIENCY_TYPE_LABEL,
  DOCUMENT_TYPE_LABEL,
} from '@/lib/domain/workflow';
import { AI_BOUNDARY_NOTICE } from '@/lib/domain/copy';
import { formatDate, formatDateTime, formatINR } from '@/lib/utils';

export const metadata = { title: 'Application' };

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { id } = await params;
  const { submitted } = await searchParams;
  const user = await requireStudent();

  const profile = getProfileById(user.studentId);
  if (!profile) return <Alert tone="warning">Complete your profile first.</Alert>;

  const application = getApplicationForStudent(id, profile.id);
  if (!application) notFound();

  const scheme = getSchemeByIdWithRelations(application.schemeId);
  const applicationDocuments = listApplicationDocuments(application.id);
  const activity = listActivity(application.id);
  const deficiencies = listDeficiencies(application.id);
  const wallet = listDocumentsWithFindings(profile.id);

  if (application.status === 'DRAFT') {
    return (
      <div className="space-y-5">
        <Alert tone="info" title="This application is still a draft">
          Nothing has been submitted. Continue where you left off, or review the scheme details first.
        </Alert>
        <Link
          href={`/student/applications/new/${scheme?.slug}`}
          className="inline-flex h-10 items-center rounded-md bg-maroon px-4 text-sm font-medium text-surface"
        >
          Continue application
        </Link>
      </div>
    );
  }

  const snapshot = application.snapshot;
  const openDeficiencies = deficiencies.filter((item) => item.status === 'OPEN');

  return (
    <div className="space-y-7">
      <Link
        href="/student/applications"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-maroon"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All applications
      </Link>

      {submitted ? (
        <Alert tone="success" title={`Application ${submitted} submitted`}>
          It is now in the reviewing queue. You will see every stage change here.
        </Alert>
      ) : null}

      <SectionHeading
        eyebrow={`${application.applicationNumber}${application.cycleLabel ? ` · cycle ${application.cycleLabel}` : ''}`}
        title={scheme?.name ?? 'Scholarship application'}
        description={APPLICATION_STATUS_DESCRIPTION[application.status]}
        action={<ApplicationStatusBadge status={application.status} />}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>Where it stands</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline status={application.status} />
            <Divider className="my-4" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Submitted</dt>
                <dd className="text-ink">{formatDateTime(application.submittedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Last update</dt>
                <dd className="text-ink">{formatDateTime(application.updatedAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {openDeficiencies.length > 0 ? (
            <Card className="border-status-warning/40">
              <CardHeader>
                <CardTitle>What you need to fix</CardTitle>
                <p className="text-sm text-muted">
                  A reviewing officer asked for a correction. Respond here — you do not need to start again.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {openDeficiencies.map((deficiency) => {
                  const document = deficiency.documentId ? getDocumentById(deficiency.documentId) : null;
                  return (
                    <div key={deficiency.id} className="rounded-md border border-status-warning/35 bg-status-warning/8 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-ink">
                            {deficiency.requiredDocumentType
                              ? DOCUMENT_TYPE_LABEL[deficiency.requiredDocumentType]
                              : 'Application information'}
                          </p>
                          <p className="text-xs text-muted">{DEFICIENCY_TYPE_LABEL[deficiency.type]}</p>
                        </div>
                        <Badge tone="warning">Requested {formatDate(deficiency.createdAt)}</Badge>
                      </div>

                      <p className="mt-2 text-sm text-ink/90">{deficiency.description}</p>

                      <div className="mt-3 rounded-sm border border-line bg-surface p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                          What you need to do
                        </p>
                        <p className="mt-1 text-sm text-ink">{deficiency.requiredAction}</p>
                      </div>

                      {document ? (
                        <p className="mt-2 text-xs text-muted">
                          Currently attached: <span className="font-medium text-ink">{document.documentName}</span>
                        </p>
                      ) : null}

                      <div className="mt-4">
                        <CorrectionForm
                          deficiency={deficiency}
                          applicationId={application.id}
                          candidates={wallet.filter(
                            (item) => !['EXPIRED', 'INVALID'].includes(item.status),
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : null}

          {deficiencies.filter((item) => item.status !== 'OPEN').length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Resolved corrections</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {deficiencies
                    .filter((item) => item.status !== 'OPEN')
                    .map((item) => (
                      <li key={item.id} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-success" aria-hidden />
                        <span>
                          <span className="font-medium text-ink">{item.title}</span>
                          <span className="block text-xs text-muted">
                            {item.resolvedAt ? `Resolved ${formatDate(item.resolvedAt)}` : 'Resolved'}
                          </span>
                        </span>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Documents you submitted</CardTitle>
              <p className="text-sm text-muted">
                Each entry points at the document in your wallet, so the same file can be reused.
              </p>
            </CardHeader>
            <CardContent>
              {applicationDocuments.length === 0 ? (
                <EmptyState title="No documents were attached" />
              ) : (
                <ul className="space-y-2.5">
                  {applicationDocuments.map((record) => {
                    const document = record.documentId ? getDocumentById(record.documentId) : null;
                    return (
                      <li
                        key={record.id}
                        className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2.5 last:border-0"
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-ink">
                            {DOCUMENT_TYPE_LABEL[record.requiredDocumentType]}
                          </span>
                          <span className="block text-xs text-muted">
                            {document?.documentName ?? 'No file attached'}
                            {record.isReplacement ? ' · replacement' : ''}
                          </span>
                          {record.reviewNotes ? (
                            <span className="mt-0.5 block text-xs italic text-muted">“{record.reviewNotes}”</span>
                          ) : null}
                        </span>
                        <Badge
                          tone={
                            record.status === 'ACCEPTED'
                              ? 'success'
                              : record.status === 'NEEDS_CORRECTION'
                                ? 'warning'
                                : 'neutral'
                          }
                        >
                          {APPLICATION_DOCUMENT_STATUS_LABEL[record.status]}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-4 text-xs leading-relaxed text-muted">{AI_BOUNDARY_NOTICE}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Submitted information</CardTitle>
            <p className="text-sm text-muted">
              A snapshot taken at submission, so later profile edits do not change what was applied for.
            </p>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <Row label="Name" value={snapshot?.fullName} />
              <Row label="Category" value={snapshot?.category ? `${snapshot.category}${snapshot.isST ? ' (ST)' : ''}` : null} />
              <Row label="State / district" value={[snapshot?.state, snapshot?.district].filter(Boolean).join(', ') || null} />
              <Row label="Course" value={snapshot?.course} />
              <Row label="Institution" value={snapshot?.institution} />
              <Row label="Year of study" value={snapshot?.academicYear} />
              <Row label="Annual family income" value={snapshot?.annualFamilyIncome ? formatINR(snapshot.annualFamilyIncome) : null} />
              <Row label="Household size" value={snapshot?.householdSize ? String(snapshot.householdSize) : null} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline events={activity} />
          </CardContent>
        </Card>
      </div>

      {scheme ? (
        <Card className="bg-surface/70">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-display text-base text-ink">Scheme information</p>
              <p className="text-xs text-muted">
                {scheme.sourceTitle} · recorded {formatDate(scheme.lastVerifiedAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/student/scholarships/${scheme.slug}`}
                className="text-sm font-medium text-maroon underline underline-offset-4"
              >
                Open scheme page
              </Link>
              <a
                href={scheme.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-sm text-muted hover:text-maroon"
              >
                Source
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line/60 py-1.5 last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-ink">{value || 'Not provided'}</dd>
    </div>
  );
}
