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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { mockNotifications, getDivisionColor } from '@/lib/mockData';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const navLinks = isAuthenticated
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: Code2 },
        { path: '/challenges', label: 'Challenges', icon: Swords },
        { path: '/contests', label: 'Contests', icon: Trophy },
        { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
      ]
    : [];

  const isActive = (path: string) => location.pathname === path;

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
                    {user?.streak}
                  </span>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs font-bold flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-arena overflow-hidden animate-scale-in">
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading font-semibold">Notifications</h3>
                          <Link
                            to="/notifications"
                            className="text-xs text-primary hover:underline"
                            onClick={() => setNotificationsOpen(false)}
                          >
                            View All
                          </Link>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {mockNotifications.slice(0, 4).map(notification => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-border hover:bg-secondary/50 transition-colors ${
                              !notification.read ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                              )}
                              <div className={!notification.read ? '' : 'ml-5'}>
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
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
                      {user?.username[0]}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="font-heading font-semibold text-sm">{user?.username}</p>
                      <p className={`text-xs uppercase ${getDivisionColor(user?.division || 'bronze')}`}>
                        {user?.division}
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
