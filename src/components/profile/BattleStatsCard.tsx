import { Swords, Trophy, Target, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BattleStats {
  played: number;
  won: number;
  winRate: number;
  elo: number;
}

interface Props {
  stats: BattleStats;
  className?: string;
}

export function BattleStatsCard({ stats, className }: Props) {
  const { played, won, winRate, elo } = stats;

  return (
    <div className={cn("arena-card p-6", className)}>
      <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
        <Swords className="h-5 w-5 text-primary" />
        Battle Statistics
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 rounded-lg bg-secondary/30 border border-border/50">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Swords className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-display font-bold text-foreground">
            {played}
          </div>
          <div className="text-xs text-muted-foreground">Battles Played</div>
        </div>
        
        <div className="text-center p-4 rounded-lg bg-secondary/30 border border-border/50">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Trophy className="h-4 w-4 text-status-success" />
          </div>
          <div className="text-2xl font-display font-bold text-status-success">
            {won}
          </div>
          <div className="text-xs text-muted-foreground">Battles Won</div>
        </div>
        
        <div className="text-center p-4 rounded-lg bg-secondary/30 border border-border/50">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Target className="h-4 w-4 text-status-warning" />
          </div>
          <div className={cn(
            "text-2xl font-display font-bold",
            winRate >= 50 ? "text-status-success" : "text-status-warning"
          )}>
            {winRate}%
          </div>
          <div className="text-xs text-muted-foreground">Win Rate</div>
        </div>
        
        <div className="text-center p-4 rounded-lg bg-secondary/30 border border-border/50">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-display font-bold text-primary">
            {elo}
          </div>
          <div className="text-xs text-muted-foreground">ELO Rating</div>
        </div>
      </div>

      {/* Empty state message */}
      {played === 0 && (
        <div className="text-center mt-4 pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Challenge others to duels to build your battle record!
          </p>
        </div>
      )}
    </div>
  );
}
