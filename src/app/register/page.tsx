import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpenCheck, FileCheck2, GitBranch } from 'lucide-react';

import { RegisterForm } from '@/components/auth/auth-forms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSessionUser } from '@/lib/auth/session';

export const metadata = { title: 'Create account' };

const POINTS = [
  { icon: BookOpenCheck, title: 'A short profile is enough', body: 'Just the basics Aletheia needs to check published conditions.' },
  { icon: GitBranch, title: 'Explainable results', body: 'Every match shows the eligibility line it was checked against.' },
  { icon: FileCheck2, title: 'Documents you keep', body: 'Your wallet is reusable across every application you start.' },
];

export default async function RegisterPage() {
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
            Start with your profile. The matching follows.
          </h1>
          <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-muted">
            Create a student account, tell us the few things required to check eligibility, and Aletheia will show which
            Ministry of Tribal Affairs schemes may be relevant to you.
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
          Aletheia is a prototype built for demonstration. It does not connect to, or submit anything to, any
          government portal.
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
              <CardTitle>Create a student account</CardTitle>
              <p className="text-sm text-muted">
                You will complete your profile next. Aletheia uses it only to check published eligibility conditions.
              </p>
            </CardHeader>
            <CardContent>
              <RegisterForm />
            </CardContent>
          </Card>

          <p className="mt-5 text-center text-sm text-muted">
            Already registered?{' '}
            <Link href="/login" className="font-medium text-maroon underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}