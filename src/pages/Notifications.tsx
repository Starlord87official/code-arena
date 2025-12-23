import { useState } from 'react';
import { 
  Bell, Trophy, Flame, Zap, Star, AlertCircle, Users, 
  Check, CheckCheck, Trash2, Filter 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockNotifications, Notification } from '@/lib/mockData';
import { formatDistanceToNow } from 'date-fns';

const notificationTypes = ['all', 'contest', 'streak', 'xp', 'rank', 'system', 'duel'] as const;

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredNotifications = selectedType === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === selectedType);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'contest': return <Trophy className="h-5 w-5 text-primary" />;
      case 'streak': return <Flame className="h-5 w-5 text-status-warning" />;
      case 'xp': return <Zap className="h-5 w-5 text-primary" />;
      case 'rank': return <Star className="h-5 w-5 text-rank-gold" />;
      case 'system': return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
      case 'duel': return <Users className="h-5 w-5 text-destructive" />;
      case 'admin': return <AlertCircle className="h-5 w-5 text-primary" />;
    }
  };

  const getTypeBadge = (type: Notification['type']) => {
    const colors: Record<string, string> = {
      contest: 'bg-primary/20 text-primary border-primary/30',
      streak: 'bg-status-warning/20 text-status-warning border-status-warning/30',
      xp: 'bg-primary/20 text-primary border-primary/30',
      rank: 'bg-rank-gold/20 text-rank-gold border-rank-gold/30',
      system: 'bg-muted text-muted-foreground border-border',
      duel: 'bg-destructive/20 text-destructive border-destructive/30',
      admin: 'bg-primary/20 text-primary border-primary/30',
    };
    return colors[type];
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="h-8 w-8 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                NOTIFICATION <span className="text-primary">CENTER</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                {unreadCount} unread notifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          </div>
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Filter className="h-4 w-4 text-muted-foreground mt-2" />
          {notificationTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'arena' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`arena-card p-4 transition-all duration-300 ${
                !notification.read ? 'border-primary/50 bg-primary/5' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${getTypeBadge(notification.type).split(' ')[0]}`}>
                  {getTypeIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{notification.title}</h3>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">{notification.message}</p>
                  <div className="flex items-center gap-4">
                    <Badge className={`${getTypeBadge(notification.type)} border text-xs uppercase`}>
                      {notification.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="arena-card p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              {selectedType === 'all' 
                ? "You're all caught up!" 
                : `No ${selectedType} notifications found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
