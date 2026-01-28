import { TrendingUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  level: number;
  xp: number;
  xpProgress: number;
  xpToNextLevel: number;
  className?: string;
}

export function LevelProgressCard({ level, xp, xpProgress, xpToNextLevel, className }: Props) {
  return (
    <div className={cn("arena-card p-6", className)}>
      <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        Level Progress
      </h2>
      
      <div className="space-y-4">
        {/* Level display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/30">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Level</p>
              <p className="font-display text-xl font-bold text-foreground">Level {level}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total XP</p>
            <p className="font-display text-xl font-bold text-primary">{xp.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress to Level {level + 1}</span>
            <span className="text-primary font-medium">{Math.round(xpProgress)}%</span>
          </div>
          <div className="h-3 bg-secondary/50 rounded-full overflow-hidden border border-border/50">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 relative"
              style={{ width: `${xpProgress}%` }}
            >
              {/* Glow effect on progress */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"
                style={{ backgroundSize: '200% 100%' }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {xpToNextLevel.toLocaleString()} XP to next level
          </p>
        </div>
      </div>
    </div>
  );
}
