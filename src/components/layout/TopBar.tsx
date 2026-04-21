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
  Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

// Priority-based notification data for navbar dropdown
const navbarNotifications = [
  { id: 'n-001', priority: 'critical' as const, title: 'RIVAL ALERT: You have been passed', message: 'CodeNinja_X just overtook your rank.', icon: Target, iconColor: 'text-status-warning', read: false, createdAt: new Date(Date.now() - 15 * 60 * 1000) },
  { id: 'n-002', priority: 'critical' as const, title: 'DEMOTION WARNING', message: 'You are 3 positions from demotion zone.', icon: TrendingDown, iconColor: 'text-destructive', read: false, createdAt: new Date(Date.now() - 30 * 60 * 1000) },
  { id: 'n-003', priority: 'critical' as const, title: 'STREAK EXPIRES IN 2 HOURS', message: 'Complete a challenge or lose 12 days.', icon: Flame, iconColor: 'text-status-warning', read: false, createdAt: new Date(Date.now() - 45 * 60 * 1000) },
  { id: 'n-004', priority: 'important' as const, title: 'SURVIVAL MATCH IN 1 HOUR', message: 'Weekly Elimination #47 is mandatory.', icon: Swords, iconColor: 'text-primary', read: false, createdAt: new Date(Date.now() - 60 * 60 * 1000) },
];

// Page mapping → sector code + title
type PageMeta = { sector: string; title: string };
const pageMeta: Record<string, PageMeta> = {
  '/dashboard': { sector: '001', title: 'Dashboard' },
  '/challenges': { sector: '002', title: 'Challenge Arena' },
  '/roadmap': { sector: '004', title: 'Roadmap' },
  '/battle': { sector: '005', title: 'Battle Mode' },
  '/contests': { sector: '007', title: 'Contests' },
  '/leaderboard': { sector: '009', title: 'Leaderboard' },
  '/championship': { sector: '010', title: 'Championship' },
  '/clans': { sector: '011', title: 'Clan Arena' },
  '/oa': { sector: '012', title: 'OA Arena' },
  '/companies': { sector: '013', title: 'Companies' },
  '/doubts': { sector: '014', title: 'Doubts' },
  '/planner': { sector: '015', title: 'Planner' },
  '/notifications': { sector: '016', title: 'Notifications' },
  '/profile': { sector: '017', title: 'Profile' },
  '/settings': { sector: '017', title: 'Settings' },
  '/partner': { sector: '018', title: 'Lock-In Partner' },
  '/mentors': { sector: '019', title: 'Mentors' },
  '/analytics/glyph-heatmap': { sector: '020', title: 'Activity Heatmap' },
  '/hall-of-champions': { sector: '010', title: 'Hall of Champions' },
  '/battle/history': { sector: '006', title: 'Battle History' },
};

function divisionAccent(d?: string): string {
  switch ((d || '').toLowerCase()) {
    case 'gold': return 'text-gold';
    case 'platinum': return 'text-neon-soft';
    case 'diamond': return 'text-neon';
    case 'master': return 'text-neon';
    case 'legend': return 'text-blood';
    case 'silver': return 'text-text-dim';
    default: return 'text-ember';
  }
}

