'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface NavItem {
  href: string;
  label: string;
  description?: string;
  icon: string;
  badge?: number;
  exact?: boolean;
}

export function NavLink({ item, exact = false }: { item: NavItem; exact?: boolean }) {
  const pathname = usePathname();
  const active = exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors',
        active ? 'bg-maroon-wash text-maroon-dark' : 'text-ink/85 hover:bg-parchment/60',
      )}
    >
      <span className={cn('mt-0.5 shrink-0', active ? 'text-maroon' : 'text-muted')} aria-hidden>
        <NavIcon name={item.icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-medium">
          {item.label}
          {item.badge ? (
            <span className="rounded-full bg-maroon px-1.5 py-0.5 text-[0.625rem] font-semibold text-surface">
              {item.badge}
            </span>
          ) : null}
        </span>
        {item.description ? (
          <span className="mt-0.5 block text-xs leading-snug text-muted">{item.description}</span>
        ) : null}
      </span>
    </Link>
  );
}

const PATHS: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5M5.25 9.75V20h13.5V9.75M9.75 20v-6h4.5v6',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  search: 'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Zm5.2-2.3L21 21',
  folder: 'M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2.5h7A1.5 1.5 0 0 1 19 10v7.5A1.5 1.5 0 0 1 17.5 19h-13A1.5 1.5 0 0 1 3 17.5Z',
  file: 'M6 3h7l5 5v13H6zM13 3v5h5M9 13h6M9 17h4',
  bell: 'M18 15V10a6 6 0 1 0-12 0v5l-1.5 3h15ZM10 21h4',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9a6 6 0 0 1 12 0M16.5 11.5a3 3 0 1 0-2-5.2M17 20a5.5 5.5 0 0 0-3-4.9',
  inbox: 'M3 13h5l1.5 3h5L16 13h5M3 13l2.5-8h13L21 13v6H3Z',
  alert: 'M12 4 2.5 20h19ZM12 10v4M12 17h.01',
  scale: 'M12 4v16M6 8h12M4 8l-2 6h8ZM20 8l2 6h-8ZM8 20h8',
  database: 'M4 6c0 1.1 3.6 2 8 2s8-.9 8-2M4 6v12c0 1.1 3.6 2 8 2s8-.9 8-2V6M4 12c0 1.1 3.6 2 8 2s8-.9 8-2',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 8v4l2.5 1.5',
  logout: 'M15 5H6v14h9M11 12h10M18 9l3 3-3 3',
};

export function NavIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-4.5 w-4.5', className ?? 'h-[1.15rem] w-[1.15rem]')}
      aria-hidden
    >
      <path d={PATHS[name] ?? PATHS.file} />
    </svg>
  );
}
