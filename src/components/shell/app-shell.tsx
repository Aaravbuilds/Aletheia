import Image from 'next/image';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';

import { NavLink, type NavItem } from '@/components/shell/nav-link';
import { logoutAction } from '@/app/actions/auth';
import { markNotificationsReadAction } from '@/app/actions/applications';
import { formatDateTime } from '@/lib/utils';
import type { AppNotification } from '@/types';

export function AppShell({
  role,
  userName,
  userEmail,
  navItems,
  notifications,
  unreadCount,
  children,
}: {
  role: 'STUDENT' | 'ADMIN';
  userName: string;
  userEmail: string;
  navItems: NavItem[];
  notifications: AppNotification[];
  unreadCount: number;
  children: React.ReactNode;
}) {
  const roleLabel = role === 'ADMIN' ? 'Reviewing Officer' : 'Student';

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-line bg-surface/80 lg:flex lg:w-[19rem] lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-5 py-5">
          <Image src="/logo.png" alt="Aletheia" width={1254} height={1254} className="h-9 w-9 shrink-0 object-contain" />
          <span className="leading-tight">
            <span className="block font-display text-lg text-ink">Aletheia</span>
            <span className="block text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
              {role === 'ADMIN' ? 'Administration' : 'Student Portal'}
            </span>
          </span>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} exact={item.href.endsWith('/dashboard')} />
          ))}
        </nav>

        <div className="hidden border-t border-line px-5 py-4 lg:block">
          <p className="text-sm font-medium text-ink">{userName}</p>
          <p className="text-xs text-muted">{userEmail}</p>
          <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.14em] text-maroon/80">{roleLabel}</p>
          <form action={logoutAction} className="mt-3">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-maroon"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-3.5 w-3.5" aria-hidden>
                <path d="M15 5H6v14h9M11 12h10M18 9l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-canvas/90 px-5 py-3 backdrop-blur">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{userName}</p>
            <p className="truncate text-xs text-muted">{roleLabel}</p>
          </div>

          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-ink shadow-soft">
              <Bell className="h-4 w-4 text-muted" aria-hidden />
              <span className="hidden sm:inline">Notifications</span>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-maroon px-1.5 text-[0.625rem] font-semibold text-surface">
                  {unreadCount}
                </span>
              ) : null}
            </summary>
            <div className="absolute right-0 z-30 mt-2 w-[22rem] max-w-[80vw] rounded-lg border border-line bg-surface shadow-lift">
              {notifications.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted">No notifications yet.</p>
              ) : (
                <ul className="max-h-80 space-y-1 overflow-y-auto">
                  {notifications.slice(0, 9).map((notification) => (
                    <li key={notification.id}>
                      <Link
                        href={
                          notification.relatedApplicationId
                            ? role === 'ADMIN'
                              ? `/admin/applications/${notification.relatedApplicationId}`
                              : `/student/applications/${notification.relatedApplicationId}`
                            : '/'
                        }
                        className="block rounded-md px-3 py-2 transition-colors hover:bg-parchment/60"
                      >
                        <span className="flex items-start gap-2">
                          {!notification.isRead ? (
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-maroon" aria-hidden />
                          ) : (
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0" aria-hidden />
                          )}
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-ink">{notification.title}</span>
                            <span className="block text-xs leading-snug text-muted">{notification.message}</span>
                            <span className="mt-0.5 block text-[0.6875rem] text-muted/80">
                              {formatDateTime(notification.createdAt)}
                            </span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center justify-between gap-2 border-t border-line px-2 py-2">
                {notifications.length > 0 ? (
                  <form action={markNotificationsReadAction}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:text-maroon"
                    >
                      <CheckCheck className="h-3.5 w-3.5" aria-hidden />
                      Mark all as read
                    </button>
                  </form>
                ) : (
                  <span />
                )}
                <Link
                  href={role === 'ADMIN' ? '/admin/notifications' : '/student/notifications'}
                  className="rounded-md px-2 py-1 text-xs font-medium text-maroon hover:bg-maroon-wash"
                >
                  View all
                </Link>
              </div>
            </div>
          </details>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-7 lg:px-8">{children}</main>

        <footer className="border-t border-line px-5 py-5 text-xs text-muted lg:px-8">
          <p>
            Aletheia is a prototype for demonstration. It is not a Government of India service and does not submit
            applications to any official portal.
          </p>
        </footer>
      </div>
    </div>
  );
}
