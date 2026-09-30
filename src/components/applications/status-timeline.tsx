import { Check } from 'lucide-react';

import { cn, formatDateTime } from '@/lib/utils';
import { ACTIVITY_EVENT_LABEL, APPLICATION_STATUS_ORDER, APPLICATION_STATUS_LABEL } from '@/lib/domain/workflow';
import type { ActivityEventType, ApplicationActivity, ApplicationStatus } from '@/types';

/**
 * The tracker must make the current state obvious at a glance
 * (opencode-master-prompt §28).
 */

const SIDECAR_STATUSES: ApplicationStatus[] = [
  'DOCUMENT_VERIFICATION',
  'INSTITUTE_VERIFICATION',
  'UNDER_REVIEW',
  'DECISION_PENDING',
  'COMPLETED',
];

export function StatusTimeline({ status }: { status: ApplicationStatus }) {
  const main = APPLICATION_STATUS_ORDER.filter(
    (item): item is Exclude<ApplicationStatus, 'DEFICIENT' | 'CORRECTION_RECEIVED'> =>
      item !== 'DEFICIENT' && item !== 'CORRECTION_RECEIVED',
  );
  const currentIndex = main.indexOf(status as (typeof main)[number]);
  const deficient = status === 'DEFICIENT' || status === 'CORRECTION_RECEIVED';

  return (
    <ol className="space-y-0">
      {main.map((stage, index) => {
        const done = currentIndex > index;
        const current = currentIndex === index;

        if (current && stage === 'DRAFT' && status === 'DRAFT') {
          return (
            <TimelineRow
              key={stage}
              title="Draft"
              description="Not submitted yet. You can still edit and add documents."
              state="current"
            />
          );
        }

        if (!current && !done && status !== 'DRAFT') {
          return (
            <TimelineRow
              key={stage}
              title={APPLICATION_STATUS_LABEL[stage]}
              description={SIDECAR_STATUSES.includes(stage) ? 'Not reached yet' : ''}
              state="todo"
            />
          );
        }

        return (
          <TimelineRow
            key={stage}
            title={APPLICATION_STATUS_LABEL[stage]}
            description={current ? 'Current stage' : 'Completed'}
            state={current ? 'current' : 'done'}
          />
        );
      })}

      {deficient ? (
        <TimelineRow
          title={status === 'DEFICIENT' ? 'Correction requested' : 'Correction received'}
          description={
            status === 'DEFICIENT'
              ? 'A reviewing officer asked for a change. See the action list below.'
              : 'Your correction was sent back to the reviewing officer.'
          }
          state="warning"
        />
      ) : null}
    </ol>
  );
}

function TimelineRow({
  title,
  description,
  state,
}: {
  title: string;
  description: string;
  state: 'done' | 'current' | 'todo' | 'warning';
}) {
  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      <span className="relative flex flex-col items-center">
        <span
          className={cn(
            'z-10 flex h-6 w-6 items-center justify-center rounded-full border text-[0.625rem] font-semibold',
            state === 'done' && 'border-status-success bg-status-success text-surface',
            state === 'current' && 'border-maroon bg-maroon text-surface',
            state === 'warning' && 'border-status-warning bg-status-warning text-surface',
            state === 'todo' && 'border-line bg-surface text-muted',
          )}
        >
          {state === 'done' ? <Check className="h-3.5 w-3.5" aria-hidden /> : state === 'todo' ? '·' : '!'}
        </span>
        <span className={cn('mt-1 w-px flex-1', state === 'todo' ? 'bg-line' : 'bg-line')} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 pb-1">
        <span className={cn('block text-sm font-medium', state === 'todo' ? 'text-muted' : 'text-ink')}>{title}</span>
        {description ? <span className="block text-xs text-muted">{description}</span> : null}
      </span>
    </li>
  );
}

export function ActivityTimeline({ events }: { events: ApplicationActivity[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted">Nothing has happened on this application yet.</p>;
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="flex gap-3">
          <span
            className={cn(
              'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
              event.actorRole === 'STUDENT' ? 'bg-maroon' : event.actorRole === 'AI' ? 'bg-slate' : 'bg-status-warning',
            )}
            aria-hidden
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-ink">
              <span className="font-medium">{ACTIVITY_EVENT_LABEL[event.eventType as ActivityEventType] ?? event.eventType}</span>
              <span className="text-muted"> · {actorLabel(event.actorRole)}</span>
            </span>
            <span className="block text-xs leading-relaxed text-muted">{event.description}</span>
            <span className="mt-0.5 block text-[0.6875rem] text-muted/80">{formatDateTime(event.createdAt)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function actorLabel(role: ApplicationActivity['actorRole']): string {
  switch (role) {
    case 'STUDENT':
      return 'You';
    case 'ADMIN':
      return 'Reviewing officer';
    case 'AI':
      return 'Pre-screening pass';
    default:
      return 'System';
  }
}
