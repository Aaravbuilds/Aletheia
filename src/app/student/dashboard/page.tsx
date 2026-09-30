import Link from 'next/link';
import { ArrowRight, FileText, FolderOpen, Sparkles } from 'lucide-react';

import { requireStudent } from '@/lib/auth/guards';
import { getProfileById, calculateProfileCompletion } from '@/lib/db/profiles';
import { listDocuments } from '@/lib/db/documents';
import { listApplicationsForStudent } from '@/lib/db/applications';
import { listDeficienciesForStudent } from '@/lib/db/deficiencies';
import { getStudentMatches, matchCounts } from '@/lib/matching/service';
import { getSchemeById } from '@/lib/db/schemes';
import { APPLICATION_STATUS_DESCRIPTION } from '@/lib/domain/workflow';
import { formatDate } from '@/lib/utils';
import { Alert, EmptyState, Progress } from '@/components/ui/feedback';
import { ApplicationStatusBadge, MatchBadge, ReadinessMeter } from '@/components/ui/status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEMO_NOTICE } from '@/lib/domain/copy';

export const metadata = { title: 'Dashboard' };

export default async function StudentDashboardPage() {
  const user = await requireStudent();
  const profile = getProfileById(user.studentId);
  if (!profile) {
    return (
      <EmptyState
        title="Complete your profile"
        description="Aletheia checks published eligibility conditions against your profile, so it needs a few details first."
        action={
          <Link
            href="/student/profile"
            className="inline-flex h-10 items-center rounded-md bg-maroon px-4 text-sm font-medium text-surface"
          >
            Open my profile
          </Link>
        }
      />
    );
  }

  const completion = calculateProfileCompletion(profile);
  const matches = getStudentMatches(profile.id);
  const counts = matchCounts(matches);
  const applications = listApplicationsForStudent(profile.id);
  const documents = listDocuments(profile.id);
  const topMatches = matches.filter((match) => match.status !== 'NOT_MATCHING').slice(0, 3);
  const activeApplications = applications.filter((application) => application.status !== 'DRAFT').slice(0, 2);
  const openDeficiencies = listDeficienciesForStudent(profile.id).filter((d) => d.status === 'OPEN');

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-maroon/80">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="mt-1 font-display text-display-2 text-ink">Good to see you, {profile.fullName.split(' ')[0]}.</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Here is where your applications stand, and which schemes may be relevant to you based on the published
            conditions.
          </p>
        </div>
        <Link
          href="/student/scholarships"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-maroon px-4 text-sm font-medium text-surface shadow-soft transition-colors hover:bg-maroon-dark"
        >
          Explore scholarships
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </header>

      {openDeficiencies.length > 0 ? (
        <Alert tone="warning" title="A correction has been requested">
          {openDeficiencies.length === 1 ? (
            <>
              A reviewing officer asked for a correction on{' '}
              <strong className="font-semibold">{openDeficiencies[0].title}</strong>.{' '}
              <Link
                href={`/student/applications/${openDeficiencies[0].applicationId}`}
                className="font-medium underline underline-offset-4"
              >
                Open the application
              </Link>{' '}
              to see exactly what to fix.
            </>
          ) : (
            <>
              {openDeficiencies.length} corrections are waiting on your applications.{' '}
              <Link href="/student/applications" className="font-medium underline underline-offset-4">
                Review them
              </Link>
              .
            </>
          )}
        </Alert>
      ) : null}

      {DEMO_NOTICE ? (
        <p className="rounded-md border border-line bg-parchment/40 px-4 py-2.5 text-xs text-muted">{DEMO_NOTICE}</p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Sparkles}
          label="Potential matches"
          value={`${counts.actionRequired + counts.match}`}
          hint={`of ${counts.total} recorded schemes`}
          href="/student/scholarships"
        />
        <StatCard
          icon={FileText}
          label="Applications"
          value={`${applications.length}`}
          hint={`${applications.filter((a) => a.status === 'DRAFT').length} saved as draft`}
          href="/student/applications"
        />
        <StatCard
          icon={FolderOpen}
          label="Documents stored"
          value={`${documents.length}`}
          hint={`${documents.filter((d) => d.status === 'NEEDS_ATTENTION').length} need attention`}
          href="/student/documents"
        />
        <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Profile completeness</p>
          <p className="mt-2 font-display text-2xl text-ink">{completion.percent}%</p>
          <Progress value={completion.percent} tone={completion.isComplete ? 'success' : 'maroon'} label="" />
          <p className="mt-1 text-xs text-muted">
            {completion.isComplete
              ? 'All matching fields are filled in.'
              : `Add: ${completion.missingFields.slice(0, 2).join(', ')}`}
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Your applications</h2>
            <Link href="/student/applications" className="text-sm font-medium text-maroon underline underline-offset-4">
              View all
            </Link>
          </div>

          {activeApplications.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-6 w-6" aria-hidden />}
              title="No application yet"
              description="Start from a scholarship that may match you. Your application stays editable until you submit it."
              action={
                <Link
                  href="/student/scholarships"
                  className="inline-flex h-10 items-center rounded-md bg-maroon px-4 text-sm font-medium text-surface"
                >
                  Find a scholarship
                </Link>
              }
            />
          ) : (
            <ul className="space-y-3">
              {activeApplications.map((application) => {
                const scheme = getSchemeById(application.schemeId);
                return (
                  <li key={application.id}>
                    <Link
                      href={`/student/applications/${application.id}`}
                      className="block rounded-lg border border-line bg-surface p-4 shadow-soft transition-colors hover:border-maroon/30"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-ink">{scheme?.name ?? 'Scholarship scheme'}</p>
                          <p className="mt-0.5 text-xs text-muted">
                            {application.applicationNumber || 'Draft'} · submitted {formatDate(application.submittedAt)}
                          </p>
                        </div>
                        <ApplicationStatusBadge status={application.status} />
                      </div>
                      <p className="mt-3 text-sm text-muted">
                        {APPLICATION_STATUS_DESCRIPTION[application.status]}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Relevant to you</h2>
            <Link href="/student/scholarships" className="text-sm font-medium text-maroon underline underline-offset-4">
              All schemes
            </Link>
          </div>

          <ul className="space-y-3">
            {topMatches.length === 0 ? (
              <EmptyState title="No potential matches yet" description="Complete your profile to see matching results." />
            ) : (
              topMatches.map((match) => (
                <li key={match.scheme.id}>
                  <Link
                    href={`/student/scholarships/${match.scheme.slug}`}
                    className="block rounded-lg border border-line bg-surface p-4 shadow-soft transition-colors hover:border-maroon/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-ink">{match.scheme.shortName}</p>
                      <MatchBadge status={match.status} />
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted">{match.scheme.description}</p>
                    <ReadinessMeter
                      available={match.readiness.availableCount}
                      required={match.readiness.requiredCount}
                      className="mt-3"
                    />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  hint: string;
  href: string;
}) {
  return (
    <Link href={href} className="rounded-lg border border-line bg-surface p-4 shadow-soft transition-colors hover:border-maroon/30">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="h-4 w-4" aria-hidden />
        <p className="text-xs font-medium uppercase tracking-[0.14em]">{label}</p>
      </div>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </Link>
  );
}
