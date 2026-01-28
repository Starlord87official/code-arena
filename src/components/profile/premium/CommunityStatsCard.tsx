import { Eye, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunityStatsCardProps {
  views?: number;
  viewsDelta?: number;
  solutions?: number;
  solutionsDelta?: number;
  discussed?: number;
  discussedDelta?: number;
}

export function CommunityStatsCard({
  views = 8505,
  viewsDelta = 847,
  solutions = 135,
  solutionsDelta = 11,
  discussed = 63,
  discussedDelta = 5,
}: CommunityStatsCardProps) {
  return (
    <div className="arena-card p-6">
      <h3 className="font-display font-bold text-lg text-foreground mb-4">Community Stats</h3>
      
      <div className="space-y-4">
        {/* Views */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Eye className="h-4 w-4 text-primary" />
            </div>
            <span className="text-muted-foreground">Views</span>
            <span className="font-display font-bold text-foreground">{views.toLocaleString()}</span>
          </div>
          <span className="text-xs text-status-success flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +{viewsDelta} views x4
          </span>
        </div>

        {/* Solutions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-status-success/20 flex items-center justify-center">
              <FileText className="h-4 w-4 text-status-success" />
            </div>
            <span className="text-muted-foreground">Solutions</span>
            <span className="font-display font-bold text-foreground">{solutions}</span>
          </div>
          <span className="text-xs text-status-success flex items-center gap-1">
            +{solutionsDelta}
          </span>
        </div>

        {/* Discussed */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rank-gold/20 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-rank-gold" />
            </div>
            <span className="text-muted-foreground">Discussed</span>
            <span className="font-display font-bold text-foreground">{discussed}</span>
          </div>
          <span className="text-xs text-status-success flex items-center gap-1">
            +{discussedDelta}
          </span>
        </div>
      </div>
    </div>
  );
}
