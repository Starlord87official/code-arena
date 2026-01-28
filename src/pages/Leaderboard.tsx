import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Crown, Medal, TrendingUp, TrendingDown, Zap, Flame, ChevronUp, ChevronDown, AlertTriangle, Target, Swords, ShieldAlert, ChevronsUp, Users, Sparkles, Shield, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDivisionColor, getDivisionAura } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboard, LeaderboardUser, Division } from '@/hooks/useLeaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { UsernameLink } from '@/components/social/UsernameLink';
import { TopThreePodium } from '@/components/leaderboard/TopThreePodium';

const divisions = ['all', 'legend', 'master', 'diamond', 'platinum', 'gold', 'silver', 'bronze'] as const;

// Zone styling helpers
const getZoneStyles = (zone: 'promotion' | 'neutral' | 'demotion', isCurrentUser: boolean) => {
  if (isCurrentUser) {
    return 'border-primary/50 bg-primary/5';
  }
  switch (zone) {
    case 'promotion':
      return 'border-status-success/30 bg-status-success/5';
    case 'demotion':
      return 'border-destructive/30 bg-destructive/5';
    default:
      return 'border-border/50 bg-card/50';
  }
};

const getZoneIndicator = (zone: 'promotion' | 'neutral' | 'demotion') => {
  switch (zone) {
    case 'promotion':
      return <TrendingUp className="h-4 w-4 text-status-success" />;
    case 'demotion':
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    default:
      return null;
  }
};

// Rank badge for top 3
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <div className="relative">
        <Crown className="h-8 w-8 text-rank-gold drop-shadow-[0_0_12px_hsl(var(--rank-gold))]" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-rank-gold rounded-full flex items-center justify-center text-[10px] font-bold text-background">
          1
        </div>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="relative">
        <Medal className="h-7 w-7 text-rank-silver drop-shadow-[0_0_10px_hsl(var(--rank-silver))]" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-rank-silver rounded-full flex items-center justify-center text-[10px] font-bold text-background">
          2
        </div>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="relative">
        <Medal className="h-6 w-6 text-rank-bronze drop-shadow-[0_0_8px_hsl(var(--rank-bronze))]" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-rank-bronze rounded-full flex items-center justify-center text-[10px] font-bold text-background">
          3
        </div>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground">
      {rank}
    </div>
  );
};

