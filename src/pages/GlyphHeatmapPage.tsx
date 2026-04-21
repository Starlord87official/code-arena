import ActivityHeatmap from '@/components/heatmap/ActivityHeatmap';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, BarChart3, Flame, Zap, Trophy, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useHeatmapData } from '@/hooks/useHeatmapData';
import { PageHeader } from '@/components/bl/PageHeader';
import { StatTile } from '@/components/bl/StatTile';
import { GlassPanel } from '@/components/bl/GlassPanel';

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
    <div className="min-h-screen py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <PageHeader
          sector="020"
          tag="HEATMAP"
          title="Activity Heatmap"
          subtitle="Your year of coding, visualized in detail"
          right={<Badge className="bg-neon/10 text-neon border-neon/30 font-mono">BETA</Badge>}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatTile label="Total XP" value={stats.totalXP.toLocaleString()} icon={Zap} accent="neon" index={0} />
          <StatTile label="Current Streak" value={`${stats.currentStreak}d`} icon={Flame} accent="ember" index={1} />
          <StatTile label="Longest Streak" value={`${stats.longestStreak}d`} icon={Trophy} accent="gold" index={2} />
          <StatTile label="Total Solved" value={stats.totalSolved.toLocaleString()} icon={TrendingUp} accent="electric" index={3} />
        </div>

        <GlassPanel corners padding="lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-neon mr-2" />
              <span className="text-text-dim text-sm">Loading activity data…</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          ) : stats.totalSolved === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <BarChart3 className="h-10 w-10 text-text-mute/40" />
              <p className="text-text-dim text-sm">No activity yet — start solving to see your heatmap!</p>
            </div>
          ) : (
            <ActivityHeatmap data={data} />
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
