import Link from 'next/link';

import { requireStudent } from '@/lib/auth/guards';
import { getProfileById } from '@/lib/db/profiles';
import { getStudentMatches } from '@/lib/matching/service';
import { ScholarshipCard } from '@/components/scholarships/scholarship-card';
import { Alert, EmptyState } from '@/components/ui/feedback';
import { SectionHeading } from '@/components/ui/card';
import { AI_BOUNDARY_NOTICE } from '@/lib/domain/copy';
import type { MatchStatus } from '@/types';

export const metadata = { title: 'Scholarships' };

const GROUPS: { key: MatchStatus; title: string; hint: string }[] = [
  { key: 'MATCH', title: 'Likely match', hint: 'Every published condition is met by your profile.' },
  { key: 'ACTION_REQUIRED', title: 'You may match, with action needed', hint: 'Something must be verified, added or prepared first.' },
  { key: 'NOT_MATCHING', title: 'Not currently matching', hint: 'A published condition is not met by your current profile.' },
];

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireStudent();
  const profile = getProfileById(user.studentId);
  const { filter } = await searchParams;

  if (!profile) {
    return (
      <EmptyState
        title="Complete your profile first"
        description="Matching uses the conditions recorded in your profile, so it needs a few details before results appear."
        action={
          <Link href="/student/profile" className="inline-flex h-10 items-center rounded-md bg-maroon px-4 text-sm font-medium text-surface">
            Open my profile
          </Link>
        }
      />
    );
  }

  const matches = getStudentMatches(profile.id);
  const visible = filter ? matches.filter((match) => match.status === filter) : matches;

  return (
    <div className="space-y-7">
      <SectionHeading
        eyebrow="Discovery"
        title="Scholarships and fellowships"
        description="Aletheia checked your profile against the conditions recorded for each scheme in the internal source-of-truth files. Nothing here is an official eligibility decision."
      />

      <nav className="flex flex-wrap gap-2" aria-label="Filter by match status">
        <FilterChip href="/student/scholarships" active={!filter}>
          All ({matches.length})
        </FilterChip>
        {GROUPS.map((group) => (
          <FilterChip
            key={group.key}
            href={`/student/scholarships?filter=${group.key}`}
            active={filter === group.key}
          >
            {group.title} ({matches.filter((match) => match.status === group.key).length})
          </FilterChip>
        ))}
      </nav>

      <Alert tone="info">{AI_BOUNDARY_NOTICE}</Alert>

      {visible.length === 0 ? (
        <EmptyState
          title="Nothing in this group"
          description="Clear the filter to see every recorded scheme and what Aletheia could evaluate."
          action={
            <Link href="/student/scholarships" className="inline-flex h-10 items-center rounded-md border border-line bg-surface px-4 text-sm font-medium">
              Show all schemes
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {visible.map((match) => (
            <ScholarshipCard key={match.scheme.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={
        active
          ? 'inline-flex h-8 items-center rounded-full border border-maroon bg-maroon px-3 text-xs font-medium text-surface'
          : 'inline-flex h-8 items-center rounded-full border border-line bg-surface px-3 text-xs font-medium text-muted transition-colors hover:border-maroon/40 hover:text-maroon'
      }
    >
      {children}
    </Link>
  );
}
