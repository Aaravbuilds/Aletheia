'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { ShieldCheck, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Alert } from '@/components/ui/feedback';
import { DEMO_ADMIN_EMAIL, DEMO_PASSWORD, DEMO_STUDENT_EMAIL } from '@/data/demo';
import { loginAction, registerAction, type AuthState } from '@/app/actions/auth';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" block size="lg" loading={pending}>
      {label}
    </Button>
  );
}

function DemoHint({ onPick }: { onPick: (email: string) => void }) {
  return (
    <div className="rounded-md border border-line bg-parchment/40 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-maroon/80">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Demonstration accounts
      </p>
      <div className="mt-2 space-y-1.5 text-xs text-muted">
        <button
          type="button"
          onClick={() => onPick(DEMO_STUDENT_EMAIL)}
          className="block w-full rounded-sm border border-line bg-surface px-2.5 py-1.5 text-left transition-colors hover:border-maroon/40"
        >
          <span className="font-medium text-ink">Student — {DEMO_STUDENT_EMAIL}</span>
        </button>
        <button
          type="button"
          onClick={() => onPick(DEMO_ADMIN_EMAIL)}
          className="block w-full rounded-sm border border-line bg-surface px-2.5 py-1.5 text-left transition-colors hover:border-maroon/40"
        >
          <span className="font-medium text-ink">Reviewing officer — {DEMO_ADMIN_EMAIL}</span>
        </button>
        <p className="pt-0.5">
          Password for both: <span className="font-medium text-ink">{DEMO_PASSWORD}</span>
        </p>
      </div>
    </div>
  );
}

export function LoginForm() {
  const [state, action] = useActionState<AuthState, FormData>(loginAction, {});

  return (
    <form action={action} className="space-y-4">
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Field label="Email address" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.org"
          required
        />
      </Field>

      <Field label="Password" htmlFor="password" required>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>

      <SubmitButton label="Sign in" />

      <DemoHint
        onPick={(email) => {
          const field = document.getElementById('email') as HTMLInputElement | null;
          if (field) {
            field.value = email;
            field.focus();
          }
        }}
      />

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss" aria-hidden />
        Aletheia is a demonstration prototype. It does not connect to, or submit anything to, any government portal.
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState<AuthState, FormData>(registerAction, {});

  return (
    <form action={action} className="space-y-4">
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Field label="Full name" htmlFor="fullName" required hint="Enter your name as it appears on your school records.">
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </Field>

      <Field label="Email address" htmlFor="email" required>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" htmlFor="password" required hint="At least 8 characters.">
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword" required>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
      </div>

      <SubmitButton label="Create account" />
    </form>
  );
}
