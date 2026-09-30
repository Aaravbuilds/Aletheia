import { NotificationFeed } from '@/components/notifications/notification-feed';
import { SectionHeading } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/guards';
import { listNotifications } from '@/lib/db/applications';

export const metadata = { title: 'Notifications' };

export default async function AdminNotificationsPage() {
  const user = await requireAdmin();
  const notifications = listNotifications(user.id, 100);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Administration"
        title="Notifications"
        description="New submissions, received corrections and status changes that need your attention."
      />
      <NotificationFeed role="ADMIN" notifications={notifications} />
    </div>
  );
}