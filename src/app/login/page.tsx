import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpenCheck, FileCheck2, GitBranch, Sparkles } from 'lucide-react';

import { LoginForm } from '@/components/auth/auth-forms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSessionUser } from '@/lib/auth/session';

export const metadata = { title: 'Sign in' };

const POINTS = [
  { icon: GitBranch, title: 'Explainable matching', body: 'Every result shows the published condition it was checked against.' },
  { icon: FileCheck2, title: 'Document readiness', body: 'Know which documents you have, which are missing and which need attention.' },
  { icon: BookOpenCheck, title: 'One continuous workflow', body: 'Apply, then follow exactly where your application stands.' },
];

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard');

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section className="motif-weave relative hidden flex-col justify-between border-r border-line bg-surface px-10 py-12 lg:flex">
        <div>
          <span className="flex items-center gap-3">
            <Image src="/logo.png" alt="Aletheia" width={1254} height={1254} className="h-10 w-10 shrink-0 object-contain" />
            <span>
              <span className="block font-display text-xl text-ink">Aletheia</span>
              <span className="block text-[0.6875rem] uppercase tracking-[0.18em] text-muted">
                Scholarship assistance for ST students
              </span>
            </span>
          </span>

          <h1 className="mt-12 max-w-lg font-display text-display-1 text-ink">
            Know what you qualify for, and what to do next.
          </h1>
          <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-muted">
            Aletheia brings Ministry of Tribal Affairs scholarship information into one place: eligibility you can
            actually read, documents you can prepare, and an application you can track.
          </p>

          <ul className="mt-10 space-y-5">
            {POINTS.map((point) => (
              <li key={point.title} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-maroon-wash text-maroon">
                  <point.icon className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink">{point.title}</span>
                  <span className="block text-sm text-muted">{point.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="max-w-md text-xs leading-relaxed text-muted">
          Aletheia is a prototype built for demonstration. Scheme information is reproduced from internal source-of-truth
          records, and eligibility shown here is a potential match only — a reviewing officer makes every decision.
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <span className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Aletheia" width={1254} height={1254} className="h-9 w-9 shrink-0 object-contain" />
              <span className="font-display text-xl text-ink">Aletheia</span>
            </span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <p className="text-sm text-muted">Use the demonstration account for the role you want to see.</p>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>

          <p className="mt-5 text-center text-sm text-muted">
            New student?{' '}
            <Link href="/register" className="font-medium text-maroon underline underline-offset-4">
              Create an account
            </Link>
          </p>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Demo reset: run <code className="rounded-sm bg-parchment px-1 py-0.5">npm run db:reset</code>
          </p>
        </div>
      </section>
    </div>
  );
}
