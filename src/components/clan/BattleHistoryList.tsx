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
  Minus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BattleHistory, getClanStats } from '@/lib/clanLeagueData';
import { format } from 'date-fns';

interface BattleHistoryListProps {
  clanId: string;
  battles: BattleHistory[];
}

export function BattleHistoryList({ clanId, battles }: BattleHistoryListProps) {
  const [selectedBattle, setSelectedBattle] = useState<BattleHistory | null>(null);
  const stats = getClanStats(clanId);

  const getResultColor = (result: BattleHistory['result']) => {
    switch (result) {
      case 'win': return 'text-status-success bg-status-success/20 border-status-success/50';
      case 'loss': return 'text-destructive bg-destructive/20 border-destructive/50';
      case 'draw': return 'text-status-warning bg-status-warning/20 border-status-warning/50';
    }
  };

  const getResultIcon = (result: BattleHistory['result']) => {
    switch (result) {
      case 'win': return <Trophy className="h-4 w-4" />;
      case 'loss': return <TrendingDown className="h-4 w-4" />;
      case 'draw': return <Minus className="h-4 w-4" />;
    }
  };

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
        
        {battles.length === 0 ? (
          <div className="arena-card p-8 text-center">
            <p className="text-muted-foreground">No battles yet. Challenge other clans!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {battles.map((battle) => (
              <div
                key={battle.id}
                className="arena-card p-4 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedBattle(selectedBattle?.id === battle.id ? null : battle)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge className={`${getResultColor(battle.result)} border font-bold uppercase`}>
                      {getResultIcon(battle.result)}
                      <span className="ml-1">{battle.result}</span>
                    </Badge>
                    <div>
                      <p className="font-heading font-bold">vs {battle.opponentClanName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(battle.date, 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="font-display font-bold text-primary">{battle.yourScore}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="font-display font-bold text-muted-foreground">{battle.opponentScore}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                    <div className={`text-right ${battle.xpChange >= 0 ? 'text-status-success' : 'text-destructive'}`}>
                      <div className="flex items-center gap-1 justify-end font-bold">
                        {battle.xpChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {battle.xpChange >= 0 ? '+' : ''}{battle.xpChange}
                      </div>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                    <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${
                      selectedBattle?.id === battle.id ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedBattle?.id === battle.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ELO Change</p>
                        <div className={`font-display font-bold ${battle.eloChange >= 0 ? 'text-status-success' : 'text-destructive'}`}>
                          {battle.eloChange >= 0 ? '+' : ''}{battle.eloChange}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Problems</p>
                        <div className="font-display font-bold text-primary">
                          {battle.problemsSolved}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">MVP</p>
                        <div className="flex items-center justify-center gap-1">
                          <Crown className="h-4 w-4 text-status-warning" />
                          <span className="font-bold">{battle.mvpUsername}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">MVP XP</p>
                        <div className="font-display font-bold text-status-warning">
                          +{battle.mvpXpGained}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
