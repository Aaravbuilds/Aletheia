import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, ShieldQuestion } from 'lucide-react';

import { requireStudent } from '@/lib/auth/guards';
import { getProfileById } from '@/lib/db/profiles';
import { getSchemeMatchBySlug } from '@/lib/matching/service';
import { getSchemeBySlugWithRelations } from '@/lib/db/schemes';
import { listDocuments } from '@/lib/db/documents';
import { OutcomeIcon } from '@/components/scholarships/scholarship-card';
import { MatchExplanation } from '@/components/scholarships/match-explanation';
import { buildMatchExplanation } from '@/lib/matching/explain';
import { activeAiProvider } from '@/lib/ai';
import { Alert, Progress } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, Divider, SectionHeading } from '@/components/ui/card';
import { ApplicationStatusBadge, MatchBadge } from '@/components/ui/status';
import { AI_BOUNDARY_NOTICE, DOCUMENT_SOURCE_NOTICE, SOURCE_VERIFICATION_NOTICE } from '@/lib/domain/copy';
import { DOCUMENT_TYPE_LABEL } from '@/lib/domain/workflow';
import { formatDate } from '@/lib/utils';
import { hasOpenApplication } from '@/lib/matching/service';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const scheme = getSchemeBySlugWithRelations(slug);
  return { title: scheme?.shortName ?? 'Scholarship' };
}

