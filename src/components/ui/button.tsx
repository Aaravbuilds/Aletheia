import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Small hand-rolled primitive set. Aletheia uses its own restrained visual
 * language (docs/04-UI-UX-SYSTEM.md) rather than a generic component theme.
 */

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-55',
  {
    variants: {
      variant: {
        primary: 'bg-maroon text-surface hover:bg-maroon-dark shadow-soft',
        secondary: 'bg-surface text-ink border border-line hover:bg-parchment/50 shadow-soft',
        ghost: 'text-ink hover:bg-parchment/60',
        subtle: 'bg-maroon-wash text-maroon-dark hover:bg-maroon-wash/70',
        danger: 'bg-status-error text-surface hover:brightness-95 shadow-soft',
        link: 'text-maroon underline underline-offset-4 hover:text-maroon-dark px-0',
      },
      size: {
        sm: 'h-8 px-3 text-[0.8125rem]',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button';

  if (asChild) {
    return (
      <Component className={cn(buttonVariants({ variant, size, block }), className)} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {children}
    </Component>
  );
}

export { buttonVariants };
