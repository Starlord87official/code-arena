import { cn } from '@/lib/utils';
import { SolveBreakdown } from '@/hooks/useProfileStats';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle2, Clock, Zap } from 'lucide-react';

interface Props {
  breakdown: SolveBreakdown;
  totalProblems: number;
  uniqueTopics: number;
  className?: string;
}

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', color: 'text-green-500', bg: 'bg-green-500/20', border: 'border-green-500/30' },
  medium: { label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
  hard: { label: 'Hard', color: 'text-orange-500', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
  extreme: { label: 'Extreme', color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/30' },
};

export function SolveBreakdownCard({ breakdown, totalProblems, uniqueTopics, className }: Props) {
  // Calculate percentages for the bar
  const getPercentage = (count: number) => 
    totalProblems > 0 ? Math.round((count / totalProblems) * 100) : 0;

  // Accuracy rate - since we only track completions, show 100%
  const accuracyRate = 100;

  // Calculate median solve time placeholder (would need actual timing data)
  const medianSolveTime = '--';

  return (
    <div className={cn("arena-card p-6 space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Solve Statistics
        </h3>
        <Badge variant="outline" className="text-primary border-primary/30">
          {totalProblems} Solved
        </Badge>
      </div>

      {/* Difficulty breakdown bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Difficulty Distribution</span>
        </div>
        
        <div className="flex h-4 rounded-full overflow-hidden bg-secondary/30">
          {totalProblems > 0 ? (
            <>
              {breakdown.easy > 0 && (
                <div 
                  className="bg-green-500/80 transition-all" 
                  style={{ width: `${getPercentage(breakdown.easy)}%` }}
                />
              )}
              {breakdown.medium > 0 && (
                <div 
                  className="bg-yellow-500/80 transition-all" 
                  style={{ width: `${getPercentage(breakdown.medium)}%` }}
                />
              )}
              {breakdown.hard > 0 && (
                <div 
                  className="bg-orange-500/80 transition-all" 
                  style={{ width: `${getPercentage(breakdown.hard)}%` }}
                />
              )}
              {breakdown.extreme > 0 && (
                <div 
                  className="bg-red-500/80 transition-all" 
                  style={{ width: `${getPercentage(breakdown.extreme)}%` }}
                />
              )}
            </>
          ) : (
            <div className="w-full flex items-center justify-center text-xs text-muted-foreground">
              No problems solved yet
            </div>
          )}
        </div>
      </div>

      {/* Difficulty counts */}
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(DIFFICULTY_CONFIG) as Array<keyof typeof DIFFICULTY_CONFIG>).map((diff) => {
          const config = DIFFICULTY_CONFIG[diff];
          const count = breakdown[diff];
          return (
            <div 
              key={diff}
              className={cn(
                "text-center p-3 rounded-lg border",
                config.bg,
                config.border
              )}
            >
              <div className={cn("text-2xl font-display font-bold", config.color)}>
                {count}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {config.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase">Accuracy</span>
          </div>
          <div className="text-lg font-bold text-status-success">{accuracyRate}%</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <Zap className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase">Topics</span>
          </div>
          <div className="text-lg font-bold text-primary">{uniqueTopics}</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase">Median Time</span>
          </div>
          <div className="text-lg font-bold text-muted-foreground">{medianSolveTime}</div>
        </div>
      </div>

      {/* Private Beta empty state */}
      {totalProblems === 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Start solving challenges to see your stats!
        </div>
      )}
    </div>
  );
}
