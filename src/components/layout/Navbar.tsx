import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Code2, 
  Flame, 
  LogOut, 
  Menu, 
  Settings, 
  Swords, 
  Trophy, 
  User as UserIcon,
  X,
  AlertTriangle,
  Target,
  TrendingDown,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getDivisionColor } from '@/lib/mockData';
import { formatDistanceToNow } from 'date-fns';

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

export function Navbar() {
  const { profile, user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const unreadCount = navbarNotifications.filter(n => !n.read).length;
  const criticalCount = navbarNotifications.filter(n => n.priority === 'critical' && !n.read).length;

  // Phase 1: Student-focused navigation - no mentor/clan links
  const navLinks = isAuthenticated
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/challenges', label: 'Challenges', icon: Swords },
        { path: '/contests', label: 'Contests', icon: Trophy },
        { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
      ]
    : [];

  const isActive = (path: string) => location.pathname === path;

  const getPriorityStyle = (priority: 'critical' | 'important') => {
    return priority === 'critical' 
      ? 'bg-gradient-to-r from-destructive/15 to-transparent border-l-2 border-destructive'
      : 'bg-gradient-to-r from-status-warning/10 to-transparent border-l-2 border-status-warning';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="relative">
              <Code2 className="h-8 w-8 text-primary transition-all group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display text-xl font-bold text-gradient-electric">
              CodeLock
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-heading text-sm uppercase tracking-wider transition-all ${
                  isActive(path)
                    ? 'bg-primary/10 text-primary neon-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Streak */}
                <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary border border-border">
                  <Flame className="h-4 w-4 text-status-warning streak-flame" />
                  <span className="font-display text-sm font-semibold text-status-warning">
                    {profile?.streak || 0}
                  </span>
                </div>

                {/* Notifications Bell - Enhanced */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className={`relative ${criticalCount > 0 ? 'text-destructive' : ''}`}
                  >
                    <Bell className={`h-5 w-5 ${criticalCount > 0 ? 'animate-pulse' : ''}`} />
                    {unreadCount > 0 && (
                      <span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center ${
                        criticalCount > 0 
                          ? 'bg-destructive text-destructive-foreground animate-pulse' 
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        {unreadCount}
                      </span>
                    )}
                    {/* Glow effect for critical alerts */}
                    {criticalCount > 0 && (
                      <div className="absolute inset-0 bg-destructive/20 blur-md rounded-full animate-pulse" />
                    )}
                  </Button>

                  {/* Notifications Dropdown - Enhanced */}
                  {notificationsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-lg shadow-arena overflow-hidden animate-scale-in">
                      {/* Header with critical warning */}
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

                      {/* Notification Items */}
                      <div className="max-h-80 overflow-y-auto">
                        {navbarNotifications.map(notification => {
                          const IconComponent = notification.icon;
                          return (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-border hover:bg-secondary/50 transition-colors ${
                                !notification.read ? getPriorityStyle(notification.priority) : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${
                                  notification.priority === 'critical' ? 'bg-destructive/20' : 'bg-status-warning/20'
                                }`}>
                                  <IconComponent className={`h-4 w-4 ${notification.iconColor} ${
                                    notification.priority === 'critical' ? 'animate-pulse' : ''
                                  }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-sm ${
                                    notification.priority === 'critical' ? 'text-destructive' : 'text-status-warning'
                                  }`}>
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
                                  <div className={`h-2 w-2 rounded-full flex-shrink-0 mt-2 ${
                                    notification.priority === 'critical' ? 'bg-destructive animate-pulse' : 'bg-status-warning'
                                  }`} />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer CTA */}
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

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-primary-foreground">
                      {profile?.username?.[0] || '?'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="font-heading font-semibold text-sm">{profile?.username || 'User'}</p>
                      <p className={`text-xs uppercase ${getDivisionColor((profile?.division || 'bronze') as any)}`}>
                        {profile?.division || 'bronze'}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>

                  {/* Profile Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-arena overflow-hidden animate-scale-in">
                      <Link
                        to="/profile"
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
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" className="font-heading">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="arena" className="font-heading">
                    Enter Arena
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-slide-in-left">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-heading uppercase tracking-wider transition-all ${
                  isActive(path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
