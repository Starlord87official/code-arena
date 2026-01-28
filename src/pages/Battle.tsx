import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Swords, Users, Zap, Clock, Trophy, Search, 
  ChevronRight, Shield, Flame, Target, Crown, Loader2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useBattleData } from '@/hooks/useBattleData';
import { useMatchmaking, BattleMode } from '@/hooks/useMatchmaking';
import { useAuth } from '@/contexts/AuthContext';

// Division color helper - kept for UI consistency
const getDivisionColor = (division: string): string => {
  const colors: Record<string, string> = {
    bronze: 'text-amber-600',
    silver: 'text-gray-400',
    gold: 'text-yellow-500',
    platinum: 'text-cyan-400',
    diamond: 'text-blue-400',
    master: 'text-purple-500',
    grandmaster: 'text-red-500',
  };
  return colors[division?.toLowerCase()] || 'text-muted-foreground';
};

const getDivisionAura = (division: string): string => {
  const auras: Record<string, string> = {
    bronze: 'ring-1 ring-amber-600/20',
    silver: 'ring-1 ring-gray-400/20',
    gold: 'ring-1 ring-yellow-500/30',
    platinum: 'ring-2 ring-cyan-400/30',
    diamond: 'ring-2 ring-blue-400/40',
    master: 'ring-2 ring-purple-500/50',
    grandmaster: 'ring-4 ring-red-500/50',
  };
  return auras[division?.toLowerCase()] || '';
};

