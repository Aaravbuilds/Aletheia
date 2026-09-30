import { Skeleton } from '@/components/ui/feedback';

export function PageLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading">
      <header className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-1/2 max-w-sm" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-line bg-surface p-4 shadow-soft">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-12" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-4">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-line bg-surface p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        </section>
        <section className="space-y-4">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-line bg-surface p-4 shadow-soft">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-3/4" />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}