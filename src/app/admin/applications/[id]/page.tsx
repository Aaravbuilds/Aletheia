import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, FileSearch } from 'lucide-react';

import { requireAdmin } from '@/lib/auth/guards';
import {
  getApplicationById,
  listActivity,
  listApplicationDocuments,
} from '@/lib/db/applications';
import { listDeficiencies } from '@/lib/db/deficiencies';
import { getProfileById } from '@/lib/db/profiles';
import { getSchemeByIdWithRelations } from '@/lib/db/schemes';
import { getDocumentById, listDocumentsWithFindings } from '@/lib/db/documents';
import { getSchemeMatch } from '@/lib/matching/service';
import { OutcomeIcon } from '@/components/scholarships/scholarship-card';
import { ActivityTimeline, StatusTimeline } from '@/components/applications/status-timeline';
import { DeficiencyForm, DocumentReviewForm, PrescreeningButton, StatusForm } from '@/components/admin/review-forms';
import { ApplicationStatusBadge, MatchBadge } from '@/components/ui/status';
import { Card, CardContent, CardHeader, CardTitle, Divider, SectionHeading } from '@/components/ui/card';
import { Alert } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import {
  ALLOWED_STATUS_TRANSITIONS,
  APPLICATION_DOCUMENT_STATUS_LABEL,
  APPLICATION_STATUS_DESCRIPTION,
  DEFICIENCY_TYPE_LABEL,
  DOCUMENT_SOURCE_LABEL,
  DOCUMENT_STATUS_LABEL,
  DOCUMENT_TYPE_LABEL,
} from '@/lib/domain/workflow';
import { AI_BOUNDARY_NOTICE, SOURCE_VERIFICATION_NOTICE } from '@/lib/domain/copy';
import { formatDate, formatDateTime, formatINR } from '@/lib/utils';

export const metadata = { title: 'Application review' };

