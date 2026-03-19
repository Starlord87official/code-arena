import ActivityHeatmap from '@/components/heatmap/ActivityHeatmap';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function GlyphHeatmapPage() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold">Activity Heatmap</h1>
                <Badge className="bg-primary/10 text-primary border-primary/30">BETA</Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Your year of coding, visualized in detail
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Heatmap */}
        <div className="arena-card p-6 rounded-xl">
          <ActivityHeatmap />
        </div>
      </div>
    </div>
  );
}
