import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { useAuth } from '@/contexts/AuthContext';

export function Layout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // For non-authenticated users, show simple layout without sidebar
    return (
      <div className="min-h-screen bg-background grid-pattern">
        <TopBar />
        <main className="pt-14">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background grid-pattern">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 pt-14">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
