import { NotificationSystem } from '../notifications/NotificationSystem';

interface NotificationsTabProps {
  userId: string;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationsTab({
  userId,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationsTabProps) {
  return (
    <NotificationSystem
      userId={userId}
      onMarkAsRead={onMarkAsRead}
      onMarkAllAsRead={onMarkAllAsRead}
    />
  );
}