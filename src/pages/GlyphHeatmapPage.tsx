import { GlyphHeatmap } from '@/components/analytics/GlyphHeatmap';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, BarChart3, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function GlyphHeatmapPage() {
  const { isAuthenticated, isLoading, profile } = useAuth();
  
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
                <h1 className="font-display text-2xl font-bold">Glyph Heatmap</h1>
                <Badge className="bg-primary/10 text-primary border-primary/30">BETA</Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Your year of coding, visualized in detail
              </p>
            </div>
          </div>
        </div>
        
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            label="Current Streak"
            value={`${profile?.streak || 0} days`}
            highlight={profile?.streak && profile.streak > 0}
          />
          <StatCard 
            label="Total XP"
            value={(profile?.xp || 0).toLocaleString()}
          />
          <StatCard 
            label="Level"
            value={Math.floor((profile?.xp || 0) / 500) + 1}
          />
          <StatCard 
            label="Division"
            value={(profile?.division || 'bronze').toUpperCase()}
          />
        </div>
        
        {/* Main Heatmap */}
        <GlyphHeatmap />
        
        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" disabled>
            <Share2 className="h-4 w-4 mr-2" />
            Share Progress Card
            <Badge variant="outline" className="ml-2 text-xs">Soon</Badge>
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  highlight = false 
}: { 
  label: string; 
  value: string | number; 
  highlight?: boolean;
}) {
  return (
    <div className="arena-card p-4 rounded-xl">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`font-display text-xl font-bold ${highlight ? 'text-status-warning' : ''}`}>
        {value}
      </p>
    </div>
  );
}
