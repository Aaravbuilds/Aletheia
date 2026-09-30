'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Aletheia page error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="motif-weave flex min-h-screen items-center justify-center bg-surface px-5 py-12">
          <div className="w-full max-w-xl text-center">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-maroon/80">
              Something went wrong
            </p>
            <h1 className="mt-3 font-display text-display-2 text-ink">The page could not be completed.</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
              This is a demonstration prototype and this failure is temporary. No application data has changed.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-maroon px-4 text-sm font-medium text-surface shadow-soft transition-colors hover:bg-maroon-dark"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Try again
              </button>
              <Link href="/" className="text-sm font-medium text-maroon underline underline-offset-4">
                Back to Aletheia
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}