export default async function AdminApplicationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const application = getApplicationById(id);
  if (!application) notFound();

  const profile = getProfileById(application.studentId);
  const scheme = getSchemeByIdWithRelations(application.schemeId);
  const documents = listApplicationDocuments(application.id);
  const deficiencies = listDeficiencies(application.id);
  const activity = listActivity(application.id);
  const match = profile ? getSchemeMatch(profile.id, application.schemeId) : null;
  const wallet = profile ? listDocumentsWithFindings(profile.id) : [];

  const snapshot = application.snapshot;
  const openDeficiencies = deficiencies.filter((item) => item.status === 'OPEN');
  const allowedNext = ALLOWED_STATUS_TRANSITIONS[application.status];

  const attachmentOptions = documents
    .filter((record) => record.documentId)
    .map((record) => {
      const document = record.documentId ? getDocumentById(record.documentId) : null;
      return {
        id: record.documentId!,
        label: `${DOCUMENT_TYPE_LABEL[record.requiredDocumentType]} — ${document?.documentName ?? 'file'}`,
      };
    });

  return (
    <div className="space-y-7">
      <Link
        href="/admin/applications"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-maroon"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Review queue
      </Link>

      <SectionHeading
        eyebrow={`${application.applicationNumber || 'Draft'}${application.cycleLabel ? ` · cycle ${application.cycleLabel}` : ''}`}
        title={profile?.fullName ?? snapshot?.fullName ?? 'Student'}
        description={APPLICATION_STATUS_DESCRIPTION[application.status]}
        action={<ApplicationStatusBadge status={application.status} />}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Student overview</CardTitle>
            <p className="text-sm text-muted">
              {scheme ? (
                <>
                  Applying for <span className="font-medium text-ink">{scheme.name}</span>
                </>
              ) : (
                'Scheme record unavailable'
              )}
            </p>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <Row label="Category" value={snapshot?.isST ? 'ST' : snapshot?.category ?? undefined} />
              <Row label="PVTG" value={snapshot?.isPVTG ? 'Yes' : 'No'} />
              <Row label="State / district" value={[snapshot?.state, snapshot?.district].filter(Boolean).join(', ')} />
              <Row label="Mobile" value={profile?.mobile} />
              <Row label="Course" value={snapshot?.course ?? profile?.course} />
              <Row label="Institution" value={snapshot?.institution ?? profile?.institution} />
              <Row label="Year of study" value={snapshot?.academicYear ?? profile?.academicYear} />
              <Row label="Previous qualification" value={snapshot?.previousQualification ?? profile?.previousQualification} />
              <Row
                label="Annual family income"
                value={snapshot?.annualFamilyIncome ? formatINR(snapshot.annualFamilyIncome) : undefined}
              />
              <Row label="Household size" value={snapshot?.householdSize ? String(snapshot.householdSize) : undefined} />
            </dl>
            <p className="mt-3 text-xs text-muted">
              Submitted {formatDateTime(application.submittedAt)} · last updated {formatDateTime(application.updatedAt)}
            </p>
            <Alert tone="info" className="mt-4">
              Aletheia captures a snapshot at submission. Values shown here are what the student applied with, not
              necessarily the current profile.
            </Alert>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline status={application.status} />
          </CardContent>
        </Card>
      </div>

      {match ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Eligibility summary</CardTitle>
              <MatchBadge status={match.status} />
            </div>
            <p className="text-sm text-muted">
              Deterministic checks against the recorded scheme rules. Aletheia never decides eligibility; this is the
              evidence an officer works from.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {match.conditions.map((condition) => (
              <div key={condition.ruleId} className="flex items-start gap-3">
                <OutcomeIcon outcome={condition.outcome} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {condition.label}
                    {!condition.required ? (
                      <span className="ml-1.5 text-xs font-normal text-muted">(supporting)</span>
                    ) : null}
                  </p>
                  <p className="text-sm text-muted">{condition.detail}</p>
                </div>
              </div>
            ))}
            <Divider className="my-3" />
            <p className="text-xs leading-relaxed text-muted">{AI_BOUNDARY_NOTICE}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Submitted documents</CardTitle>
              <p className="text-sm text-muted">
                Verify each file yourself. Pre-screening observations are advisory and recorded per document below.
              </p>
            </div>
            <PrescreeningButton applicationId={application.id} />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {documents.length === 0 ? (
            <Alert tone="warning" title="No documents attached">
              This application has no attached documents to review. Consider requesting the missing items.
            </Alert>
          ) : (
            documents.map((record) => {
              const document = record.documentId ? getDocumentById(record.documentId) : null;
              return (
                <div key={record.id} className="rounded-lg border border-line bg-canvas/40 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{DOCUMENT_TYPE_LABEL[record.requiredDocumentType]}</p>
                      <p className="text-xs text-muted">
                        {document ? document.documentName : 'No file attached'}
                        {document ? ` · ${DOCUMENT_SOURCE_LABEL[document.source]} · added ${formatDate(document.uploadedAt)}` : ''}
                        {record.isReplacement ? ' · replacement' : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {document ? (
                        <Badge
                          tone={
                            document.status === 'VERIFIED'
                              ? 'success'
                              : document.status === 'NEEDS_ATTENTION' || document.status === 'INVALID'
                                ? 'warning'
                                : 'neutral'
                          }
                        >
                          Wallet: {DOCUMENT_STATUS_LABEL[document.status]}
                        </Badge>
                      ) : null}
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
                    </div>
                  </div>

                  {document ? (
                    <div className="mt-3 grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <Link
                          href={`/api/documents/${document.id}/file`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-maroon hover:underline underline-offset-4"
                        >
                          <FileSearch className="h-4 w-4" aria-hidden />
                          {document.hasFile ? 'Open file' : 'Open record'}
                        </Link>
                        {document.extractedData ? (
                          <dl className="space-y-1 text-xs">
                            {Object.entries(document.extractedData).slice(0, 6).map(([key, value]) =>
                              value === null || value === undefined || value === '' ? null : (
                                <div key={key} className="flex justify-between gap-3">
                                  <dt className="text-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}</dt>
                                  <dd className="text-right text-ink">{String(value)}</dd>
                                </div>
                              ),
                            )}
                          </dl>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                          AI pre-screening observations
                        </p>
                        {document.findings && document.findings.length > 0 ? (
                          <ul className="space-y-1.5">
                            {document.findings.map((finding) => (
                              <li key={finding.id} className="text-xs">
                                <span
                                  className={
                                    finding.severity === 'INFO' ? 'font-medium text-muted' : 'font-medium text-[#8a5c14]'
                                  }
                                >
                                  {finding.title}
                                  {finding.confidence !== null
                                    ? ` · ${Math.round(finding.confidence * 100)}%`
                                    : ''}
                                </span>
                                <span className="block text-muted">{finding.description}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted">No observations recorded yet.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-muted">
                      The student has not attached a file for this requirement yet.
                    </p>
                  )}

                  <Divider className="my-4" />

                  <DocumentReviewForm
                    applicationId={application.id}
                    applicationDocumentId={record.id}
                    currentStatus={record.status}
                    requiredDocumentType={record.requiredDocumentType}
                    notes={record.reviewNotes}
                  />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Review actions</CardTitle>
            <p className="text-sm text-muted">Update where the application sits in the workflow.</p>
          </CardHeader>
          <CardContent>
            <StatusForm applicationId={application.id} currentStatus={application.status} allowed={allowedNext} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request a correction</CardTitle>
            <p className="text-sm text-muted">
              The student sees this on their tracking page and can respond with a wallet document.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {openDeficiencies.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Open corrections</p>
                {openDeficiencies.map((deficiency) => (
                  <div key={deficiency.id} className="rounded-md border border-status-warning/35 bg-status-warning/8 p-3">
                    <p className="text-sm font-medium text-ink">
                      {deficiency.requiredDocumentType
                        ? DOCUMENT_TYPE_LABEL[deficiency.requiredDocumentType]
                        : deficiency.title}
                    </p>
                    <p className="text-xs text-muted">{DEFICIENCY_TYPE_LABEL[deficiency.type]}</p>
                    <p className="mt-1 text-xs text-ink/90">{deficiency.requiredAction}</p>
                  </div>
                ))}
                <Divider className="my-2" />
              </div>
            ) : null}
            <DeficiencyForm
              applicationId={application.id}
              documents={attachmentOptions}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Activity timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline events={activity} />
          </CardContent>
        </Card>

        {scheme ? (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Scheme record</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-ink">{scheme.name}</p>
              <p className="text-xs text-muted">
                {scheme.sourceTitle} · transcribed {formatDate(scheme.lastVerifiedAt)}
              </p>
              <a
                href={scheme.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-xs font-medium text-maroon hover:underline underline-offset-4"
              >
                Open source page
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
              <p className="pt-2 text-xs leading-relaxed text-muted">{SOURCE_VERIFICATION_NOTICE}</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
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
