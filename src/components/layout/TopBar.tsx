import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  Settings, 
  User as UserIcon,
  AlertTriangle,
  Target,
  TrendingDown,
  ChevronRight,
  Flame,
  Swords,
  Code2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getDivisionColor } from '@/lib/mockData';
import { formatDistanceToNow } from 'date-fns';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

// Priority-based notification data for navbar dropdown
const navbarNotifications = [
  {
    id: 'n-001',
    priority: 'critical' as const,
    title: 'RIVAL ALERT: You have been passed',
    message: 'CodeNinja_X just overtook your rank.',
    icon: Target,
    iconColor: 'text-status-warning',
    read: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: 'n-002',
    priority: 'critical' as const,
    title: 'DEMOTION WARNING',
    message: 'You are 3 positions from demotion zone.',
    icon: TrendingDown,
    iconColor: 'text-destructive',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'n-003',
    priority: 'critical' as const,
    title: 'STREAK EXPIRES IN 2 HOURS',
    message: 'Complete a challenge or lose 12 days.',
    icon: Flame,
    iconColor: 'text-status-warning',
    read: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: 'n-004',
    priority: 'important' as const,
    title: 'SURVIVAL MATCH IN 1 HOUR',
    message: 'Weekly Elimination #47 is mandatory.',
    icon: Swords,
    iconColor: 'text-primary',
    read: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
  },
];

// Page title mapping
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/challenges': 'Challenge Arena',
  '/planner': 'Planner',
  '/companies': 'Companies',
  '/doubts': 'Doubts',
  '/battle': 'Battle Mode',
  '/leaderboard': 'Leaderboard',
  '/partner': 'Lock-In Partner',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
  '/profile': 'Profile',
};

function AuthenticatedTopBar() {
  const { profile, logout } = useAuth();
  const { incoming: friendRequests } = useFriendRequests();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Get page title from current path
  const getPageTitle = () => {
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }
    if (location.pathname.startsWith('/challenges/')) {
      const category = location.pathname.split('/')[2];
      const categoryTitles: Record<string, string> = {
        'dsa': 'DSA Challenges',
        'system-design': 'System Design',
        'coding': 'Coding Challenges',
      };
      return categoryTitles[category] || 'Challenges';
    }
    if (location.pathname.startsWith('/profile/')) return 'Profile';
    if (location.pathname.startsWith('/partner/')) return 'Lock-In Partner';
    if (location.pathname.startsWith('/battle/')) return 'Battle Mode';
    if (location.pathname.startsWith('/solve/')) return 'Solve Challenge';
    if (location.pathname.startsWith('/roadmap/')) return 'Roadmap';
    return 'CodeTrackX';
  };

  const unreadCount = navbarNotifications.filter(n => !n.read).length + friendRequests.length;
  const criticalCount = navbarNotifications.filter(n => n.priority === 'critical' && !n.read).length;

  const getPriorityStyle = (priority: 'critical' | 'important') => {
    return priority === 'critical' 
      ? 'bg-gradient-to-r from-destructive/15 to-transparent border-l-2 border-destructive'
      : 'bg-gradient-to-r from-status-warning/10 to-transparent border-l-2 border-status-warning';
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-30 h-14 bg-background/60 backdrop-blur-xl border-b border-border md:left-[var(--sidebar-width)] peer-data-[state=collapsed]:md:left-[var(--sidebar-width-icon)]">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left: Sidebar trigger & Page Title */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" />
          <h1 className="font-display text-lg font-semibold text-foreground">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Streak */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary border border-border">
            <Flame className="h-4 w-4 text-status-warning streak-flame" />
            <span className="font-display text-sm font-semibold text-status-warning">
              {profile?.streak || 0}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={cn("relative", criticalCount > 0 && "text-destructive")}
            >
              <Bell className={cn("h-5 w-5", criticalCount > 0 && "animate-pulse")} />
              {unreadCount > 0 && (
                <span className={cn(
                  "absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center",
                  criticalCount > 0 
                    ? "bg-destructive text-destructive-foreground animate-pulse" 
                    : "bg-primary text-primary-foreground"
                )}>
                  {unreadCount}
                </span>
              )}
              {criticalCount > 0 && (
                <div className="absolute inset-0 bg-destructive/20 blur-md rounded-full animate-pulse" />
              )}
            </Button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-lg shadow-arena overflow-hidden animate-scale-in z-50">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold">Command Center</h3>
                      {criticalCount > 0 && (
                        <Badge className="bg-destructive/20 text-destructive border-destructive/50 text-[10px]">
                          {criticalCount} CRITICAL
                        </Badge>
                      )}
                    </div>
                    <Link
                      to="/notifications"
                      className="text-xs text-primary hover:underline font-semibold"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      View All →
                    </Link>
                  </div>
                  {criticalCount > 0 && (
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Immediate action required</span>
                    </div>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {navbarNotifications.map(notification => {
                    const IconComponent = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 border-b border-border hover:bg-secondary/50 transition-colors",
                          !notification.read && getPriorityStyle(notification.priority)
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            notification.priority === 'critical' ? 'bg-destructive/20' : 'bg-status-warning/20'
                          )}>
                            <IconComponent className={cn(
                              "h-4 w-4",
                              notification.iconColor,
                              notification.priority === 'critical' && 'animate-pulse'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-medium text-sm",
                              notification.priority === 'critical' ? 'text-destructive' : 'text-status-warning'
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className={cn(
                              "h-2 w-2 rounded-full flex-shrink-0 mt-2",
                              notification.priority === 'critical' ? 'bg-destructive animate-pulse' : 'bg-status-warning'
                            )} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-muted/30 border-t border-border">
                  <Link
                    to="/notifications"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold"
                  >
                    View All Alerts
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-primary-foreground">
                {profile?.username?.[0] || '?'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-heading font-semibold text-sm">{profile?.username || 'User'}</p>
                <p className={cn("text-xs uppercase", getDivisionColor((profile?.division || 'bronze') as any))}>
                  {profile?.division || 'bronze'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-arena overflow-hidden animate-scale-in z-50">
                <Link
                  to={profile?.username ? `/profile/${profile.username}` : '/profile'}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="font-heading">Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-heading">Settings</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-secondary transition-colors text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-heading">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function UnauthenticatedTopBar() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 h-14 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="h-full px-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group">
          <Code2 className="h-8 w-8 text-primary transition-all group-hover:scale-110" />
          <span className="font-display text-xl font-bold text-gradient-electric">
            CodeTrackX <span className="text-xs text-muted-foreground">(Private Beta)</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" className="font-heading">Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="arena" className="font-heading">Enter Arena</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function TopBar() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <UnauthenticatedTopBar />;
  }
  
  return <AuthenticatedTopBar />;
}
