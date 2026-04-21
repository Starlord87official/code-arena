import { useRankState } from '@/hooks/useRankState';
import { useDecayWarning } from '@/hooks/useDecayWarning';
import { usePromotionSeries } from '@/hooks/usePromotionSeries';
import { RankBadge } from '@/components/rank/RankBadge';
import { RankProgressBar } from '@/components/rank/RankProgressBar';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, AlertTriangle, TrendingUp, Trophy } from 'lucide-react';

interface DivisionProgressProps {
  user?: unknown; // legacy prop, ignored
}

export function DivisionProgress(_props: DivisionProgressProps) {
  const { rank, isLoading } = useRankState();
  const { data: decay } = useDecayWarning();
  const { series } = usePromotionSeries();

  if (isLoading) {
    return (
      <div className="arena-card rounded-xl overflow-hidden p-4">
        <Skeleton className="h-6 w-40 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  if (!rank) {
    return (
      <div className="arena-card rounded-xl overflow-hidden p-6 text-center">
        <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="font-display font-bold text-sm uppercase">Unranked</p>
        <p className="text-xs text-muted-foreground mt-1">
          Play your first ranked match to enter the ladder.
        </p>
      </div>
    );
  }

  const inPlacements = rank.placements_remaining > 0;

  return (
    <div className="arena-card rounded-xl overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Shield className="h-6 w-6 text-primary" />
            <div className="min-w-0">
              <h3 className="font-display font-bold text-lg uppercase">
                {rank.tier} {rank.division}
              </h3>
              <p className="text-xs text-muted-foreground">MMR: {rank.mmr}</p>
            </div>
          </div>
          <RankBadge tier={rank.tier} division={rank.division} lp={rank.lp} size="md" />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {inPlacements ? (
          <div className="flex items-center gap-2 p-2 rounded bg-primary/10 border border-primary/30">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-sm">
              <span className="font-display font-bold">{rank.placements_remaining}</span>{' '}
              placement match{rank.placements_remaining === 1 ? '' : 'es'} remaining
            </p>
          </div>
        ) : series ? (
          <div className="flex items-center gap-2 p-2 rounded bg-status-success/10 border border-status-success/30">
            <TrendingUp className="h-4 w-4 text-status-success" />
            <p className="text-sm text-status-success">
              Promotion series: {series.wins}W / {series.losses}L —{' '}
              first to {series.wins_required}
            </p>
          </div>
        ) : (
          <RankProgressBar
            tier={rank.tier}
            lp={rank.lp}
            demotionShield={rank.demotion_shield}
            decayActive={decay?.active}
          />
        )}

        {decay?.active && (
          <div className="flex items-center gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <p className="text-xs text-amber-300">
              Decay in <span className="font-display font-bold">{decay.daysUntilDecay}d</span> · −
              {decay.weeklyLoss} LP / week
            </p>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded bg-secondary/30">
          <p className="font-display font-bold text-lg text-primary">{rank.games_played}</p>
          <p className="text-xs text-muted-foreground">Games</p>
        </div>
        <div className="text-center p-2 rounded bg-secondary/30">
          <p className="font-display font-bold text-lg text-status-warning">{rank.win_streak}</p>
          <p className="text-xs text-muted-foreground">Win Streak</p>
        </div>
        <div className="text-center p-2 rounded bg-secondary/30">
          <p className="font-display font-bold text-lg text-accent">
            {rank.peak_lp ?? rank.lp}
          </p>
          <p className="text-xs text-muted-foreground">Peak LP</p>
        </div>
      </div>
    </div>
  );
}
