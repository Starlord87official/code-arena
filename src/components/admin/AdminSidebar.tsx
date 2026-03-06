import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Code2, Trophy, Shield, Swords,
  Bell, Crown, Settings, ChevronLeft, ChevronRight, ShieldAlert, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar,
} from '@/components/ui/sidebar';

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/problems', label: 'Problems', icon: Code2 },
  { path: '/admin/contests', label: 'Contests', icon: Trophy },
  { path: '/admin/clans', label: 'Clans', icon: Shield },
  { path: '/admin/battles', label: 'Battles', icon: Swords },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/championship', label: 'Championship', icon: Crown },
  { path: '/admin/oa', label: 'OA Arena', icon: FileText },
  { path: '/admin/system', label: 'System', icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();
  const { state, toggleSidebar, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link to="/admin/dashboard" className="flex items-center gap-3 group" onClick={() => setOpenMobile(false)}>
          <div className="relative flex-shrink-0">
            <ShieldAlert className="h-8 w-8 text-destructive transition-all group-hover:scale-110" />
            <div className="absolute inset-0 bg-destructive/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className={cn("flex flex-col transition-opacity duration-200", isCollapsed ? "opacity-0 hidden" : "opacity-100")}>
            <span className="font-display text-lg font-bold text-gradient-electric leading-tight">Admin Panel</span>
            <span className="text-[10px] text-destructive uppercase tracking-wider">CodeTrackX</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <div className="space-y-1">
          <p className={cn("px-3 mb-2 text-[10px] font-heading uppercase tracking-widest text-muted-foreground transition-opacity", isCollapsed ? "opacity-0 hidden" : "opacity-100")}>
            Management
          </p>
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.label}>
                  <Link
                    to={item.path}
                    onClick={() => setOpenMobile(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      "font-heading text-sm tracking-wide",
                      isActive(item.path)
                        ? "bg-primary/15 text-primary shadow-[0_0_20px_hsla(199,100%,50%,0.3)] border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-all", isActive(item.path) && "drop-shadow-[0_0_8px_hsl(199,100%,50%)]")} />
                    <span className={cn("transition-opacity duration-200", isCollapsed ? "opacity-0 hidden" : "opacity-100")}>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        <div className="mt-8">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Back to App">
                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent font-heading text-sm tracking-wide">
                  <ChevronLeft className="h-5 w-5 flex-shrink-0" />
                  <span className={cn("transition-opacity duration-200", isCollapsed ? "opacity-0 hidden" : "opacity-100")}>Back to App</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <Button variant="ghost" size="sm" onClick={toggleSidebar} className={cn("w-full justify-center text-muted-foreground hover:text-foreground hidden md:flex", !isCollapsed && "justify-end")}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <><span className="text-xs mr-2">Collapse</span><ChevronLeft className="h-4 w-4" /></>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
