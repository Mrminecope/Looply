import { useState, useEffect } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Bell, Heart, UserPlus, Users, AtSign, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { localNotificationsAPI, type LocalNotification } from "../../utils/local-api";

interface NotificationSystemProps {
  userId: string;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationSystem({ userId, onMarkAsRead, onMarkAllAsRead }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const loadNotifications = async () => {
    try {
      const { notifications: localNotifications, error } = await localNotificationsAPI.getAll(userId);
      
      if (error) {
        console.error('Failed to load notifications:', error);
        toast.error('Failed to load notifications');
      } else if (localNotifications) {
        setNotifications(localNotifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // Optimistically update the UI
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));

      const { error } = await localNotificationsAPI.markAsRead(notificationId);
      
      if (error) {
        // Revert the optimistic update
        setNotifications(notifications.map(notif => 
          notif.id === notificationId ? { ...notif, read: false } : notif
        ));
        toast.error('Failed to mark notification as read');
      } else {
        onMarkAsRead(notificationId);
      }
    } catch (error) {
      console.error('Mark notification read error:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Optimistically update the UI
      const originalNotifications = [...notifications];
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));

      const { error } = await localNotificationsAPI.markAllAsRead(userId);
      
      if (error) {
        // Revert the optimistic update
        setNotifications(originalNotifications);
        toast.error('Failed to mark all notifications as read');
      } else {
        onMarkAllAsRead();
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      setNotifications(notifications);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'community':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h2 className="font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="px-2 py-0.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">When you get notifications, they'll show up here</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  !notification.read 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-background'
                }`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="p-1 h-auto"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}