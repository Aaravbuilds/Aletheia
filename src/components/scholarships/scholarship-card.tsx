import Link from 'next/link';
import { Check, CircleHelp, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { MatchBadge, ReadinessMeter } from '@/components/ui/status';
import { cn } from '@/lib/utils';
import type { SchemeMatchResult } from '@/types';

/**
 * Scholarship card. It must answer, without opening anything:
 * what is it, is it relevant, why, and how ready am I
 * (docs/08-DEMO-SCENARIO.md).
 */
export function ScholarshipCard({ match, className }: { match: SchemeMatchResult; className?: string }) {
  const { scheme, conditions, readiness, status, application } = match;

  const shown = conditions.slice(0, 4);
  const restCount = conditions.length - shown.length;

  return (
    <article className={cn('flex flex-col rounded-lg border border-line bg-surface p-5 shadow-soft', className)}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="maroon">{scheme.schemeClass === 'CENTRALLY_SPONSORED' ? 'Centrally sponsored' : 'Central sector'}</Badge>
            <Badge tone="outline">{scheme.type === 'FELLOWSHIP' ? 'Fellowship' : 'Scholarship'}</Badge>
          </div>
          <h3 className="mt-2 font-display text-xl leading-snug text-ink">{scheme.name}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted">{scheme.description}</p>
        </div>
        <MatchBadge status={status} />
      </header>

      <div className="mt-4 rounded-md border border-line/70 bg-canvas/60 p-3">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">Why</p>
        <ul className="mt-2 space-y-1.5">
          {shown.map((condition) => (
            <li key={condition.ruleId} className="flex items-start gap-2 text-sm">
              <OutcomeIcon outcome={condition.outcome} />
              <span className="min-w-0">
                <span className="font-medium text-ink">{condition.label}</span>
                <span className="text-muted"> — {condition.detail}</span>
              </span>
            </li>
          ))}
          {restCount > 0 ? (
            <li className="text-xs text-muted">+ {restCount} more condition(s) on the scheme page</li>
          ) : null}
        </ul>
      </div>

      <div className="mt-4 space-y-3">
        <ReadinessMeter
          available={readiness.availableCount}
          required={readiness.requiredCount}
          tone={status === 'MATCH' ? 'maroon' : 'warning'}
        />
        {readiness.missingCount > 0 ? (
          <p className="text-xs text-muted">
            <span className="font-medium text-ink">{readiness.missingCount} still to prepare.</span>{' '}
            {readiness.attentionCount > 0 ? `${readiness.attentionCount} need attention.` : ''}
          </p>
        ) : readiness.attentionCount > 0 ? (
          <p className="text-xs text-muted">{readiness.attentionCount} document(s) need attention before applying.</p>
        ) : null}
      </div>

      <footer className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        {application ? (
          <Badge tone="info">Application {application.applicationNumber || 'draft'}</Badge>
        ) : (
          <span className="text-xs text-muted">No application yet</span>
        )}
        <Link
          href={`/student/scholarships/${scheme.slug}`}
          className="inline-flex h-9 items-center rounded-md border border-line bg-canvas px-3.5 text-sm font-medium text-ink transition-colors hover:border-maroon/40 hover:text-maroon"
        >
          View details
        </Link>
      </footer>
    </article>
  );
}

export function OutcomeIcon({ outcome }: { outcome: string }) {
  if (outcome === 'MET') return <Check className="mt-0.5 h-4 w-4 shrink-0 text-status-success" aria-hidden />;
  if (outcome === 'UNMET') return <X className="mt-0.5 h-4 w-4 shrink-0 text-status-error" aria-hidden />;
  return <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" aria-hidden />;
}
