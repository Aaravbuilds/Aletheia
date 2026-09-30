import Link from 'next/link';

import { requireAdmin } from '@/lib/auth/guards';
import { listAllApplications, listRecentActivity } from '@/lib/db/applications';
import { listAllOpenDeficiencies } from '@/lib/db/deficiencies';
import { getProfileById } from '@/lib/db/profiles';
import { getSchemeById } from '@/lib/db/schemes';
import { getApplicationDocumentStats, listSchemeApplicationCounts } from '@/lib/db/admin';
import { ApplicationStatusBadge } from '@/components/ui/status';
import { Card, CardContent, CardHeader, CardTitle, SectionHeading } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import {
  ACTIVITY_EVENT_LABEL,
  APPLICATION_DOCUMENT_STATUS_LABEL,
  APPLICATION_STATUS_LABEL,
  DOCUMENT_TYPE_LABEL,
} from '@/lib/domain/workflow';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { ActivityEventType } from '@/types';

export const metadata = { title: 'Admin dashboard' };

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const applications = listAllApplications();
  const openDeficiencies = listAllOpenDeficiencies();
  const activity = listRecentActivity(10);
  const documentStats = getApplicationDocumentStats();
  const schemeCounts = listSchemeApplicationCounts();

  const inQueue = applications.filter((application) =>
    ['SUBMITTED', 'DOCUMENT_VERIFICATION', 'INSTITUTE_VERIFICATION', 'UNDER_REVIEW', 'DECISION_PENDING'].includes(
      application.status,
    ),
  );
  const awaitingCorrection = applications.filter((application) => application.status === 'DEFICIENT');

  const stats = [
    { label: 'Awaiting review', value: inQueue.length, hint: 'Applications ready for an officer' },
    { label: 'Corrections outstanding', value: openDeficiencies.length, hint: 'Waiting on the student' },
    { label: 'Documents pending review', value: documentStats.pendingReview, hint: 'Submitted or under review' },
    { label: 'Documents accepted', value: documentStats.accepted, hint: 'Across all applications' },
  ];

  return (
    <div className="space-y-7">
      <SectionHeading
        eyebrow={`Signed in as ${admin.fullName}`}
        title="Review dashboard"
        description="One operational view of what needs attention. Aletheia pre-screens, but a person decides."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{stat.label}</p>
              <p className="mt-1 font-display text-3xl text-ink">{stat.value}</p>
              <p className="mt-1 text-xs text-muted">{stat.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Review queue</CardTitle>
            <p className="text-sm text-muted">Oldest submissions first. Open an application to review documents.</p>
          </CardHeader>
          <CardContent>
            {inQueue.length === 0 && awaitingCorrection.length === 0 ? (
              <EmptyState title="Nothing waiting" description="The queue is clear right now." />
            ) : (
              <ul className="divide-y divide-line/60">
                {[...inQueue, ...awaitingCorrection]
                  .sort((a, b) => (a.submittedAt ?? a.createdAt).localeCompare(b.submittedAt ?? b.createdAt))
                  .map((application) => {
                    const profile = getProfileById(application.studentId);
                    const scheme = getSchemeById(application.schemeId);
                    const waiting = openDeficiencies.filter((item) => item.applicationId === application.id).length;
                    return (
                      <li key={application.id}>
                        <Link
                          href={`/admin/applications/${application.id}`}
                          className="flex flex-wrap items-center justify-between gap-3 py-3 transition-colors hover:text-maroon"
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-ink">
                              {application.applicationNumber} · {profile?.fullName ?? 'Student'}
                            </span>
                            <span className="block text-xs text-muted">
                              {scheme?.shortName ?? 'Scheme'}
                              {application.submittedAt ? ` · submitted ${formatDate(application.submittedAt)}` : ''}
                            </span>
                          </span>
                          <span className="flex items-center gap-2">
                            {waiting > 0 ? <Badge tone="warning">{waiting} open</Badge> : null}
                            <ApplicationStatusBadge status={application.status} />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <EmptyState title="No activity yet" />
            ) : (
              <ol className="space-y-3">
                {activity.map((event) => (
                  <li key={event.id} className="flex gap-2.5">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        event.actorRole === 'STUDENT'
                          ? 'bg-maroon'
                          : event.actorRole === 'AI'
                            ? 'bg-slate'
                            : 'bg-status-warning'
                      }`}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <Link
                        href={`/admin/applications/${event.applicationId}`}
                        className="text-sm font-medium text-ink hover:text-maroon"
                      >
                        {event.applicationNumber}
                      </Link>
                      <span className="block text-xs leading-snug text-muted">
                        {ACTIVITY_EVENT_LABEL[event.eventType as ActivityEventType] ?? event.eventType} —{' '}
                        {event.description}
                      </span>
                      <span className="text-[0.6875rem] text-muted/80">{formatDateTime(event.createdAt)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Queue by stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {(
                [
                  'SUBMITTED',
                  'DOCUMENT_VERIFICATION',
                  'INSTITUTE_VERIFICATION',
                  'UNDER_REVIEW',
                  'DECISION_PENDING',
                ] as const
              ).map((status) => {
                const count = applications.filter((application) => application.status === status).length;
                return (
                  <li key={status} className="flex items-center justify-between gap-3 border-b border-line/60 pb-2 last:border-0">
                    <span className="text-ink">{APPLICATION_STATUS_LABEL[status]}</span>
                    <span className="text-muted">{count}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open corrections</CardTitle>
            <p className="text-sm text-muted">What students have been asked to fix.</p>
          </CardHeader>
          <CardContent>
            {awaitingCorrection.length === 0 && openDeficiencies.length === 0 ? (
              <EmptyState title="No open corrections" />
            ) : (
              <ul className="space-y-2.5">
                {openDeficiencies.slice(0, 6).map((deficiency) => (
                  <li key={deficiency.id} className="border-b border-line/60 pb-2.5 last:border-0">
                    <Link
                      href={`/admin/applications/${deficiency.applicationId}`}
                      className="text-sm font-medium text-ink hover:text-maroon"
                    >
                      {deficiency.requiredDocumentType
                        ? DOCUMENT_TYPE_LABEL[deficiency.requiredDocumentType]
                        : deficiency.title}
                    </Link>
                    <p className="text-xs leading-snug text-muted">{deficiency.requiredAction}</p>
                    <p className="text-[0.6875rem] text-muted/80">Requested {formatDate(deficiency.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Documents overview</CardTitle>
            <p className="text-sm text-muted">Where each attached document stands in review.</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(
                [
                  ['SUBMITTED', documentStats.submitted, 'bg-maroon'],
                  ['UNDER_REVIEW', documentStats.underReview, 'bg-slate'],
                  ['ACCEPTED', documentStats.accepted, 'bg-status-success'],
                  ['NEEDS_CORRECTION', documentStats.needsCorrection, 'bg-status-warning'],
                  ['MISSING', documentStats.missing, 'bg-line'],
                ] as const
              ).map(([status, count, colour]) => (
                <li key={status} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink">
                    {APPLICATION_DOCUMENT_STATUS_LABEL[status]}
                    <span className="ml-2 text-muted">{count}</span>
                  </span>
                  <span className="h-1.5 w-1/2 overflow-hidden rounded-full bg-parchment">
                    <span
                      className={`block h-full rounded-full ${colour}`}
                      style={{ width: `${documentStats.total ? Math.max(4, (count / documentStats.total) * 100) : 0}%` }}
                    />
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">{documentStats.total} documents attached in total.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications by scheme</CardTitle>
            <p className="text-sm text-muted">Volume and open queue per scheme.</p>
          </CardHeader>
          <CardContent>
            {schemeCounts.length === 0 ? (
              <EmptyState title="No applications yet" />
            ) : (
              <ul className="space-y-2 text-sm">
                {schemeCounts.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 border-b border-line/60 pb-2 last:border-0"
                  >
                    <span className="text-ink">{item.shortName}</span>
                    <span className="flex items-center gap-2">
                      {item.queued > 0 ? <Badge tone="info">{item.queued} in queue</Badge> : null}
                      <span className="text-muted">{item.applications} total</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
