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
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar 
} from '@/components/ui/sidebar';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const primaryNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/challenges', label: 'Challenge Arena', icon: Swords },
  { path: '/planner', label: 'Planner', icon: CalendarDays },
  { path: '/companies', label: 'Companies', icon: Building2 },
  { path: '/doubts', label: 'Doubts', icon: MessageCircleQuestion },
  { path: '/battle', label: 'Battle', icon: Target },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const secondaryNavItems: NavItem[] = [
  { path: '/partner', label: 'Lock-In Partner', icon: Users },
  { path: '/battle/history', label: 'Battle History', icon: FileBarChart },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { state, toggleSidebar, setOpenMobile } = useSidebar();
  
  const isCollapsed = state === 'collapsed';
  
  const isActive = (path: string) => {
    if (path === '/challenges') {
      return location.pathname === '/challenges' || location.pathname.startsWith('/challenges/');
    }
    return location.pathname === path;
  };

  const handleNavClick = () => {
    // Close mobile sidebar on navigation
    setOpenMobile(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Sidebar 
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
    >
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link to="/dashboard" className="flex items-center gap-3 group" onClick={handleNavClick}>
          <div className="relative flex-shrink-0">
            <Code2 className="h-8 w-8 text-primary transition-all group-hover:scale-110" />
            <div className="absolute inset-0 bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className={cn(
            "flex flex-col transition-opacity duration-200",
            isCollapsed ? "opacity-0 hidden" : "opacity-100"
          )}>
            <span className="font-display text-lg font-bold text-gradient-electric leading-tight">
              CodeTrackX
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Private Beta
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {/* Primary Navigation */}
        <div className="space-y-1">
          <p className={cn(
            "px-3 mb-2 text-[10px] font-heading uppercase tracking-widest text-muted-foreground transition-opacity",
            isCollapsed ? "opacity-0 hidden" : "opacity-100"
          )}>
            Main
          </p>
          <SidebarMenu>
            {primaryNavItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive(item.path)}
                  tooltip={item.label}
                >
                  <Link
                    to={item.path}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      "font-heading text-sm tracking-wide",
                      isActive(item.path)
                        ? "bg-primary/15 text-primary shadow-[0_0_20px_hsla(199,100%,50%,0.3)] border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0 transition-all",
                      isActive(item.path) && "drop-shadow-[0_0_8px_hsl(199,100%,50%)]"
                    )} />
                    <span className={cn(
                      "transition-opacity duration-200",
                      isCollapsed ? "opacity-0 hidden" : "opacity-100"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {/* Secondary Navigation */}
        <div className="mt-8 space-y-1">
          <p className={cn(
            "px-3 mb-2 text-[10px] font-heading uppercase tracking-widest text-muted-foreground transition-opacity",
            isCollapsed ? "opacity-0 hidden" : "opacity-100"
          )}>
            More
          </p>
          <SidebarMenu>
            {secondaryNavItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive(item.path)}
                  tooltip={item.label}
                >
                  <Link
                    to={item.path}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      "font-heading text-sm tracking-wide",
                      isActive(item.path)
                        ? "bg-primary/15 text-primary shadow-[0_0_20px_hsla(199,100%,50%,0.3)] border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0 transition-all",
                      isActive(item.path) && "drop-shadow-[0_0_8px_hsl(199,100%,50%)]"
                    )} />
                    <span className={cn(
                      "transition-opacity duration-200",
                      isCollapsed ? "opacity-0 hidden" : "opacity-100"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>

      {/* Footer with Collapse Toggle */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn(
            "w-full justify-center text-muted-foreground hover:text-foreground hidden md:flex",
            !isCollapsed && "justify-end"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <span className="text-xs mr-2">Collapse</span>
              <ChevronLeft className="h-4 w-4" />
            </>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
