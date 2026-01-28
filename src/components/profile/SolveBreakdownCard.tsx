import { cn } from '@/lib/utils';
import { SolveBreakdown } from '@/hooks/useProfileStats';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle2, Clock, Layers } from 'lucide-react';

interface Props {
  breakdown: SolveBreakdown;
  totalProblems: number;
  uniqueTopics: number;
  className?: string;
}

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', color: 'text-status-success', bgBar: 'bg-status-success', bgCard: 'bg-status-success/10', border: 'border-status-success/20' },
  medium: { label: 'Medium', color: 'text-status-warning', bgBar: 'bg-status-warning', bgCard: 'bg-status-warning/10', border: 'border-status-warning/20' },
  hard: { label: 'Hard', color: 'text-orange-500', bgBar: 'bg-orange-500', bgCard: 'bg-orange-500/10', border: 'border-orange-500/20' },
  extreme: { label: 'Extreme', color: 'text-destructive', bgBar: 'bg-destructive', bgCard: 'bg-destructive/10', border: 'border-destructive/20' },
};

export function SolveBreakdownCard({ breakdown, totalProblems, uniqueTopics, className }: Props) {
  // Calculate percentages for the bar
  const getPercentage = (count: number) => 
    totalProblems > 0 ? Math.round((count / totalProblems) * 100) : 0;

  // Accuracy rate - since we only track completions, show 100%
  const accuracyRate = 100;

  return (
    <div className={cn("arena-card p-6 space-y-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg flex items-center gap-2 text-foreground">
          <Target className="h-5 w-5 text-primary" />
          Solve Statistics
        </h3>
        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
          {totalProblems} Solved
        </Badge>
      </div>

      {/* Difficulty distribution bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Difficulty Distribution</span>
        </div>
        
        <div className="flex h-3 rounded-full overflow-hidden bg-secondary/30 border border-border/50">
          {totalProblems > 0 ? (
            <>
              {breakdown.easy > 0 && (
                <div 
                  className={cn(DIFFICULTY_CONFIG.easy.bgBar, "transition-all")}
                  style={{ width: `${getPercentage(breakdown.easy)}%` }}
                />
              )}
              {breakdown.medium > 0 && (
                <div 
                  className={cn(DIFFICULTY_CONFIG.medium.bgBar, "transition-all")}
                  style={{ width: `${getPercentage(breakdown.medium)}%` }}
                />
              )}
              {breakdown.hard > 0 && (
                <div 
                  className={cn(DIFFICULTY_CONFIG.hard.bgBar, "transition-all")}
                  style={{ width: `${getPercentage(breakdown.hard)}%` }}
                />
              )}
              {breakdown.extreme > 0 && (
                <div 
                  className={cn(DIFFICULTY_CONFIG.extreme.bgBar, "transition-all")}
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
                config.bgCard,
                config.border
              )}
            >
              <div className={cn("text-xl font-display font-bold", config.color)}>
                {count}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
                {config.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase tracking-wide">Accuracy</span>
          </div>
          <div className="text-lg font-bold text-status-success">{accuracyRate}%</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <Layers className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase tracking-wide">Topics</span>
          </div>
          <div className="text-lg font-bold text-primary">{uniqueTopics}</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase tracking-wide">Median Time</span>
          </div>
          <div className="text-lg font-bold text-muted-foreground">--</div>
        </div>
      </div>

      {/* Empty state message */}
      {totalProblems === 0 && (
        <div className="text-center py-2 text-muted-foreground text-sm">
          Start solving challenges to see your stats!
        </div>
      )}
    </div>
  );
}
