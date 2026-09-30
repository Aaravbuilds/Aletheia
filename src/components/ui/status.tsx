import { cn } from '@/lib/utils';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Progress } from '@/components/ui/feedback';
import {
  APPLICATION_STATUS_LABEL,
  APPLICATION_STATUS_TONE,
  MATCH_STATUS_LABEL,
  MATCH_STATUS_TONE,
} from '@/lib/domain/workflow';
import type { ApplicationStatus, MatchStatus } from '@/types';

export function MatchBadge({ status, className }: { status: MatchStatus; className?: string }) {
  return (
    <Badge tone={MATCH_STATUS_TONE[status] as BadgeTone} className={className}>
      {MATCH_STATUS_LABEL[status]}
    </Badge>
  );
}

export function ApplicationStatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  return (
    <Badge tone={APPLICATION_STATUS_TONE[status] as BadgeTone} className={className}>
      {APPLICATION_STATUS_LABEL[status]}
    </Badge>
  );
}

export function ReadinessMeter({
  available,
  required,
  tone = 'maroon',
  className,
}: {
  available: number;
  required: number;
  tone?: 'maroon' | 'success' | 'warning';
  className?: string;
}) {
  const complete = required > 0 && available >= required;
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-sm text-ink">
          {available} / {required} documents available
        </span>
        {complete ? <span className="text-xs font-medium text-status-success">Ready</span> : null}
      </div>
      <Progress value={available} max={Math.max(required, 1)} tone={complete ? 'success' : tone} label="" />
    </div>
  );
}
