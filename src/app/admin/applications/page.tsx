import Link from 'next/link';
import { Filter, Search } from 'lucide-react';

import { requireAdmin } from '@/lib/auth/guards';
import { listApplicationsWithMeta } from '@/lib/db/admin';
import { listSchemes } from '@/lib/db/schemes';
import { listAllOpenDeficiencies } from '@/lib/db/deficiencies';
import { ApplicationStatusBadge } from '@/components/ui/status';
import { Card, CardContent, SectionHeading } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/feedback';
import { Badge } from '@/components/ui/badge';
import { APPLICATION_STATUS_LABEL } from '@/lib/domain/workflow';
import { formatDate } from '@/lib/utils';
import type { ApplicationStatus } from '@/types';

export const metadata = { title: 'Review queue' };

const FILTERS: { key: string; label: string; statuses: ApplicationStatus[] | null }[] = [
  { key: 'all', label: 'All', statuses: null },
  {
    key: 'queue',
    label: 'Needs action',
    statuses: ['SUBMITTED', 'DOCUMENT_VERIFICATION', 'INSTITUTE_VERIFICATION', 'UNDER_REVIEW', 'DECISION_PENDING'],
  },
  { key: 'deficient', label: 'Corrections', statuses: ['DEFICIENT', 'CORRECTION_RECEIVED'] },
  { key: 'completed', label: 'Completed', statuses: ['COMPLETED'] },
];

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string; scheme?: string; status?: string; sort?: string }>;
}) {
  await requireAdmin();
  const { filter = 'all', q = '', scheme = 'all', status = 'all', sort = 'newest' } = await searchParams;

  const activeFilter = FILTERS.find((item) => item.key === filter) ?? FILTERS[0];
  const openDeficiencies = listAllOpenDeficiencies();
  const schemes = listSchemes(true);
  const all = listApplicationsWithMeta();
  const query = q.trim().toLowerCase();

  const filtered = all
    .filter((item) => (activeFilter.statuses ? activeFilter.statuses.includes(item.application.status) : true))
    .filter((item) => (scheme !== 'all' ? item.application.schemeId === scheme : true))
    .filter((item) => (status !== 'all' ? item.application.status === (status as ApplicationStatus) : true))
    .filter((item) => {
      if (!query) return true;
      const student = item.student?.fullName ?? '';
      const schemeName = item.scheme?.name ?? '';
      const shortName = item.scheme?.shortName ?? '';
      return [item.application.applicationNumber, student, schemeName, shortName]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
    })
    .sort((a, b) => {
      const aDate = a.application.submittedAt ?? a.application.createdAt;
      const bDate = b.application.submittedAt ?? b.application.createdAt;
      return sort === 'oldest' ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate);
    });

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Administration"
        title="Review queue"
        description="Open an application to inspect documents, review pre-screening observations and request corrections."
      />

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => {
          const count = all.filter((entry) =>
            item.statuses ? item.statuses.includes(entry.application.status) : true,
          ).length;
          const active = item.key === activeFilter.key;
          return (
            <Link
              key={item.key}
              href={`/admin/applications?filter=${item.key}&scheme=${scheme}&status=${status}&sort=${sort}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={
                active
                  ? 'inline-flex h-9 items-center gap-2 rounded-full border border-maroon bg-maroon px-3.5 text-sm font-medium text-surface'
                  : 'inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-sm font-medium text-muted transition-colors hover:border-maroon/40 hover:text-maroon'
              }
            >
              {item.label}
              <span className={active ? 'text-surface/80' : 'text-muted'}>{count}</span>
            </Link>
          );
        })}
      </div>

      <form action="/admin/applications" className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="filter" value={activeFilter.key} />
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Scheme
          <select
            name="scheme"
            defaultValue={scheme}
            className="h-9 rounded-md border border-line bg-surface px-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
          >
            <option value="all">All schemes</option>
            {schemes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.shortName}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Status
          <select
            name="status"
            defaultValue={status}
            className="h-9 rounded-md border border-line bg-surface px-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
          >
            <option value="all">All statuses</option>
            {Object.entries(APPLICATION_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Sort by
          <select
            name="sort"
            defaultValue={sort}
            className="h-9 rounded-md border border-line bg-surface px-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
        <div className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search number, student or scheme"
            className="h-9 w-72 rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted/70 focus:border-maroon focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-maroon px-3 text-sm font-medium text-surface transition-colors hover:bg-maroon-dark"
          >
            <Search className="h-4 w-4" aria-hidden />
            Search
          </button>
        </div>
        {(scheme !== 'all' || status !== 'all' || q) ? (
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-maroon"
          >
            <Filter className="h-3.5 w-3.5" aria-hidden />
            Clear
          </Link>
        ) : null}
      </form>

      <Card>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState title="No applications match" description="Try a different filter, status, scheme or search." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[46rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-[0.12em] text-muted">
                    <th className="py-2.5 pr-4 font-medium">Application</th>
                    <th className="py-2.5 pr-4 font-medium">Student</th>
                    <th className="py-2.5 pr-4 font-medium">Scheme</th>
                    <th className="py-2.5 pr-4 font-medium">Submitted</th>
                    <th className="py-2.5 pr-4 font-medium">Corrections</th>
                    <th className="py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(({ application, student, scheme: metaScheme, openDeficiencies: open }) => (
                    <tr key={application.id} className="border-b border-line/60 last:border-0">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/applications/${application.id}`}
                          className="font-medium text-ink hover:text-maroon"
                        >
                          {application.applicationNumber || 'Draft'}
                        </Link>
                        <span className="block text-xs text-muted">{application.cycleLabel ?? '—'}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-ink">{student?.fullName ?? 'Student'}</span>
                        <span className="block text-xs text-muted">
                          {student?.isST ? 'ST' : student?.category ?? '—'} · {student?.state ?? '—'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-ink">{metaScheme?.shortName ?? '—'}</td>
                      <td className="py-3 pr-4 text-muted">{formatDate(application.submittedAt)}</td>
                      <td className="py-3 pr-4">
                        {open > 0 ? <Badge tone="warning">{open} open</Badge> : <span className="text-muted">—</span>}
                      </td>
                      <td className="py-3">
                        <ApplicationStatusBadge status={application.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-xs text-muted">
            Showing {filtered.length} of {all.length} applications
            {activeFilter.statuses
              ? ` · ${activeFilter.label} · ${activeFilter.statuses.map((s) => APPLICATION_STATUS_LABEL[s]).join(', ')}`
              : ''}
            {openDeficiencies.length > 0 ? ` · ${openDeficiencies.length} open correction(s) across the system` : ''}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}