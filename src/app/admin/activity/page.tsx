import Link from 'next/link';
import { Activity } from 'lucide-react';

import { requireAdmin } from '@/lib/auth/guards';
import { listRecentActivity } from '@/lib/db/applications';
import { Card, CardContent, CardHeader, CardTitle, SectionHeading } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/feedback';
import { ACTIVITY_EVENT_LABEL } from '@/lib/domain/workflow';
import { formatDateTime } from '@/lib/utils';
import type { ActivityEventType, ActorRole } from '@/types';

export const metadata = { title: 'Activity' };

const ACTOR_OPTIONS: (ActorRole | 'ALL')[] = ['ALL', 'STUDENT', 'ADMIN', 'AI', 'SYSTEM'];

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ actor?: string; event?: string }>;
}) {
  await requireAdmin();
  const { actor = 'ALL', event = 'ALL' } = await searchParams;

  const events = listRecentActivity(250).filter((item) => {
    if (actor !== 'ALL' && item.actorRole !== actor) return false;
    if (event !== 'ALL' && item.eventType !== event) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Administration"
        title="Activity"
        description="Every event across every application, newest first. Search the review queue to work on a specific case."
      />

      <form action="/admin/activity" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Who
          <select
            name="actor"
            defaultValue={actor}
            className="h-9 rounded-md border border-line bg-surface px-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
          >
            {ACTOR_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role === 'ALL' ? 'Everyone' : role}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Event type
          <select
            name="event"
            defaultValue={event}
            className="h-9 rounded-md border border-line bg-surface px-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
          >
            <option value="ALL">All events</option>
            {Object.entries(ACTIVITY_EVENT_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-md bg-maroon px-3 text-sm font-medium text-surface transition-colors hover:bg-maroon-dark"
        >
          Apply
        </button>
        {actor !== 'ALL' || event !== 'ALL' ? (
          <Link href="/admin/activity" className="text-xs font-medium text-muted hover:text-maroon">
            Clear
          </Link>
        ) : null}
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Full feed</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-6 w-6" aria-hidden />}
              title="No activity matches"
              description="Try a different combination of who and event type."
            />
          ) : (
            <ol className="space-y-4">
              {events.map((event) => (
                <li key={event.id} className="flex gap-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      event.actorRole === 'STUDENT'
                        ? 'bg-maroon'
                        : event.actorRole === 'ADMIN'
                          ? 'bg-status-warning'
                          : event.actorRole === 'AI'
                            ? 'bg-slate'
                            : 'bg-muted'
                    }`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <Link
                        href={`/admin/applications/${event.applicationId}`}
                        className="text-sm font-medium text-ink hover:text-maroon"
                      >
                        {event.applicationNumber}
                      </Link>
                      <span className="rounded-full border border-line bg-parchment/60 px-2 py-px text-[0.625rem] font-medium uppercase tracking-[0.08em] text-muted">
                        {event.actorRole}
                      </span>
                      <span className="text-xs font-medium text-muted">
                        {ACTIVITY_EVENT_LABEL[event.eventType as ActivityEventType] ?? event.eventType}
                      </span>
                    </span>
                    <span className="block text-sm leading-snug text-muted">{event.description}</span>
                    <span className="text-[0.6875rem] text-muted/80">{formatDateTime(event.createdAt)}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}