export default function Battle() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<BattleMode>('quick');
  
  const {
    onlineWarriors,
    isLoadingOnline,
    pendingChallenges,
    isLoadingPending,
    recentBattles,
    isLoadingRecent,
  } = useBattleData();

  const {
    matchmakingState,
    findOpponent,
    cancelSearch,
    isSearching,
    isMatched,
    isFindingOpponent,
    battleStats,
    isLoadingStats,
    activeSession,
  } = useMatchmaking();

  // Redirect to battle when matched
  useEffect(() => {
    if (isMatched && matchmakingState.sessionId) {
      // Navigate to the active battle session
      navigate(`/battle/session/${matchmakingState.sessionId}`);
    }
  }, [isMatched, matchmakingState.sessionId, navigate]);

  // Filter online warriors by search
  const filteredWarriors = onlineWarriors.filter(w => 
    w.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFindOpponent = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    findOpponent(selectedMode);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <Swords className="h-10 w-10 text-destructive" />
            <h1 className="font-display text-4xl font-bold text-foreground">
              DUO <span className="text-destructive">BATTLE</span>
            </h1>
            <Swords className="h-10 w-10 text-destructive transform scale-x-[-1]" />
          </div>
          <p className="text-muted-foreground">
            Challenge opponents. Prove your superiority. Only one survives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Battle Modes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Battle Mode Selection */}
            <div className="arena-card p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">Select Battle Mode</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setSelectedMode('quick')}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedMode === 'quick' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Zap className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-display font-bold text-foreground mb-1">Quick Match</h3>
                  <p className="text-sm text-muted-foreground">Random opponent, 15 min battle</p>
                  <Badge className="mt-3 bg-primary/20 text-primary border-primary/30">+50 XP</Badge>
                </button>

                <button
                  onClick={() => setSelectedMode('ranked')}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedMode === 'ranked' 
                      ? 'border-destructive bg-destructive/10' 
                      : 'border-border hover:border-destructive/50'
                  }`}
                >
                  <Trophy className="h-8 w-8 text-destructive mb-3" />
                  <h3 className="font-display font-bold text-foreground mb-1">Ranked Battle</h3>
                  <p className="text-sm text-muted-foreground">ELO-based matching, 30 min</p>
                  <Badge className="mt-3 bg-destructive/20 text-destructive border-destructive/30">+100 XP</Badge>
                </button>

                <button
                  onClick={() => setSelectedMode('custom')}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedMode === 'custom' 
                      ? 'border-status-success bg-status-success/10' 
                      : 'border-border hover:border-status-success/50'
                  }`}
                >
                  <Target className="h-8 w-8 text-status-success mb-3" />
                  <h3 className="font-display font-bold text-foreground mb-1">Custom Duel</h3>
                  <p className="text-sm text-muted-foreground">Choose opponent & rules</p>
                  <Badge className="mt-3 bg-status-success/20 text-status-success border-status-success/30">Flexible</Badge>
                </button>
              </div>

              <div className="mt-6">
                {isSearching ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/30">
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      <div className="text-center">
                        <p className="font-medium text-foreground">Searching for opponent...</p>
                        <p className="text-sm text-muted-foreground">
                          {matchmakingState.waitTime !== undefined 
                            ? `${Math.floor(matchmakingState.waitTime)}s elapsed`
                            : 'Please wait...'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full"
                      onClick={cancelSearch}
                    >
                      <X className="h-5 w-5 mr-2" />
                      Cancel Search
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="arena" 
                    size="lg" 
                    className="w-full"
                    onClick={handleFindOpponent}
                    disabled={isFindingOpponent}
                  >
                    {isFindingOpponent ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Swords className="h-5 w-5 mr-2" />
                    )}
                    {isFindingOpponent ? 'Connecting...' : 'Find Opponent'}
                  </Button>
                )}
              </div>
            </div>

            {/* Online Opponents */}
            <div className="arena-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-foreground">Online Warriors</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search player..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-background"
                  />
                </div>
              </div>

              {isLoadingOnline ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-background rounded-lg">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredWarriors.length > 0 ? (
                <div className="space-y-3">
                  {filteredWarriors.map((warrior) => (
                    <div 
                      key={warrior.id}
                      className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-primary/5 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className={`h-12 w-12 border-2 ${getDivisionColor(warrior.division).replace('text-', 'border-')}`}>
                            <AvatarFallback className="bg-muted text-foreground font-bold">
                              {warrior.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-status-success rounded-full border-2 border-background" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{warrior.username}</span>
                            <Badge className={`${getDivisionColor(warrior.division)} border border-current/30 bg-current/10 uppercase text-xs`}>
                              {warrior.division}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>XP: {warrior.xp}</span>
                            <span>•</span>
                            <span>Streak: {warrior.streak}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="arenaOutline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Swords className="h-4 w-4 mr-2" />
                        Challenge
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No warriors online right now</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Check back soon or invite friends to battle!</p>
                </div>
              )}
            </div>

            {/* Recent Duels */}
            <div className="arena-card p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">Recent Battles</h2>
              
              {isLoadingRecent ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-background rounded-lg">
                      <Skeleton className="h-6 w-6" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentBattles.length > 0 ? (
                <div className="space-y-3">
                  {recentBattles.map((battle) => (
                    <div 
                      key={battle.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        battle.result === 'win' 
                          ? 'bg-status-success/10 border border-status-success/30' 
                          : battle.result === 'loss'
                          ? 'bg-destructive/10 border border-destructive/30'
                          : 'bg-muted/30 border border-border'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {battle.result === 'win' ? (
                          <Crown className="h-6 w-6 text-status-success" />
                        ) : battle.result === 'loss' ? (
                          <Shield className="h-6 w-6 text-destructive" />
                        ) : (
                          <Shield className="h-6 w-6 text-muted-foreground" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">vs {battle.opponent.name}</span>
                            <Badge className={
                              battle.result === 'win' 
                                ? 'bg-status-success/20 text-status-success' 
                                : battle.result === 'loss'
                                ? 'bg-destructive/20 text-destructive'
                                : 'bg-muted text-muted-foreground'
                            }>
                              {battle.result.toUpperCase()}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">{battle.date}</span>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        battle.xpChange > 0 
                          ? 'text-status-success' 
                          : battle.xpChange < 0 
                          ? 'text-destructive' 
                          : 'text-muted-foreground'
                      }`}>
                        {battle.xpChange > 0 ? '+' : ''}{battle.xpChange} XP
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Swords className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No battles yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Start your first battle to see your history!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Pending */}
          <div className="space-y-6">
            {/* Your Battle Stats */}
            <div className={`arena-card p-6 ${getDivisionAura('bronze')}`}>
              <h2 className="font-display text-lg font-bold text-foreground mb-4">Your Battle Stats</h2>
              
              {isLoadingStats ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Battle ELO</span>
                    <span className="font-bold text-primary text-xl">{battleStats.elo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Win Rate</span>
                    <span className="font-bold text-status-success">
                      {battleStats.total_duels > 0 ? `${battleStats.win_rate}%` : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Duels</span>
                    <span className="font-bold text-foreground">{battleStats.total_duels}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Win Streak</span>
                    <span className="font-bold text-status-warning flex items-center gap-1">
                      {battleStats.win_streak > 0 ? (
                        <>
                          <Flame className="h-4 w-4" />
                          {battleStats.win_streak}
                        </>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Next Rank</span>
                      <span className="text-primary">
                        {battleStats.elo_to_next > 0 
                          ? `${battleStats.next_rank} (+${battleStats.elo_to_next} ELO)`
                          : battleStats.next_rank
                        }
                      </span>
                    </div>
                    <Progress value={battleStats.rank_progress} className="h-2" />
                  </div>
                </div>
              )}
            </div>

            {/* Pending Challenges - Only show if there are pending challenges */}
            {isLoadingPending ? (
              <div className="arena-card p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4">
                  Pending Challenges
                </h2>
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            ) : pendingChallenges.length > 0 ? (
              <div className="arena-card p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  Pending Challenges
                  <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingChallenges.length}
                  </span>
                </h2>
                
                <div className="space-y-3">
                  {pendingChallenges.map((challenge) => (
                    <div key={challenge.id} className="p-4 bg-background rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-muted text-foreground font-bold">
                            {challenge.opponent.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-foreground">{challenge.opponent.username}</span>
                          <p className="text-xs text-muted-foreground">{challenge.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="arena" size="sm" className="flex-1">Accept</Button>
                        <Button variant="outline" size="sm" className="flex-1">Decline</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="arena-card p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4">
                  Pending Challenges
                </h2>
                <p className="text-muted-foreground text-sm text-center py-4">No pending challenges</p>
              </div>
            )}

            {/* Quick Tips */}
            <div className="arena-card p-6 border-status-warning/30 bg-status-warning/5">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Flame className="h-4 w-4 text-status-warning" />
                Battle Tips
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Win streaks grant bonus XP</li>
                <li>• Ranked battles affect your ELO</li>
                <li>• Higher division opponents = more XP</li>
                <li>• Practice in Quick Match first</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
