import ActivityHeatmap from '@/components/heatmap/ActivityHeatmap';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, BarChart3, Flame, Zap, Trophy, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useHeatmapData } from '@/hooks/useHeatmapData';

export default function GlyphHeatmapPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, stats, isLoading, error } = useHeatmapData();
  
  if (authLoading) {
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Zap className="h-4 w-4 text-primary" />}
            label="Total XP"
            value={stats.totalXP.toLocaleString()}
          />
          <StatCard
            icon={<Flame className="h-4 w-4" style={{ color: 'hsl(25, 95%, 53%)' }} />}
            label="Current Streak"
            value={`${stats.currentStreak} days`}
          />
          <StatCard
            icon={<Trophy className="h-4 w-4" style={{ color: 'hsl(48, 96%, 53%)' }} />}
            label="Longest Streak"
            value={`${stats.longestStreak} days`}
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4" style={{ color: 'hsl(160, 84%, 39%)' }} />}
            label="Total Solved"
            value={stats.totalSolved.toLocaleString()}
          />
        </div>
        
        {/* Main Heatmap */}
        <div className="arena-card p-6 rounded-xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground text-sm">Loading activity data…</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          ) : stats.totalSolved === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">No activity yet — start solving to see your heatmap!</p>
            </div>
          ) : (
            <ActivityHeatmap data={data} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="arena-card p-4 rounded-xl">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