// Champion Card Component
const ChampionCard = ({ champion }: { champion: LeaderboardUser }) => {
  return (
    <div className="relative mb-8 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-rank-gold/20 via-rank-gold/10 to-rank-gold/20 animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rank-gold/20 via-transparent to-transparent" />
      
      <div className="relative arena-card p-6 border-rank-gold/50">
        <div className="flex items-center justify-between">
          {/* Left - Champion Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`absolute -inset-2 rounded-full ${getDivisionAura(champion.division)} opacity-75`} />
              <Avatar className="h-20 w-20 border-4 border-rank-gold relative">
                <AvatarImage src={champion.avatar_url || undefined} />
                <AvatarFallback className="text-xl font-bold bg-rank-gold/20 text-rank-gold">
                  {champion.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Crown className="absolute -top-3 -right-2 h-8 w-8 text-rank-gold drop-shadow-[0_0_15px_hsl(var(--rank-gold))]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-rank-gold/20 text-rank-gold border-rank-gold/50 text-xs">
                  REIGNING CHAMPION
                </Badge>
              </div>
              <h2 className="font-display text-2xl font-bold">
                <UsernameLink username={champion.username} className="text-foreground hover:text-primary" />
              </h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <Badge variant="outline" className={`${getDivisionColor(champion.division)} border-current capitalize`}>
                  {champion.division}
                </Badge>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-primary" />
                  {champion.xp.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>
          
          {/* Right - Stats */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-rank-gold">{champion.level}</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-status-success flex items-center justify-center gap-1">
                <Flame className="h-5 w-5" />
                {champion.streak}
              </p>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{champion.solvedChallenges}</p>
              <p className="text-xs text-muted-foreground">Solved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Leaderboard Row Component
const LeaderboardRow = ({ user, showZone }: { user: LeaderboardUser; showZone: boolean }) => {
  return (
    <div className={`arena-card p-4 border ${getZoneStyles(user.zone, user.isCurrentUser)} transition-all hover:scale-[1.01]`}>
      <div className="flex items-center gap-4">
        {/* Rank */}
        <RankBadge rank={user.rank} />
        
        {/* Zone indicator */}
        {showZone && (
          <div className="w-6 flex justify-center">
            {getZoneIndicator(user.zone)}
          </div>
        )}
        
        {/* Avatar & Name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <div className={`absolute -inset-1 rounded-full ${getDivisionAura(user.division)} opacity-50`} />
            <Avatar className="h-10 w-10 border-2 border-current relative" style={{ borderColor: `hsl(var(--rank-${user.division}))` }}>
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className={`${getDivisionColor(user.division)} bg-current/10 font-bold text-sm`}>
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0">
            <p className={`font-semibold truncate ${user.isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
              <UsernameLink username={user.username} className={user.isCurrentUser ? 'text-primary hover:text-primary/80' : ''} />
              {user.isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className={`${getDivisionColor(user.division)} border-current capitalize text-[10px] py-0`}>
                {user.division}
              </Badge>
              <span className="text-muted-foreground">Lv.{user.level}</span>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <div className="text-center min-w-[60px]">
            <p className="font-bold text-foreground flex items-center justify-center gap-1">
              <Flame className="h-3 w-3 text-status-warning" />
              {user.streak}
            </p>
            <p className="text-[10px] text-muted-foreground">Streak</p>
          </div>
          <div className="text-center min-w-[60px]">
            <p className="font-bold text-foreground">{user.solvedChallenges}</p>
            <p className="text-[10px] text-muted-foreground">Solved</p>
          </div>
        </div>
        
        {/* XP */}
        <div className="text-right min-w-[80px]">
          <p className="font-bold text-primary flex items-center justify-end gap-1">
            <Zap className="h-4 w-4" />
            {user.xp.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">XP</p>
        </div>
      </div>
    </div>
  );
};

// Empty State for Private Beta
const PrivateBetaEmptyState = ({ profile }: { profile: any }) => {
  return (
    <div className="arena-card p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl rounded-full" />
          <div className="relative inline-flex items-center justify-center p-6 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
        </div>
        
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
          PRIVATE BETA
        </Badge>
        
        <h2 className="font-display text-2xl font-bold mb-3">
          You're Among the First
        </h2>
        
        <p className="text-muted-foreground mb-6">
          The arena is just opening. As more warriors join and complete challenges, 
          the leaderboard will come alive with fierce competition.
        </p>

        {profile && (
          <div className="arena-card p-4 bg-primary/5 border-primary/20 mb-6">
            <div className="flex items-center justify-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                  {profile.username?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold">{profile.username || 'Warrior'}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {profile.xp || 0} XP
                </p>
              </div>
              <Badge className="ml-auto bg-rank-gold/20 text-rank-gold border-rank-gold/50">
                Early Adopter
              </Badge>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/challenges">
            <Button variant="arena">
              <Target className="h-4 w-4 mr-2" />
              Start Solving Challenges
            </Button>
          </Link>
          <Link to="/roadmap">
            <Button variant="outline">
              <Trophy className="h-4 w-4 mr-2" />
              Follow Your Roadmap
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Division Empty State
const DivisionEmptyState = ({ division }: { division: string }) => {
  return (
    <div className="arena-card p-8 text-center">
      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
      <h3 className="font-display text-lg font-semibold mb-2 capitalize">
        No Warriors in {division}
      </h3>
      <p className="text-muted-foreground text-sm">
        Be the first to reach {division} division and claim your spot.
      </p>
    </div>
  );
};

// Loading Skeleton
const LeaderboardSkeleton = () => {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="arena-card p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Leaderboard() {
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const { user, profile } = useAuth();
  const { data, isLoading, error } = useLeaderboard(selectedDivision);

  const leaderboardUsers = data?.users || [];
  const stats = data?.stats;
  
  // Top 3 users for the podium (only when showing "all" divisions)
  const topThreeUsers = selectedDivision === 'all' ? leaderboardUsers.slice(0, 3) : [];
  
  // Remaining users for the main list (exclude top 3 when showing podium)
  const remainingUsers = selectedDivision === 'all' ? leaderboardUsers.slice(3) : leaderboardUsers;
  
  const hasEnoughUsers = leaderboardUsers.length >= 1;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Elite Arena Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <ChevronsUp className="h-6 w-6 text-primary animate-pulse" />
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>
            <Crown className="h-10 w-10 text-rank-gold drop-shadow-[0_0_10px_hsl(var(--rank-gold))]" />
            <h1 className="font-display text-4xl font-bold text-foreground">
              THE <span className="text-primary neon-text">ARENA</span>
            </h1>
            <Crown className="h-10 w-10 text-rank-gold drop-shadow-[0_0_10px_hsl(var(--rank-gold))]" />
            <div className="flex items-center gap-1">
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <ChevronsUp className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Only the <span className="text-primary font-bold">elite</span> rise. Prove your dominance.
          </p>
          {stats && stats.totalUsers > 0 && (
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{stats.totalUsers} Active Warriors</span>
              </div>
              <div className="flex items-center gap-1 text-status-success">
                <TrendingUp className="h-4 w-4" />
                <span>Top {stats.promotionThreshold} Promote</span>
              </div>
              <div className="flex items-center gap-1 text-destructive">
                <TrendingDown className="h-4 w-4" />
                <span>Bottom {stats.demotionThreshold} Demote</span>
              </div>
            </div>
          )}
        </div>

        {/* Division Filter */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {divisions.map((div) => (
            <Button
              key={div}
              variant={selectedDivision === div ? 'arena' : 'outline'}
              size="sm"
              onClick={() => setSelectedDivision(div)}
              className="capitalize"
            >
              {div === 'all' ? 'All Divisions' : div}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && <LeaderboardSkeleton />}

        {/* Error State */}
        {error && (
          <div className="arena-card p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">Failed to Load Leaderboard</h3>
            <p className="text-muted-foreground text-sm">Please try again later.</p>
          </div>
        )}

        {/* Empty State - No users at all */}
        {!isLoading && !error && !hasEnoughUsers && (
          <PrivateBetaEmptyState profile={profile} />
        )}

        {/* Main Leaderboard */}
        {!isLoading && !error && hasEnoughUsers && (
          <>
            {/* Top 3 Podium - Only show for 'all' filter and if we have at least 1 user */}
            {selectedDivision === 'all' && topThreeUsers.length > 0 && (
              <TopThreePodium users={topThreeUsers} />
            )}

            {/* Division Empty State */}
            {selectedDivision !== 'all' && leaderboardUsers.length === 0 && (
              <DivisionEmptyState division={selectedDivision} />
            )}

            {/* Remaining Leaderboard List Header */}
            {remainingUsers.length > 0 && selectedDivision === 'all' && (
              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Rankings Continue
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            )}

            {/* Leaderboard List - Shows from rank #4 when podium is displayed */}
            {(selectedDivision === 'all' ? remainingUsers : leaderboardUsers).length > 0 && (
              <div className="space-y-2">
                {(selectedDivision === 'all' ? remainingUsers : leaderboardUsers).map((leaderboardUser) => (
                  <LeaderboardRow 
                    key={leaderboardUser.id} 
                    user={leaderboardUser} 
                    showZone={selectedDivision === 'all' && leaderboardUsers.length > 5}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Zone Legend */}
        {!isLoading && hasEnoughUsers && leaderboardUsers.length > 5 && (
          <div className="flex flex-wrap gap-4 justify-center mt-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-status-success"></div>
              <span className="text-muted-foreground">Promotion Zone (Top 15%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary"></div>
              <span className="text-muted-foreground">Your Position</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive"></div>
              <span className="text-muted-foreground">Demotion Zone (Bottom 15%)</span>
            </div>
          </div>
        )}

        {/* Zone Legend (hidden when no data) */}
        {!isLoading && !hasEnoughUsers && (
          <div className="flex flex-wrap gap-4 justify-center mt-6 text-xs opacity-50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-status-success"></div>
              <span className="text-muted-foreground">Promotion Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-status-warning"></div>
              <span className="text-muted-foreground">Rival (Target)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary"></div>
              <span className="text-muted-foreground">You / Above You</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive"></div>
              <span className="text-muted-foreground">Demotion Zone</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
