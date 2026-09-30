import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        neutral: 'border-line bg-parchment/60 text-muted',
        info: 'border-slate/25 bg-slate/10 text-slate',
        success: 'border-status-success/30 bg-status-success/10 text-status-success',
        warning: 'border-status-warning/35 bg-status-warning/10 text-[#8a5c14]',
        error: 'border-status-error/30 bg-status-error/10 text-status-error',
        maroon: 'border-maroon/25 bg-maroon-wash text-maroon-dark',
        outline: 'border-line bg-transparent text-muted',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export function StatusDot({ tone = 'neutral' }: { tone?: BadgeTone }) {
  const colour: Record<BadgeTone, string> = {
    neutral: 'bg-muted',
    info: 'bg-slate',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    error: 'bg-status-error',
    maroon: 'bg-maroon',
    outline: 'bg-muted',
  };
  return <span className={cn('h-1.5 w-1.5 rounded-full', colour[tone])} aria-hidden />;
}
