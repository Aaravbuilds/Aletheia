import { NotificationFeed } from '@/components/notifications/notification-feed';
import { SectionHeading } from '@/components/ui/card';
import { requireStudent } from '@/lib/auth/guards';
import { listNotifications } from '@/lib/db/applications';

export const metadata = { title: 'Notifications' };

export default async function StudentNotificationsPage() {
  const user = await requireStudent();
  const notifications = listNotifications(user.id, 100);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Student portal"
        title="Notifications"
        description="Everything that happened to your applications, documents and corrections."
      />
      <NotificationFeed role="STUDENT" notifications={notifications} />
    </div>
  );
}