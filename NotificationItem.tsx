import { Heart, MessageCircle, UserPlus, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'like' | 'comment' | 'follow' | 'community';
    user: {
      name: string;
      username: string;
      avatar: string;
    };
    message: string;
    timestamp: string;
    isRead: boolean;
    actionRequired?: boolean;
  };
  onMarkRead: (notificationId: string) => void;
  onAction?: (notificationId: string) => void;
}

export function NotificationItem({ notification, onMarkRead, onAction }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="size-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="size-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="size-4 text-green-500" />;
      case 'community':
        return <Users className="size-4 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={`flex items-start gap-3 p-4 hover:bg-accent/50 cursor-pointer ${
        !notification.isRead ? 'bg-accent/30' : ''
      }`}
      onClick={() => !notification.isRead && onMarkRead(notification.id)}
    >
      <Avatar className="size-10">
        <AvatarImage src={notification.user.avatar} />
        <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{notification.user.name}</span>{' '}
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {notification.timestamp}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {getIcon()}
            {!notification.isRead && (
              <div className="w-2 h-2 bg-primary rounded-full" />
            )}
          </div>
        </div>
        
        {notification.actionRequired && (
          <div className="mt-2">
            <Button size="sm" onClick={() => onAction?.(notification.id)}>
              Follow Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}