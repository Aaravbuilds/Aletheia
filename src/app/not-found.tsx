import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="motif-weave flex min-h-screen items-center justify-center bg-surface px-5 py-12">
      <div className="w-full max-w-xl text-center">
        <p className="font-display text-[clamp(5rem,18vw,9rem)] leading-none text-maroon/20">404</p>
        <h1 className="mt-3 font-display text-display-2 text-ink">This page has gone off the record.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          The address you opened does not match any page in Aletheia. Your scholarship information has not changed.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-maroon px-4 text-sm font-medium text-surface shadow-soft transition-colors hover:bg-maroon-dark"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Aletheia
          </Link>
          <Link href="/login" className="text-sm font-medium text-maroon underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}