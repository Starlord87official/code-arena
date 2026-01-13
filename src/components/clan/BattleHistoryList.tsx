import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Crown,
  Target,
  ChevronRight,
  Minus,
  Swords,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClanBattleHistory } from '@/hooks/useBattleHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface BattleHistoryListProps {
  clanId: string;
}

export function BattleHistoryList({ clanId }: BattleHistoryListProps) {
  const { data: battles, isLoading } = useClanBattleHistory(clanId);
  const [selectedBattleId, setSelectedBattleId] = useState<string | null>(null);

  const getResultColor = (winner: string | null, isClanA: boolean) => {
    const won = (isClanA && winner === 'A') || (!isClanA && winner === 'B');
    const lost = (isClanA && winner === 'B') || (!isClanA && winner === 'A');
    
    if (won) return 'text-status-success bg-status-success/20 border-status-success/50';
    if (lost) return 'text-destructive bg-destructive/20 border-destructive/50';
    return 'text-status-warning bg-status-warning/20 border-status-warning/50';
  };

  const getResultIcon = (winner: string | null, isClanA: boolean) => {
    const won = (isClanA && winner === 'A') || (!isClanA && winner === 'B');
    const lost = (isClanA && winner === 'B') || (!isClanA && winner === 'A');
    
    if (won) return <Trophy className="h-4 w-4" />;
    if (lost) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getResultLabel = (winner: string | null, isClanA: boolean) => {
    const won = (isClanA && winner === 'A') || (!isClanA && winner === 'B');
    const lost = (isClanA && winner === 'B') || (!isClanA && winner === 'A');
    
    if (won) return 'Win';
    if (lost) return 'Loss';
    return 'Draw';
  };

  // Calculate stats from real data
  const stats = {
    wins: battles?.filter(b => (b.clan_a_id === clanId && b.winner === 'A') || (b.clan_b_id === clanId && b.winner === 'B')).length || 0,
    losses: battles?.filter(b => (b.clan_a_id === clanId && b.winner === 'B') || (b.clan_b_id === clanId && b.winner === 'A')).length || 0,
    draws: battles?.filter(b => b.winner === 'tie' || b.winner === null).length || 0,
    winRate: 0
  };
  
  const totalBattles = (battles?.length || 0);
  stats.winRate = totalBattles > 0 ? Math.round((stats.wins / totalBattles) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Battle Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="arena-card p-4 text-center">
          <div className="font-display text-3xl font-bold text-status-success">{stats.wins}</div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Wins</p>
        </div>
        <div className="arena-card p-4 text-center">
          <div className="font-display text-3xl font-bold text-destructive">{stats.losses}</div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Losses</p>
        </div>
        <div className="arena-card p-4 text-center">
          <div className="font-display text-3xl font-bold text-status-warning">{stats.draws}</div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Draws</p>
        </div>
        <div className="arena-card p-4 text-center">
          <div className="font-display text-3xl font-bold text-primary">{stats.winRate}%</div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate</p>
        </div>
      </div>

      {/* Battle List */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Battle History
        </h3>
        
        {!battles || battles.length === 0 ? (
          <div className="arena-card p-8 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-2xl rounded-full" />
              <div className="relative inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/30">
              NO BATTLES YET
            </Badge>
            
            <h4 className="font-display font-bold text-lg mb-2">
              Ready for Your First Battle?
            </h4>
            
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Challenge other clans to prove your worth. Your battle history will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {battles.map((battle) => {
              const isClanA = battle.clan_a_id === clanId;
              const opponentName = isClanA ? battle.clan_b_name : battle.clan_a_name;
              const ourScore = isClanA ? battle.clan_a_score : battle.clan_b_score;
              const theirScore = isClanA ? battle.clan_b_score : battle.clan_a_score;
              
              return (
                <div
                  key={battle.id}
                  className="arena-card p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedBattleId(selectedBattleId === battle.id ? null : battle.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge className={`${getResultColor(battle.winner, isClanA)} border font-bold uppercase`}>
                        {getResultIcon(battle.winner, isClanA)}
                        <span className="ml-1">{getResultLabel(battle.winner, isClanA)}</span>
                      </Badge>
                      <div>
                        <p className="font-heading font-bold">vs {opponentName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(battle.ended_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="font-display font-bold text-primary">{ourScore}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="font-display font-bold text-muted-foreground">{theirScore}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                      <div className={`text-right ${battle.xp_change >= 0 ? 'text-status-success' : 'text-destructive'}`}>
                        <div className="flex items-center gap-1 justify-end font-bold">
                          {battle.xp_change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {battle.xp_change >= 0 ? '+' : ''}{battle.xp_change}
                        </div>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${
                        selectedBattleId === battle.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedBattleId === battle.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4 animate-fade-in">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ELO Change</p>
                          <div className={`font-display font-bold ${battle.elo_change >= 0 ? 'text-status-success' : 'text-destructive'}`}>
                            {battle.elo_change >= 0 ? '+' : ''}{battle.elo_change}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Problems</p>
                          <div className="font-display font-bold text-primary">
                            {isClanA ? battle.problems_solved_a : battle.problems_solved_b}
                          </div>
                        </div>
                        {battle.mvp_username && (
                          <>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">MVP</p>
                              <div className="flex items-center justify-center gap-1">
                                <Crown className="h-4 w-4 text-status-warning" />
                                <span className="font-bold">{battle.mvp_username}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">MVP XP</p>
                              <div className="font-display font-bold text-status-warning">
                                +{battle.mvp_xp || 0}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
