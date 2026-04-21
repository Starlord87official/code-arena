import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Swords,
  CalendarDays,
  Building2,
  MessageCircleQuestion,
  Target,
  Trophy,
  Users,
  FileBarChart,
  Settings,
  Code2,
  ChevronLeft,
  ChevronRight,
  Crown,
  BarChart3,
  ClipboardCheck,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  accent?: 'neon' | 'ember';
}

const primaryNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, accent: 'neon' },
  { path: '/challenges', label: 'Challenge Arena', icon: Swords },
  { path: '/championship', label: 'Championship', icon: Crown, highlight: true, accent: 'ember' },
  { path: '/planner', label: 'Planner', icon: CalendarDays },
  { path: '/companies', label: 'Companies', icon: Building2 },
  { path: '/doubts', label: 'Doubts', icon: MessageCircleQuestion },
  { path: '/battle', label: 'Battle', icon: Target },
  { path: '/contests', label: 'Contests', icon: Trophy, highlight: true, accent: 'ember' },
  { path: '/oa', label: 'OA Arena', icon: ClipboardCheck, highlight: true, accent: 'ember' },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/clans', label: 'Clan Arena', icon: Shield, highlight: true, accent: 'ember' },
];

const secondaryNavItems: NavItem[] = [
  { path: '/analytics/glyph-heatmap', label: 'Activity Heatmap', icon: BarChart3, highlight: true, accent: 'ember' },
  { path: '/partner', label: 'Lock-In Partner', icon: Users },
  { path: '/hall-of-champions', label: 'Hall of Champions', icon: Crown },
  { path: '/battle/history', label: 'Battle History', icon: FileBarChart },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { state, toggleSidebar, setOpenMobile } = useSidebar();

  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/challenges') return location.pathname === '/challenges' || location.pathname.startsWith('/challenges/');
    if (path === '/championship') return location.pathname === '/championship' || location.pathname.startsWith('/championship/');
    if (path === '/analytics/glyph-heatmap') return location.pathname.startsWith('/analytics');
    if (path === '/contests') return location.pathname === '/contests' || location.pathname.startsWith('/contests/');
    if (path === '/oa') return location.pathname === '/oa' || location.pathname.startsWith('/oa/');
    if (path === '/clans') return location.pathname === '/clans' || location.pathname.startsWith('/clans/');
    return location.pathname === path;
  };

  const handleNavClick = () => setOpenMobile(false);

  if (!isAuthenticated) return null;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-line/60 bg-void/70 backdrop-blur-xl"
    >
      {/* Backdrop layers */}
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-40" />
      <div className="pointer-events-none absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-neon/40 to-transparent" />

      {/* Brand */}
      <SidebarHeader className="relative border-b border-line/60 px-4 py-5">
        <Link to="/dashboard" className="flex items-center gap-3 group" onClick={handleNavClick}>
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-md bg-neon/30 blur-md transition-opacity group-hover:opacity-100" />
            <div className="relative flex h-10 w-10 items-center justify-center border border-neon/70 bg-void bl-clip-notch">
              <Code2 className="h-5 w-5 text-neon" />
            </div>
          </div>
          <div className={cn('min-w-0 transition-opacity duration-200', isCollapsed ? 'opacity-0 hidden' : 'opacity-100')}>
            <div className="font-display text-[17px] font-bold tracking-tight text-text leading-none">
              Code<span className="text-neon text-glow">TrackX</span>
            </div>
            <div className="mt-1.5 inline-flex items-center gap-1.5 font-display text-[9px] font-bold tracking-[0.22em] text-neon/80">
              <span className="h-1 w-1 rounded-full bg-neon bl-flicker shadow-[0_0_8px_hsl(var(--neon))]" />
              PRIVATE BETA
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="relative px-2 pb-4">
        {/* MAIN */}
        <SectionLabel label="MAIN" collapsed={isCollapsed} />
        <SidebarMenu>
          {primaryNavItems.map((item) => (
            <NavRow
              key={item.path}
              item={item}
              active={isActive(item.path)}
              collapsed={isCollapsed}
              onClick={handleNavClick}
            />
          ))}
        </SidebarMenu>

        {/* MORE */}
        <div className="mt-6">
          <SectionLabel label="MORE" collapsed={isCollapsed} />
          <SidebarMenu>
            {secondaryNavItems.map((item) => (
              <NavRow
                key={item.path}
                item={item}
                active={isActive(item.path)}
                collapsed={isCollapsed}
                onClick={handleNavClick}
              />
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>

      {/* Collapse toggle */}
      <SidebarFooter className="relative border-t border-line/60 p-0">
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden md:flex w-full items-center justify-center gap-2 px-4 py-3 font-display text-[11px] font-semibold tracking-[0.18em] text-text-dim hover:text-neon transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>COLLAPSE</span>
            </>
          )}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="mx-3 my-2 h-px bg-line/60" />;
  return (
    <div className="px-3 pt-3 pb-1 font-display text-[10px] font-bold tracking-[0.28em] text-text-mute">
      {label}
    </div>
  );
}

function NavRow({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
        <Link
          to={item.path}
          onClick={onClick}
          data-active={active ? 'true' : 'false'}
          className={cn(
            'bl-nav-item group flex items-center gap-3 rounded-[6px] px-3 py-2.5 text-[13.5px] font-medium',
            active ? 'text-neon' : 'text-text-dim',
            collapsed && 'justify-center px-2',
          )}
        >
          <Icon
            className={cn(
              'h-[18px] w-[18px] shrink-0 transition-colors',
              active
                ? 'text-neon'
                : item.accent === 'ember'
                  ? 'text-ember'
                  : 'text-text-dim group-hover:text-neon',
            )}
          />
          {!collapsed && (
            <>
              <span className="truncate">{item.label}</span>
              {item.highlight && (
                <span
                  className={cn(
                    'ml-auto inline-flex h-[18px] items-center px-1.5 font-display text-[9px] font-bold tracking-[0.15em] bl-clip-chevron',
                    item.accent === 'ember'
                      ? 'bg-ember/15 text-ember border border-ember/40'
                      : 'bg-neon/15 text-neon border border-neon/40',
                  )}
                >
                  NEW
                </span>
              )}
            </>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
