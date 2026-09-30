import Link from 'next/link';
import { FileText } from 'lucide-react';

import { requireStudent } from '@/lib/auth/guards';
import { getProfileById } from '@/lib/db/profiles';
import { listApplicationsForStudent } from '@/lib/db/applications';
import { listDeficienciesForStudent } from '@/lib/db/deficiencies';
import { getSchemeById } from '@/lib/db/schemes';
import { ApplicationStatusBadge } from '@/components/ui/status';
import { Card, SectionHeading } from '@/components/ui/card';
import { Alert, EmptyState } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { APPLICATION_STATUS_DESCRIPTION, APPLICATION_STATUS_ORDER } from '@/lib/domain/workflow';
import { formatDate } from '@/lib/utils';
import type { ApplicationStatus } from '@/types';

export const metadata = { title: 'Applications' };

export default async function ApplicationsPage() {
  const user = await requireStudent();
  const profile = getProfileById(user.studentId);
  const applications = profile ? listApplicationsForStudent(profile.id) : [];
  const deficiencies = profile ? listDeficienciesForStudent(profile.id) : [];
  const openDeficiencies = deficiencies.filter((item) => item.status === 'OPEN');

  const sorted = [...applications].sort((a, b) => {
    const rank = (status: ApplicationStatus) => APPLICATION_STATUS_ORDER.indexOf(status);
    const rankB = (status: ApplicationStatus) =>
      ['DEFICIENT', 'CORRECTION_RECEIVED'].includes(status) ? -1 : rank(status);
    return rankB(a.status) - rankB(b.status) || b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <div className="space-y-7">
      <SectionHeading
        eyebrow="Tracking"
        title="Your applications"
        description="Every application you start, with its current stage and anything waiting on you."
      />

      {openDeficiencies.length > 0 ? (
        <Alert tone="warning" title={`${openDeficiencies.length} correction(s) waiting on you`}>
          A reviewing officer has asked for a change. The application pages show exactly what to fix and let you
          respond in one step.
        </Alert>
      ) : null}

      {sorted.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" aria-hidden />}
          title="No applications yet"
          description="Start from a scholarship that may match you. You can save a draft and come back to it at any time."
          action={
            <Link
              href="/student/scholarships"
              className="inline-flex h-10 items-center rounded-md bg-maroon px-4 text-sm font-medium text-surface"
            >
              Explore scholarships
            </Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {sorted.map((application) => {
            const scheme = getSchemeById(application.schemeId);
            const open = deficiencies.filter(
              (item) => item.applicationId === application.id && item.status === 'OPEN',
            );
            return (
              <li key={application.id}>
                <Link
                  href={`/student/applications/${application.id}`}
                  className="block rounded-lg border border-line bg-surface p-5 shadow-soft transition-colors hover:border-maroon/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                        {application.applicationNumber || 'Draft'}
                        {application.cycleLabel ? ` · cycle ${application.cycleLabel}` : ''}
                      </p>
                      <p className="mt-1 font-display text-lg text-ink">{scheme?.name ?? 'Scholarship scheme'}</p>
                    </div>
                    <ApplicationStatusBadge status={application.status} />
                  </div>

                  <p className="mt-2 text-sm text-muted">{APPLICATION_STATUS_DESCRIPTION[application.status]}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span>Created {formatDate(application.createdAt)}</span>
                    {application.submittedAt ? <span>· submitted {formatDate(application.submittedAt)}</span> : null}
                    {open.length > 0 ? <Badge tone="warning">{open.length} correction(s) needed</Badge> : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Card className="bg-surface/60">
        <div className="px-5 py-4">
          <h2 className="font-display text-base text-ink">How the stages work</h2>
          <ol className="mt-3 flex flex-wrap gap-x-2 gap-y-2 text-xs text-muted">
            {['Submitted', 'Document Verification', 'Institute Verification', 'Under Review', 'Decision Pending', 'Completed'].map(
              (stage, index) => (
                <li key={stage} className="flex items-center gap-2">
                  <span className="rounded-full border border-line bg-surface px-2 py-1">{stage}</span>
                  {index < 5 ? <span aria-hidden>→</span> : null}
                </li>
              ),
            )}
          </ol>
          <p className="mt-3 text-xs text-muted">
            A correction request can appear at any stage. It does not move the application backwards — the reviewing
            officer decides what happens next.
          </p>
        </div>
      </Card>
    </div>
  );
}