export default async function ScholarshipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireStudent();

  const scheme = getSchemeBySlugWithRelations(slug);
  if (!scheme) notFound();

  const profile = getProfileById(user.studentId);
  const match = profile ? getSchemeMatchBySlug(profile.id, slug) : null;
  const wallet = profile ? listDocuments(profile.id) : [];
  const alreadyApplied = profile ? hasOpenApplication(profile.id, scheme.id) : false;

  const canApply = match?.status !== 'NOT_MATCHING' && !alreadyApplied;

  return (
    <div className="space-y-7">
      <Link href="/student/scholarships" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-maroon">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All scholarships
      </Link>

      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="maroon">
                {scheme.schemeClass === 'CENTRALLY_SPONSORED' ? 'Centrally sponsored' : 'Central sector'}
              </Badge>
              <Badge tone="outline">{scheme.type === 'FELLOWSHIP' ? 'Fellowship' : 'Scholarship'}</Badge>
              {scheme.selectionYear ? <Badge tone="neutral">Selection year {scheme.selectionYear}</Badge> : null}
            </div>
            <h1 className="mt-2.5 font-display text-display-2 text-ink">{scheme.name}</h1>
            <p className="mt-2 text-sm text-muted">{scheme.description}</p>
            <p className="mt-1.5 text-xs text-muted">Provided by {scheme.provider}</p>
          </div>
          {match ? <MatchBadge status={match.status} /> : null}
        </div>
      </header>

      {match ? (
        <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Why this may match you</CardTitle>
              <p className="text-sm text-muted">
                Each line is a condition recorded in the scheme data, checked against your profile.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {match.conditions.map((condition) => (
                <div key={condition.ruleId} className="flex items-start gap-3">
                  <OutcomeIcon outcome={condition.outcome} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {condition.label}
                      {!condition.required ? <span className="ml-1.5 text-xs font-normal text-muted">(supporting)</span> : null}
                    </p>
                    <p className="text-sm text-muted">{condition.detail}</p>
                    {condition.description ? (
                      <p className="mt-0.5 text-xs leading-relaxed text-muted/90">{condition.description}</p>
                    ) : null}
                  </div>
                </div>
              ))}
              <Divider className="my-4" />
              <MatchExplanation
                slug={scheme.slug}
                status={match.status}
                aiAvailable={activeAiProvider() === 'GROQ'}
                initial={buildMatchExplanation({
                  schemeName: scheme.name,
                  status: match.status,
                  conditions: match.conditions.map((condition) => ({
                    label: condition.label,
                    outcome: condition.outcome,
                    detail: condition.detail,
                  })),
                  readiness: {
                    availableCount: match.readiness.availableCount,
                    requiredCount: match.readiness.requiredCount,
                    missing: match.readiness.items
                      .filter((item) => item.state === 'MISSING')
                      .map((item) => item.requiredDocument.documentName),
                  },
                  hasApplication: match.application !== null,
                })}
              />
              <Alert tone="info" className="border-line bg-parchment/40 text-muted">
                {AI_BOUNDARY_NOTICE}
              </Alert>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Your readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-display text-3xl text-ink">
                  {match.readiness.availableCount}
                  <span className="text-lg text-muted"> / {match.readiness.requiredCount}</span>
                </p>
                <p className="text-xs text-muted">documents available for this scheme</p>
                <Progress
                  value={match.readiness.availableCount}
                  max={Math.max(match.readiness.requiredCount, 1)}
                  tone={match.readiness.missingCount === 0 ? 'success' : 'warning'}
                  label=""
                  className="mt-2"
                />
              </div>

              {match.application ? (
                <div className="rounded-md border border-line bg-canvas/60 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">Your application</p>
                  <p className="mt-1 font-medium text-ink">{match.application.applicationNumber || 'Draft'}</p>
                  <div className="mt-2">
                    <ApplicationStatusBadge status={match.application.status} />
                  </div>
                  <Button asChild variant="secondary" size="sm" className="mt-3">
                    <Link href={`/student/applications/${match.application.id}`}>Open application</Link>
                  </Button>
                </div>
              ) : null}

              <div className="space-y-2">
                {match.status === 'NOT_MATCHING' ? (
                  <Alert tone="warning" title="Not currently matching">
                    A published condition is not met by your profile as it stands. You can still read the full scheme
                    information below, but Aletheia will not start an application for it.
                  </Alert>
                ) : alreadyApplied ? (
                  <Alert tone="info" title="You already have an open application">
                    Only one application per scheme can be open at a time.
                  </Alert>
                ) : (
                  <>
                    <Button asChild block size="lg">
                      <Link href={`/student/applications/new/${scheme.slug}`}>Start application</Link>
                    </Button>
                    <p className="text-xs text-muted">
                      You will confirm each section, choose the documents to attach, and review before submitting.
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>What the scheme provides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <ul className="space-y-2">
              {scheme.benefits.map((benefit) => (
                <li key={benefit} className="flex gap-2 text-sm text-ink/90">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-maroon" aria-hidden />
                  {benefit}
                </li>
              ))}
            </ul>
            {scheme.benefitsVerificationNote ? (
              <Alert tone="warning" className="mt-3">
                {scheme.benefitsVerificationNote}
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required documents</CardTitle>
            <p className="text-sm text-muted">{DOCUMENT_SOURCE_NOTICE}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {scheme.requiredDocuments.map((item) => {
                const owned = wallet.find(
                  (document) =>
                    document.documentType === item.documentType &&
                    ['VERIFIED', 'UPLOADED', 'PROCESSING'].includes(document.status),
                );
                const attention = wallet.find(
                  (document) =>
                    document.documentType === item.documentType && document.status === 'NEEDS_ATTENTION',
                );
                return (
                  <li key={item.id} className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">{item.documentName}</span>
                      <span className="block text-xs text-muted">{item.description}</span>
                    </span>
                    {owned ? (
                      <Badge tone="success">In wallet</Badge>
                    ) : attention ? (
                      <Badge tone="warning">Needs attention</Badge>
                    ) : (
                      <Badge tone="neutral">Not added</Badge>
                    )}
                  </li>
                );
              })}
            </ul>
            <Button asChild variant="secondary" size="sm" className="mt-4">
              <Link href="/student/documents">Open document wallet</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Important information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2.5">
            {scheme.importantNotes.map((note) => (
              <li key={note} className="flex gap-2 text-sm text-ink/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sand" aria-hidden />
                {note}
              </li>
            ))}
          </ul>

          <Divider />

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Application channel</dt>
              <dd className="mt-0.5 text-ink/90">{scheme.applicationChannelNote}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Source record</dt>
              <dd className="mt-0.5 text-ink/90">
                {scheme.sourceTitle} · transcribed {formatDate(scheme.lastVerifiedAt)}
              </dd>
            </div>
          </dl>

          <Alert tone="warning" icon={<ShieldQuestion className="h-4 w-4" aria-hidden />}>
            {SOURCE_VERIFICATION_NOTICE}{' '}
            <a
              href={scheme.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 font-medium underline underline-offset-4"
            >
              Open the recorded source page
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
