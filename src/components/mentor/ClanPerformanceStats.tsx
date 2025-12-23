import { 
  TrendingUp, 
  TrendingDown,
  Trophy,
  Target,
  Flame,
  Swords
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClanBattleStats } from '@/hooks/useClanBattleStats';
import { Skeleton } from '@/components/ui/skeleton';

interface ClanPerformanceStatsProps {
  clanId: string;
}

export function ClanPerformanceStats({ clanId }: ClanPerformanceStatsProps) {
  const { data: stats, isLoading } = useClanBattleStats(clanId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!stats || stats.totalBattles === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No battle data yet. Start battling other clans!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Swords className="h-3 w-3" />
              Total Battles
            </CardDescription>
            <CardTitle className="text-3xl font-display">{stats.totalBattles}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 text-xs">
              <span className="text-status-success">{stats.wins}W</span>
              <span className="text-destructive">{stats.losses}L</span>
              <span className="text-status-warning">{stats.ties}D</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Win Rate
            </CardDescription>
            <CardTitle className={`text-3xl font-display ${
              stats.winRate >= 50 ? 'text-status-success' : 'text-destructive'
            }`}>
              {stats.winRate}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.wins} victories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Net XP
            </CardDescription>
            <CardTitle className={`text-3xl font-display ${
              stats.netXp >= 0 ? 'text-status-success' : 'text-destructive'
            }`}>
              {stats.netXp >= 0 ? '+' : ''}{stats.netXp.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 text-xs">
              <span className="text-status-success">+{stats.totalXpGained}</span>
              <span className="text-destructive">-{stats.totalXpLost}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Flame className="h-3 w-3" />
              Best Streak
            </CardDescription>
            <CardTitle className="text-3xl font-display text-status-warning">
              {stats.bestStreak}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Consecutive wins
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Form */}
      {stats.recentForm.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recent Form (Last 5 Battles)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {stats.recentForm.map((result, index) => (
                <Badge 
                  key={index}
                  className={`w-10 h-10 flex items-center justify-center text-lg font-bold ${
                    result === 'W' 
                      ? 'bg-status-success/20 text-status-success border-status-success/50' 
                      : result === 'L'
                      ? 'bg-destructive/20 text-destructive border-destructive/50'
                      : 'bg-status-warning/20 text-status-warning border-status-warning/50'
                  }`}
                >
                  {result}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Average Score
            </CardDescription>
            <CardTitle className="text-2xl font-display text-primary">
              {stats.avgScore} pts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Per battle average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Battle Record</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 bg-secondary rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-status-success transition-all"
                    style={{ width: `${(stats.wins / stats.totalBattles) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-status-warning transition-all"
                    style={{ width: `${(stats.ties / stats.totalBattles) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-destructive transition-all"
                    style={{ width: `${(stats.losses / stats.totalBattles) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Wins: {stats.wins}</span>
              <span>Draws: {stats.ties}</span>
              <span>Losses: {stats.losses}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
