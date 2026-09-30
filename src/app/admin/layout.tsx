import { AppShell } from '@/components/shell/app-shell';
import { requireAdmin } from '@/lib/auth/guards';
import { listNotifications, listAllApplications, unreadNotificationCount } from '@/lib/db/applications';
import { listAllOpenDeficiencies } from '@/lib/db/deficiencies';
import type { NavItem } from '@/components/shell/nav-link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  const applications = listAllApplications();
  const queue = applications.filter((application) =>
    ['SUBMITTED', 'DOCUMENT_VERIFICATION', 'INSTITUTE_VERIFICATION', 'UNDER_REVIEW', 'DECISION_PENDING'].includes(
      application.status,
    ),
  ).length;
  const openDeficiencies = listAllOpenDeficiencies().length;
  const unread = unreadNotificationCount(user.id);

  const navItems: NavItem[] = [
    { href: '/admin/dashboard', label: 'Dashboard', description: 'Today at a glance', icon: 'home', exact: true },
    {
      href: '/admin/applications',
      label: 'Review queue',
      description: 'Applications to act on',
      icon: 'inbox',
      badge: queue || undefined,
    },
    {
      href: '/admin/activity',
      label: 'Activity',
      description: 'Everything that happened',
      icon: 'clock',
    },
    {
      href: '/admin/notifications',
      label: 'Notifications',
      description: 'Updates that need you',
      icon: 'bell',
      badge: unread > 0 ? unread : undefined,
    },
    { href: '/admin/schemes', label: 'Scheme data', description: 'What Aletheia knows', icon: 'database' },
  ];

  return (
    <AppShell
      role="ADMIN"
      userName={user.fullName}
      userEmail={user.email}
      navItems={navItems}
      notifications={listNotifications(user.id, 12)}
      unreadCount={unread}
    >
      {children}
    </AppShell>
  );
}