function AuthenticatedTopBar() {
  const { profile, logout } = useAuth();
  const { incoming: friendRequests } = useFriendRequests();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const getMeta = (): PageMeta => {
    if (pageMeta[location.pathname]) return pageMeta[location.pathname];
    if (location.pathname.startsWith('/challenges/')) return { sector: '002', title: 'Challenges' };
    if (location.pathname.startsWith('/profile/')) return { sector: '017', title: 'Profile' };
    if (location.pathname.startsWith('/partner/')) return { sector: '018', title: 'Lock-In Partner' };
    if (location.pathname.startsWith('/battle/')) return { sector: '005', title: 'Battle Mode' };
    if (location.pathname.startsWith('/solve/')) return { sector: '003', title: 'Solve' };
    if (location.pathname.startsWith('/roadmap/')) return { sector: '004', title: 'Roadmap' };
    if (location.pathname.startsWith('/clans/')) return { sector: '011', title: 'Clan Arena' };
    if (location.pathname.startsWith('/contests/')) return { sector: '008', title: 'Contests' };
    if (location.pathname.startsWith('/oa/')) return { sector: '012', title: 'OA Arena' };
    if (location.pathname.startsWith('/championship/')) return { sector: '010', title: 'Championship' };
    if (location.pathname.startsWith('/admin')) return { sector: '999', title: 'Admin' };
    return { sector: '000', title: 'CodeTrackX' };
  };

  const meta = getMeta();
  const tagSlug = meta.title.toUpperCase().replace(/\s+/g, '_');

  const unreadCount = navbarNotifications.filter(n => !n.read).length + friendRequests.length;
  const criticalCount = navbarNotifications.filter(n => n.priority === 'critical' && !n.read).length;

  const getPriorityStyle = (priority: 'critical' | 'important') =>
    priority === 'critical'
      ? 'bg-gradient-to-r from-destructive/15 to-transparent border-l-2 border-destructive'
      : 'bg-gradient-to-r from-status-warning/10 to-transparent border-l-2 border-status-warning';

  return (
    <header className="fixed top-0 right-0 left-0 z-30 h-14 bg-void/70 backdrop-blur-xl border-b border-line/60 md:left-[var(--sidebar-width)] peer-data-[state=collapsed]:md:left-[var(--sidebar-width-icon)]">
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-neon/50 to-transparent" />
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left: Sidebar trigger & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger className="md:hidden text-text-dim hover:text-neon" />
          <div className="flex flex-col min-w-0">
            <div className="hidden sm:flex items-baseline gap-2">
              <span className="font-display text-[10px] font-bold tracking-[0.3em] text-text-mute">
                SECTOR
              </span>
              <span className="font-mono text-[10px] text-neon/70 truncate">
                // {meta.sector}_{tagSlug}
              </span>
            </div>
            <h1 className="font-display text-base sm:text-lg font-bold tracking-tight text-text leading-none truncate">
              {meta.title}
            </h1>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-ember/30 bg-ember/5">
            <Flame className="h-4 w-4 text-ember" />
            <span className="font-display text-[13px] font-bold text-ember tabular-nums">
              {profile?.streak || 0}
            </span>
            <span className="font-display text-[10px] font-semibold tracking-[0.2em] text-ember/80">
              STREAK
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={cn(
                'relative flex h-10 w-10 items-center justify-center border border-line bg-panel/60 hover:border-neon/60 hover:bg-neon/5 transition-colors',
                criticalCount > 0 && 'border-destructive/60',
              )}
            >
              <Bell className={cn('h-[18px] w-[18px] text-text-dim', criticalCount > 0 && 'text-destructive animate-pulse')} />
              {unreadCount > 0 && (
                <span
                  className={cn(
                    'absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-display text-[10px] font-bold text-white',
                    criticalCount > 0
                      ? 'bg-blood shadow-[0_0_12px_hsla(350,100%,60%,0.6)] animate-pulse'
                      : 'bg-neon text-void shadow-[0_0_10px_hsla(187,100%,50%,0.6)]',
                  )}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bl-glass-strong bl-corners overflow-hidden animate-scale-in z-50">
                <div className="p-4 border-b border-line/60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-text">Command Center</h3>
                      {criticalCount > 0 && (
                        <Badge className="bg-destructive/20 text-destructive border-destructive/50 text-[10px]">
                          {criticalCount} CRITICAL
                        </Badge>
                      )}
                    </div>
                    <Link
                      to="/notifications"
                      className="text-xs text-neon hover:underline font-semibold"
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
                          'p-4 border-b border-line/60 hover:bg-neon/5 transition-colors',
                          !notification.read && getPriorityStyle(notification.priority),
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn('p-2 rounded-lg', notification.priority === 'critical' ? 'bg-destructive/20' : 'bg-status-warning/20')}>
                            <IconComponent className={cn('h-4 w-4', notification.iconColor, notification.priority === 'critical' && 'animate-pulse')} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('font-medium text-sm', notification.priority === 'critical' ? 'text-destructive' : 'text-status-warning')}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-text-dim mt-0.5">{notification.message}</p>
                            <p className="text-[10px] text-text-mute mt-1">
                              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className={cn('h-2 w-2 rounded-full flex-shrink-0 mt-2', notification.priority === 'critical' ? 'bg-destructive animate-pulse' : 'bg-status-warning')} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-panel/40 border-t border-line/60">
                  <Link
                    to="/notifications"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex items-center justify-center gap-2 text-sm text-neon hover:text-neon-soft font-semibold"
                  >
                    View All Alerts
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile chip */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="group flex items-center gap-2.5 pr-2 pl-1.5 py-1 border border-line bg-panel/60 hover:border-neon/50 transition-colors"
            >
              <span className="relative flex h-8 w-8 items-center justify-center bg-gradient-to-br from-neon to-electric font-display text-sm font-bold text-void">
                {profile?.username?.[0]?.toUpperCase() || '?'}
                <span className="absolute inset-0 blur-md bg-neon/40 -z-10" />
              </span>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="font-display text-[13px] font-semibold text-text">
                  {profile?.username || 'User'}
                </span>
                <span className={cn('font-display text-[9px] font-bold tracking-[0.22em]', divisionAccent(profile?.division))}>
                  {(profile?.division || 'bronze').toUpperCase()}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-text-dim group-hover:text-neon transition-colors hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bl-glass-strong bl-corners overflow-hidden animate-scale-in z-50">
                <Link
                  to={profile?.username ? `/profile/${profile.username}` : '/profile'}
                  className="flex items-center gap-3 px-4 py-3 text-text hover:bg-neon/10 hover:text-neon transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="font-display text-sm">Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-text hover:bg-neon/10 hover:text-neon transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span className="font-display text-sm">Settings</span>
                </Link>
                <button
                  onClick={() => { logout(); setProfileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-display text-sm">Logout</span>
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
    <header className="fixed top-0 right-0 left-0 z-50 h-14 bg-void/80 backdrop-blur-xl border-b border-line/60">
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-neon/50 to-transparent" />
      <div className="h-full px-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-md bg-neon/30 blur-md" />
            <div className="relative flex h-9 w-9 items-center justify-center border border-neon/70 bg-void bl-clip-notch">
              <Code2 className="h-5 w-5 text-neon" />
            </div>
          </div>
          <span className="font-display text-lg font-bold text-text">
            Code<span className="text-neon text-glow">TrackX</span>
            <span className="ml-2 text-xs text-text-mute font-mono">(Private Beta)</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" className="font-heading">Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="egoist" size="default">Enter Arena</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function TopBar() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <UnauthenticatedTopBar />;
  return <AuthenticatedTopBar />;
}
