import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertTone = 'info' | 'success' | 'warning' | 'error';

const tones: Record<AlertTone, { wrapper: string; icon: typeof Info }> = {
  info: { wrapper: 'border-slate/25 bg-slate/5 text-slate', icon: Info },
  success: { wrapper: 'border-status-success/30 bg-status-success/8 text-status-success', icon: CheckCircle2 },
  warning: { wrapper: 'border-status-warning/35 bg-status-warning/10 text-[#7d5412]', icon: AlertTriangle },
  error: { wrapper: 'border-status-error/30 bg-status-error/8 text-status-error', icon: XCircle },
};

export function Alert({
  tone = 'info',
  title,
  children,
  className,
  icon,
}: {
  tone?: AlertTone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  const Icon = tones[tone].icon;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-md border px-4 py-3 text-sm', tones[tone].wrapper, className)}
    >
      <span className="mt-0.5 shrink-0">{icon ?? <Icon className="h-4 w-4" aria-hidden />}</span>
      <div className="space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="leading-relaxed opacity-90">{children}</div> : null}
      </div>
    </div>
  );
}

export function Progress({
  value,
  max = 100,
  label,
  tone = 'maroon',
  className,
}: {
  value: number;
  max?: number;
  label?: string;
  tone?: 'maroon' | 'success' | 'warning';
  className?: string;
}) {
  const percent = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  const colour = tone === 'success' ? 'bg-status-success' : tone === 'warning' ? 'bg-status-warning' : 'bg-maroon';
  return (
    <div className={className}>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-parchment"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div className={cn('h-full rounded-full transition-all', colour)} style={{ width: `${percent}%` }} />
      </div>
      {label ? <p className="mt-1 text-xs text-muted">{label}</p> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} aria-hidden />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 rounded-lg border border-dashed border-line bg-surface/60 px-6 py-12 text-center', className)}>
      {icon ? <div className="text-maroon/70">{icon}</div> : null}
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {description ? <p className="max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
