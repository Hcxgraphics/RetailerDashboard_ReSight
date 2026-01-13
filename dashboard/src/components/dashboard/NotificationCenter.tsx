import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, TrendingDown, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'rank_drop' | 'rank_rise' | 'bias_spike' | 'inventory_conflict' | 'model_update';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  severity: 'high' | 'medium' | 'low';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'rank_drop',
    title: 'Major Rank Drop',
    message: 'Premium Wireless Headphones dropped from #1 to #5',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    severity: 'high',
  },
  {
    id: '2',
    type: 'inventory_conflict',
    title: 'Inventory Conflict',
    message: 'Recommended product "Smart Watch Pro" has low stock (3 units)',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    severity: 'medium',
  },
  {
    id: '3',
    type: 'bias_spike',
    title: 'Fairness Alert',
    message: 'Budget category exposure dropped below 10% threshold',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    severity: 'medium',
  },
  {
    id: '4',
    type: 'rank_rise',
    title: 'Performance Boost',
    message: 'Organic Cotton T-Shirt rose 8 positions to #2',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: true,
    severity: 'low',
  },
  {
    id: '5',
    type: 'model_update',
    title: 'Model Updated',
    message: 'Recommendation model retrained with latest data',
    timestamp: new Date(Date.now() - 120 * 60 * 1000),
    read: true,
    severity: 'low',
  },
];

const iconMap = {
  rank_drop: TrendingDown,
  rank_rise: TrendingUp,
  bias_spike: AlertTriangle,
  inventory_conflict: AlertTriangle,
  model_update: RefreshCw,
};

const colorMap = {
  rank_drop: 'text-destructive bg-destructive/10',
  rank_rise: 'text-success bg-success/10',
  bias_spike: 'text-warning bg-warning/10',
  inventory_conflict: 'text-warning bg-warning/10',
  model_update: 'text-info bg-info/10',
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleViewAll = () => {
    setOpen(false);
    navigate('/alerts');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = iconMap[notification.type];
              return (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors cursor-pointer',
                    !notification.read && 'bg-accent/5'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        colorMap[notification.type]
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-sm">
                          {notification.title}
                          {!notification.read && (
                            <span className="inline-block w-2 h-2 bg-accent rounded-full ml-2" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 -mr-2 -mt-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" className="w-full" size="sm" onClick={handleViewAll}>
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
