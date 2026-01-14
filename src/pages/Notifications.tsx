import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, Trophy, Flame, Zap, Star, AlertCircle, Users, 
  Check, CheckCheck, Trash2, Filter, AlertTriangle, Target,
  TrendingDown, TrendingUp, ChevronsUp, Swords, ShieldAlert,
  Clock, Crown, X, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useFriendRequests, FriendRequest } from '@/hooks/useFriendRequests';
import { getDivisionColor } from '@/lib/mockData';
import { toast } from 'sonner';

// Priority levels for psychological impact
type Priority = 'critical' | 'important' | 'info';

interface CompetitiveNotification {
  id: string;
  type: 'rival' | 'rank' | 'streak' | 'contest' | 'challenge' | 'system' | 'friend_request';
  priority: Priority;
  title: string;
  message: string;
  subtext?: string;
  read: boolean;
  createdAt: Date;
  actionLabel?: string;
  actionPath?: string;
  friendRequest?: FriendRequest;
}

// Psychological notification data
const competitiveNotifications: CompetitiveNotification[] = [
  {
    id: 'n-001',
    type: 'rival',
    priority: 'critical',
    title: 'RIVAL ALERT: You have been passed',
    message: 'CodeNinja_X just overtook your rank. They solved 3 challenges while you were inactive.',
    subtext: 'They are now 142 XP ahead of you.',
    read: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    actionLabel: 'RECLAIM YOUR POSITION',
    actionPath: '/challenges',
  },
  {
    id: 'n-002',
    type: 'rank',
    priority: 'critical',
    title: 'DEMOTION WARNING: You are at risk',
    message: 'You are 3 positions away from the demotion zone. Your rank has dropped 5 places this week.',
    subtext: 'Complete 2 challenges to secure your position.',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    actionLabel: 'DEFEND YOUR RANK',
    actionPath: '/challenges',
  },
  {
    id: 'n-003',
    type: 'streak',
    priority: 'critical',
    title: 'STREAK EXPIRES IN 2 HOURS',
    message: 'Your 12-day streak will be lost forever if you do not complete a challenge.',
    subtext: 'A broken streak cannot be recovered. Act now.',
    read: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    actionLabel: 'SAVE YOUR STREAK',
    actionPath: '/challenges',
  },
  {
    id: 'n-004',
    type: 'contest',
    priority: 'critical',
    title: 'SURVIVAL MATCH STARTING IN 1 HOUR',
    message: 'Weekly Elimination #47 begins soon. Missing this will cost you -8 ranks.',
    subtext: 'This is a mandatory survival match. No exceptions.',
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    actionLabel: 'PREPARE FOR BATTLE',
    actionPath: '/contests',
  },
  {
    id: 'n-005',
    type: 'rival',
    priority: 'important',
    title: 'THREAT APPROACHING: Someone is closing in',
    message: 'ByteHunter is only 47 XP behind you and climbing fast.',
    subtext: 'They have solved 5 challenges today. You have solved 0.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    actionLabel: 'WIDEN THE GAP',
    actionPath: '/challenges',
  },
  {
    id: 'n-006',
    type: 'rank',
    priority: 'important',
    title: 'PROMOTION OPPORTUNITY: Top 3 within reach',
    message: 'You are only 89 XP away from the promotion zone.',
    subtext: 'Complete 2 medium challenges to secure advancement.',
    read: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    actionLabel: 'CLAIM YOUR SPOT',
    actionPath: '/challenges',
  },
  {
    id: 'n-007',
    type: 'challenge',
    priority: 'important',
    title: 'CHALLENGE COMPLETED: +250 XP',
    message: 'You solved "Binary Search Tree Validator" faster than 94% of players.',
    subtext: 'You have moved up 2 ranks.',
    read: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: 'n-008',
    type: 'rival',
    priority: 'info',
    title: 'RIVAL DEFEATED: You passed AlgoMaster',
    message: 'You are now ranked #154. AlgoMaster has dropped to #155.',
    subtext: 'Keep the pressure on. They will try to reclaim their position.',
    read: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: 'n-009',
    type: 'streak',
    priority: 'info',
    title: 'STREAK EXTENDED: 12 days strong',
    message: 'Your consistency is paying off. You have earned +50 bonus XP.',
    subtext: 'Next milestone: 14 days for +100 XP bonus.',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'n-010',
    type: 'contest',
    priority: 'info',
    title: 'CONTEST RESULTS: Weekly Arena #46',
    message: 'You placed #23 out of 847 participants. +500 XP earned.',
    subtext: 'Top 3% finish. You are climbing.',
    read: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
  {
    id: 'n-011',
    type: 'system',
    priority: 'info',
    title: 'NEW SEASON BEGINS IN 3 DAYS',
    message: 'Season 4 rankings will reset. Your current rank will affect starting position.',
    read: true,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
  },
];

const notificationTypes = ['all', 'critical', 'friend_request', 'rival', 'rank', 'streak', 'contest'] as const;

export default function Notifications() {
  const [baseNotifications, setBaseNotifications] = useState(competitiveNotifications);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  
  const { incoming: friendRequests, respondToRequest, refetch } = useFriendRequests();
  
  // Convert friend requests to notification format
  const friendRequestNotifications: CompetitiveNotification[] = friendRequests.map((req) => ({
    id: `fr-${req.id}`,
    type: 'friend_request' as const,
    priority: 'important' as const,
    title: 'FRIEND REQUEST',
    message: `${req.username} wants to be your friend`,
    subtext: req.division ? `Division: ${req.division}` : undefined,
    read: false,
    createdAt: new Date(req.created_at),
    friendRequest: req,
  }));
  
  // Combine all notifications
  const notifications = [...friendRequestNotifications, ...baseNotifications].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const filteredNotifications = selectedType === 'all' 
    ? notifications 
    : selectedType === 'critical'
      ? notifications.filter(n => n.priority === 'critical')
      : notifications.filter(n => n.type === selectedType);

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.read).length;
  const friendRequestCount = friendRequests.length;

  const getTypeIcon = (type: CompetitiveNotification['type'], priority: Priority) => {
    const iconClass = priority === 'critical' ? 'animate-pulse' : '';
    switch (type) {
      case 'rival': return <Target className={`h-5 w-5 text-status-warning ${iconClass}`} />;
      case 'rank': return <TrendingDown className={`h-5 w-5 text-destructive ${iconClass}`} />;
      case 'streak': return <Flame className={`h-5 w-5 text-status-warning ${iconClass}`} />;
      case 'contest': return <Swords className={`h-5 w-5 text-primary ${iconClass}`} />;
      case 'challenge': return <Zap className={`h-5 w-5 text-status-success`} />;
      case 'system': return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
      case 'friend_request': return <Users className={`h-5 w-5 text-primary ${iconClass}`} />;
    }
  };

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'critical': return 'border-destructive/50 bg-gradient-to-r from-destructive/10 via-transparent to-transparent';
      case 'important': return 'border-status-warning/30 bg-gradient-to-r from-status-warning/5 via-transparent to-transparent';
      case 'info': return '';
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'critical': return 'bg-destructive/20 text-destructive border-destructive/50';
      case 'important': return 'bg-status-warning/20 text-status-warning border-status-warning/50';
      case 'info': return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTypeBadge = (type: CompetitiveNotification['type']) => {
    const colors: Record<string, string> = {
      rival: 'bg-status-warning/20 text-status-warning border-status-warning/30',
      rank: 'bg-destructive/20 text-destructive border-destructive/30',
      streak: 'bg-status-warning/20 text-status-warning border-status-warning/30',
      contest: 'bg-primary/20 text-primary border-primary/30',
      challenge: 'bg-status-success/20 text-status-success border-status-success/30',
      system: 'bg-muted text-muted-foreground border-border',
      friend_request: 'bg-primary/20 text-primary border-primary/30',
    };
    return colors[type];
  };

  const markAsRead = (id: string) => {
    setBaseNotifications(baseNotifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setBaseNotifications(baseNotifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setBaseNotifications(baseNotifications.filter(n => n.id !== id));
  };

  const handleRespondToFriendRequest = async (requestId: string, accept: boolean) => {
    setRespondingTo(requestId);
    const result = await respondToRequest(requestId, accept);
    setRespondingTo(null);
    
    if (result.success) {
      toast.success(accept ? 'Friend request accepted!' : 'Friend request declined');
      refetch();
    } else {
      toast.error(result.error || 'Failed to respond to request');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Intense Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <ChevronsUp className="h-6 w-6 text-primary animate-pulse" />
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>
            <div className="relative">
              <Bell className="h-10 w-10 text-primary drop-shadow-[0_0_15px_hsl(var(--primary))]" />
              {criticalCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                  {criticalCount}
                </span>
              )}
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground">
              COMMAND <span className="text-primary neon-text">CENTER</span>
            </h1>
            <div className="flex items-center gap-1">
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <ChevronsUp className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground">
            Stay <span className="text-primary font-semibold">informed</span>. Stay <span className="text-status-warning font-semibold">alert</span>. Stay <span className="text-status-success font-semibold">ahead</span>.
          </p>
        </div>

        {/* Critical Alert Banner */}
        {criticalCount > 0 && (
          <div className="arena-card p-4 mb-6 border-destructive/50 bg-gradient-to-r from-destructive/15 to-transparent at-risk-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-6 w-6 text-destructive animate-pulse" />
                <div>
                  <span className="text-destructive font-bold">
                    {criticalCount} CRITICAL ALERT{criticalCount > 1 ? 'S' : ''} REQUIRE IMMEDIATE ACTION
                  </span>
                  <p className="text-sm text-muted-foreground">Ignoring these will cost you.</p>
                </div>
              </div>
              <Button variant="arena" size="sm" className="bg-destructive hover:bg-destructive/80">
                Address Now
              </Button>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="arena-card p-4 text-center border-destructive/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
            <div className="text-xs text-muted-foreground uppercase">Critical</div>
          </div>
          <div className="arena-card p-4 text-center border-primary/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{friendRequestCount}</div>
            <div className="text-xs text-muted-foreground uppercase">Requests</div>
          </div>
          <div className="arena-card p-4 text-center border-status-warning/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="h-4 w-4 text-status-warning" />
            </div>
            <div className="text-2xl font-bold text-status-warning">
              {notifications.filter(n => n.type === 'rival' && !n.read).length}
            </div>
            <div className="text-xs text-muted-foreground uppercase">Rival Alerts</div>
          </div>
          <div className="arena-card p-4 text-center border-primary/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{unreadCount}</div>
            <div className="text-xs text-muted-foreground uppercase">Unread</div>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">{notifications.length}</div>
            <div className="text-xs text-muted-foreground uppercase">Total</div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between mb-6">
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            <Filter className="h-4 w-4 text-muted-foreground mt-2" />
            {notificationTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'arena' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className={`capitalize ${type === 'critical' ? 'border-destructive/50' : ''} ${type === 'friend_request' ? 'border-primary/50' : ''}`}
              >
                {type === 'friend_request' ? 'Friends' : type}
                {type === 'critical' && criticalCount > 0 && (
                  <span className="ml-1 bg-destructive text-destructive-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {criticalCount}
                  </span>
                )}
                {type === 'friend_request' && friendRequestCount > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {friendRequestCount}
                  </span>
                )}
              </Button>
            ))}
          </div>

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

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`arena-card p-5 transition-all duration-300 ${getPriorityStyle(notification.priority)} ${
                !notification.read ? 'border-l-4' : ''
              } ${
                !notification.read && notification.priority === 'critical' ? 'border-l-destructive' :
                !notification.read && notification.priority === 'important' ? 'border-l-status-warning' :
                !notification.read ? 'border-l-primary' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar for friend requests, icon for others */}
                {notification.type === 'friend_request' && notification.friendRequest ? (
                  <Link to={`/profile/${notification.friendRequest.username}`}>
                    <Avatar className="h-12 w-12">
                      {notification.friendRequest.avatar_url && (
                        <AvatarImage src={notification.friendRequest.avatar_url} />
                      )}
                      <AvatarFallback className="bg-card text-sm font-bold">
                        {notification.friendRequest.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                ) : (
                  <div className={`p-3 rounded-lg ${
                    notification.priority === 'critical' ? 'bg-destructive/20' :
                    notification.priority === 'important' ? 'bg-status-warning/20' :
                    'bg-muted'
                  }`}>
                    {getTypeIcon(notification.type, notification.priority)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className={`font-semibold ${
                      notification.priority === 'critical' ? 'text-destructive' :
                      notification.priority === 'important' ? 'text-status-warning' :
                      'text-foreground'
                    }`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className={`h-2 w-2 rounded-full ${
                        notification.priority === 'critical' ? 'bg-destructive' : 'bg-primary'
                      } animate-pulse`} />
                    )}
                  </div>
                  
                  {/* Friend request shows username as link */}
                  {notification.type === 'friend_request' && notification.friendRequest ? (
                    <div className="mb-2">
                      <Link 
                        to={`/profile/${notification.friendRequest.username}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {notification.friendRequest.username}
                      </Link>
                      <span className="text-foreground text-sm"> wants to be your friend</span>
                      {notification.friendRequest.division && (
                        <Badge 
                          variant="outline" 
                          className={`ml-2 text-xs ${getDivisionColor(notification.friendRequest.division as any)}`}
                        >
                          {notification.friendRequest.division}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-foreground text-sm mb-1">{notification.message}</p>
                      {notification.subtext && (
                        <p className="text-muted-foreground text-xs italic mb-2">{notification.subtext}</p>
                      )}
                    </>
                  )}
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={`${getPriorityBadge(notification.priority)} border text-[10px] uppercase`}>
                      {notification.priority}
                    </Badge>
                    <Badge className={`${getTypeBadge(notification.type)} border text-[10px] uppercase`}>
                      {notification.type === 'friend_request' ? 'friend' : notification.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Friend request action buttons */}
                  {notification.type === 'friend_request' && notification.friendRequest ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="arena"
                        className="text-xs"
                        onClick={() => handleRespondToFriendRequest(notification.friendRequest!.id, true)}
                        disabled={respondingTo === notification.friendRequest.id}
                      >
                        {respondingTo === notification.friendRequest.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleRespondToFriendRequest(notification.friendRequest!.id, false)}
                        disabled={respondingTo === notification.friendRequest.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  ) : (
                    <>
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
                      {notification.actionLabel && (
                        <Button 
                          variant={notification.priority === 'critical' ? 'arena' : 'outline'} 
                          size="sm"
                          className={notification.priority === 'critical' ? 'bg-destructive hover:bg-destructive/80 text-xs' : 'text-xs'}
                        >
                          {notification.actionLabel}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="arena-card p-12 text-center">
            <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">All clear, warrior</h3>
            <p className="text-muted-foreground">
              {selectedType === 'all' 
                ? "No threats detected. Stay vigilant." 
                : `No ${selectedType} alerts. But the arena never sleeps.`}
            </p>
          </div>
        )}

        {/* Bottom Motivation */}
        <div className="mt-10 arena-card p-6 text-center border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <Target className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            Every notification is <span className="text-status-warning">intel</span>. Use it.
          </h3>
          <p className="text-muted-foreground text-sm">
            Those who ignore the warnings fall behind. Those who act stay on top.
          </p>
        </div>
      </div>
    </div>
  );
}
