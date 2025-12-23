import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Crown,
  Target,
  ChevronRight,
  Minus,
  Filter,
  Swords,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllBattleHistory, useBattleById, BattleHistoryRecord } from '@/hooks/useBattleHistory';
import { format, formatDistanceToNow } from 'date-fns';

type FilterType = 'all' | 'wins' | 'losses' | 'ties';

function BattleDetailView({ battleId, onBack }: { battleId: string; onBack: () => void }) {
  const { data: battle, isLoading } = useBattleById(battleId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="arena-card p-8 text-center">
        <p className="text-muted-foreground">Battle not found</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to History
        </Button>
      </div>
    );
  }

  const clanAWon = battle.winner === 'A';
  const clanBWon = battle.winner === 'B';
  const isTie = battle.winner === 'tie';

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to History
      </Button>

      {/* Battle Header */}
      <div className="arena-card p-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Swords className="h-6 w-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">Battle Replay</h2>
        </div>
        
        <div className="flex items-center justify-between">
          {/* Clan A */}
          <div className={`flex-1 text-center ${clanAWon ? 'opacity-100' : 'opacity-60'}`}>
            <div className="relative inline-block">
              {clanAWon && (
                <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 h-8 w-8 text-status-warning animate-bounce-slow" />
              )}
              <div className="arena-card p-4 inline-block">
                <h3 className="font-heading font-bold text-lg">{battle.clan_a_name}</h3>
                <div className="font-display text-4xl font-bold text-primary mt-2">
                  {battle.clan_a_score}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {battle.problems_solved_a} problems solved
                </p>
              </div>
            </div>
            {clanAWon && (
              <Badge className="mt-2 bg-status-success/20 text-status-success border-status-success/50">
                Winner
              </Badge>
            )}
          </div>

          {/* VS */}
          <div className="px-6">
            <div className="font-display text-3xl font-bold text-muted-foreground">VS</div>
          </div>

          {/* Clan B */}
          <div className={`flex-1 text-center ${clanBWon ? 'opacity-100' : 'opacity-60'}`}>
            <div className="relative inline-block">
              {clanBWon && (
                <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 h-8 w-8 text-status-warning animate-bounce-slow" />
              )}
              <div className="arena-card p-4 inline-block">
                <h3 className="font-heading font-bold text-lg">{battle.clan_b_name}</h3>
                <div className="font-display text-4xl font-bold text-primary mt-2">
                  {battle.clan_b_score}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {battle.problems_solved_b} problems solved
                </p>
              </div>
            </div>
            {clanBWon && (
              <Badge className="mt-2 bg-status-success/20 text-status-success border-status-success/50">
                Winner
              </Badge>
            )}
          </div>
        </div>

        {isTie && (
          <div className="text-center mt-4">
            <Badge className="bg-status-warning/20 text-status-warning border-status-warning/50 text-lg px-4 py-1">
              Draw
            </Badge>
          </div>
        )}
      </div>

      {/* Battle Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="arena-card p-4 text-center">
          <Target className="h-5 w-5 text-primary mx-auto mb-2" />
          <div className="font-display text-2xl font-bold">{battle.total_problems}</div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Problems</p>
        </div>
        <div className="arena-card p-4 text-center">
          <TrendingUp className="h-5 w-5 text-status-success mx-auto mb-2" />
          <div className="font-display text-2xl font-bold text-status-success">+{battle.xp_change}</div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">XP Change</p>
        </div>
        <div className="arena-card p-4 text-center">
          <Trophy className="h-5 w-5 text-primary mx-auto mb-2" />
          <div className={`font-display text-2xl font-bold ${battle.elo_change >= 0 ? 'text-status-success' : 'text-destructive'}`}>
            {battle.elo_change >= 0 ? '+' : ''}{battle.elo_change}
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">ELO Change</p>
        </div>
        <div className="arena-card p-4 text-center">
          <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
          <div className="font-display text-lg font-bold">
            {format(new Date(battle.started_at), 'h:mm a')}
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {format(new Date(battle.started_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* MVP Section */}
      {battle.mvp_username && (
        <div className="arena-card p-6 bg-gradient-to-r from-status-warning/10 to-transparent border-status-warning/30">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-status-warning/20">
              <Crown className="h-8 w-8 text-status-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Most Valuable Player</p>
              <h3 className="font-heading font-bold text-xl">{battle.mvp_username}</h3>
              <p className="text-status-warning font-bold">+{battle.mvp_xp} XP earned</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BattleHistoryList({ 
  battles, 
  filter, 
  onSelectBattle 
}: { 
  battles: BattleHistoryRecord[]; 
  filter: FilterType;
  onSelectBattle: (id: string) => void;
}) {
  const filteredBattles = useMemo(() => {
    return battles.filter(battle => {
      if (filter === 'all') return true;
      if (filter === 'wins') return battle.winner === 'A'; // Assuming user's clan is always A for now
      if (filter === 'losses') return battle.winner === 'B';
      if (filter === 'ties') return battle.winner === 'tie' || battle.winner === null;
      return true;
    });
  }, [battles, filter]);

  const getResultBadge = (winner: string | null) => {
    if (winner === 'A') {
      return (
        <Badge className="bg-status-success/20 text-status-success border-status-success/50 font-bold uppercase">
          <Trophy className="h-3 w-3 mr-1" />
          Win
        </Badge>
      );
    }
    if (winner === 'B') {
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/50 font-bold uppercase">
          <TrendingDown className="h-3 w-3 mr-1" />
          Loss
        </Badge>
      );
    }
    return (
      <Badge className="bg-status-warning/20 text-status-warning border-status-warning/50 font-bold uppercase">
        <Minus className="h-3 w-3 mr-1" />
        Draw
      </Badge>
    );
  };

  if (filteredBattles.length === 0) {
    return (
      <div className="arena-card p-8 text-center">
        <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">
          {filter === 'all' ? 'No battles recorded yet.' : `No ${filter} found.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredBattles.map((battle) => (
        <div
          key={battle.id}
          className="arena-card p-4 hover:border-primary/50 transition-all cursor-pointer group"
          onClick={() => onSelectBattle(battle.battle_id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getResultBadge(battle.winner)}
              <div>
                <p className="font-heading font-bold group-hover:text-primary transition-colors">
                  {battle.clan_a_name} vs {battle.clan_b_name}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(battle.ended_at), { addSuffix: true })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="font-display font-bold text-primary">{battle.clan_a_score}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="font-display font-bold text-muted-foreground">{battle.clan_b_score}</span>
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
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BattleHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedBattleId = searchParams.get('battle');
  const [filter, setFilter] = useState<FilterType>('all');
  
  const { data: battles, isLoading, error } = useAllBattleHistory();

  const handleSelectBattle = (battleId: string) => {
    setSearchParams({ battle: battleId });
  };

  const handleBack = () => {
    setSearchParams({});
  };

  // Stats calculation
  const stats = useMemo(() => {
    if (!battles) return { wins: 0, losses: 0, ties: 0, winRate: 0 };
    const wins = battles.filter(b => b.winner === 'A').length;
    const losses = battles.filter(b => b.winner === 'B').length;
    const ties = battles.filter(b => b.winner === 'tie' || b.winner === null).length;
    const total = battles.length;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    return { wins, losses, ties, winRate };
  }, [battles]);

  if (selectedBattleId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <BattleDetailView battleId={selectedBattleId} onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Swords className="h-8 w-8 text-primary" />
          <h1 className="font-display text-3xl font-bold">Battle History</h1>
        </div>
        <p className="text-muted-foreground">Review past clan battles and relive your victories</p>
      </div>

      {/* Stats Summary */}
      {!isLoading && battles && battles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="arena-card p-4 text-center">
            <div className="font-display text-3xl font-bold text-status-success">{stats.wins}</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Victories</p>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="font-display text-3xl font-bold text-destructive">{stats.losses}</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Defeats</p>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="font-display text-3xl font-bold text-status-warning">{stats.ties}</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Draws</p>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="font-display text-3xl font-bold text-primary">{stats.winRate}%</div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="all" className="gap-1">
              <Filter className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="wins" className="gap-1">
              <Trophy className="h-4 w-4" />
              Wins
            </TabsTrigger>
            <TabsTrigger value="losses" className="gap-1">
              <TrendingDown className="h-4 w-4" />
              Losses
            </TabsTrigger>
            <TabsTrigger value="ties" className="gap-1">
              <Minus className="h-4 w-4" />
              Draws
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="arena-card p-8 text-center border-destructive/50">
          <p className="text-destructive">Failed to load battle history</p>
        </div>
      )}

      {/* Battle List */}
      {!isLoading && battles && (
        <BattleHistoryList 
          battles={battles} 
          filter={filter} 
          onSelectBattle={handleSelectBattle} 
        />
      )}
    </div>
  );
}
