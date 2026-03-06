import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminSidebar } from './AdminSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminLayout() {
  const { isAdmin, isLoading, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !isAdmin) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAdmin, isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background grid-pattern">
        <AdminSidebar />
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
