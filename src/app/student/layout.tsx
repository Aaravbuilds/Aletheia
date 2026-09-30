import { AppShell } from '@/components/shell/app-shell';
import { requireStudent } from '@/lib/auth/guards';
import { listNotifications, unreadNotificationCount } from '@/lib/db/applications';
import { countOpenDeficiencies } from '@/lib/db/deficiencies';
import { listApplicationsForStudent } from '@/lib/db/applications';
import type { NavItem } from '@/components/shell/nav-link';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStudent();

  const applications = listApplicationsForStudent(user.studentId);
  const openDeficiencies = applications
    .filter((application) => application.status === 'DEFICIENT' || countOpenDeficiencies(application.id) > 0)
    .reduce((sum, application) => sum + countOpenDeficiencies(application.id), 0);
  const unread = unreadNotificationCount(user.id);

  const navItems: NavItem[] = [
    { href: '/student/dashboard', label: 'Dashboard', description: 'Where you stand', icon: 'home', exact: true },
    { href: '/student/scholarships', label: 'Scholarships', description: 'What may match you', icon: 'search' },
    { href: '/student/documents', label: 'My documents', description: 'Your document wallet', icon: 'folder' },
    {
      href: '/student/applications',
      label: 'Applications',
      description: 'Apply and track',
      icon: 'file',
      badge: openDeficiencies > 0 ? openDeficiencies : undefined,
    },
    {
      href: '/student/notifications',
      label: 'Notifications',
      description: 'Updates about your work',
      icon: 'bell',
      badge: unread > 0 ? unread : undefined,
    },
    { href: '/student/profile', label: 'My profile', description: 'Details used for matching', icon: 'user' },
  ];

  return (
    <AppShell
      role="STUDENT"
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
