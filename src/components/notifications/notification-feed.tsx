import Link from 'next/link';
import { Bell, Inbox } from 'lucide-react';

import { markNotificationsReadAction } from '@/app/actions/applications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/feedback';
import { NOTIFICATION_TYPE_LABEL } from '@/lib/domain/workflow';
import { formatDateTime } from '@/lib/utils';
import type { AppNotification } from '@/types';

export function NotificationFeed({
  role,
  notifications,
}: {
  role: 'STUDENT' | 'ADMIN';
  notifications: AppNotification[];
}) {
  const hrefOf = (notification: AppNotification): string => {
    if (notification.relatedApplicationId) {
      return role === 'ADMIN'
        ? `/admin/applications/${notification.relatedApplicationId}`
        : `/student/applications/${notification.relatedApplicationId}`;
    }
    return role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard';
  };

  const unread = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-muted">
          <Bell className="h-4 w-4 text-maroon" aria-hidden />
          {unread > 0 ? (
            <span>
              <span className="font-semibold text-ink">{unread}</span> unread
            </span>
          ) : (
            <span>You are all caught up.</span>
          )}
        </div>
        {unread > 0 ? (
          <form action={markNotificationsReadAction}>
            <Button type="submit" variant="secondary" size="sm">
              Mark all as read
            </Button>
          </form>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-6 w-6" aria-hidden />}
          title="No notifications yet"
          description="When your application moves, a document needs attention, or a correction is requested, the update will appear here."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-line/60">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <Link
                    href={hrefOf(notification)}
                    className="flex items-start gap-3 py-3.5 transition-colors hover:bg-parchment/40"
                  >
                    <span
                      className={
                        notification.isRead
                          ? 'mt-1.5 h-2 w-2 shrink-0 rounded-full bg-line'
                          : 'mt-1.5 h-2 w-2 shrink-0 rounded-full bg-maroon'
                      }
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span
                          className={
                            notification.isRead
                              ? 'text-sm font-medium text-ink/85'
                              : 'text-sm font-medium text-ink'
                          }
                        >
                          {notification.title}
                        </span>
                        <span className="rounded-full border border-maroon/25 bg-maroon-wash px-2 py-px text-[0.625rem] font-medium uppercase tracking-[0.08em] text-maroon-dark">
                          {NOTIFICATION_TYPE_LABEL[notification.type]}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-sm leading-snug text-muted">{notification.message}</span>
                      <span className="mt-1 block text-[0.6875rem] text-muted/80">
                        {formatDateTime(notification.createdAt)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}