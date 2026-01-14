import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OnlineWarrior {
  id: string;
  username: string;
  avatar_url: string | null;
  division: string;
  xp: number;
  streak: number;
}

export interface PendingChallenge {
  id: string;
  opponent: {
    id: string;
    username: string;
    avatar_url: string | null;
    division: string;
  };
  createdAt: string;
}

export interface RecentBattle {
  id: string;
  opponent: {
    id: string;
    name: string;
  };
  result: 'win' | 'loss' | 'draw';
  xpChange: number;
  date: string;
}

export interface BattleStats {
  elo: number;
  winRate: number;
  totalDuels: number;
  winStreak: number;
  nextRankProgress: number;
  nextRankName: string;
  eloToNextRank: number;
}

// ELO thresholds for ranks
const RANK_THRESHOLDS = [
  { name: 'Bronze', minElo: 0 },
  { name: 'Silver', minElo: 1000 },
  { name: 'Gold', minElo: 1200 },
  { name: 'Platinum', minElo: 1400 },
  { name: 'Diamond', minElo: 1600 },
  { name: 'Master', minElo: 1800 },
  { name: 'Grandmaster', minElo: 2000 },
];

function calculateRankProgress(elo: number): { nextRankName: string; eloToNextRank: number; progress: number } {
  const currentRankIndex = RANK_THRESHOLDS.findIndex((r, i) => {
    const nextRank = RANK_THRESHOLDS[i + 1];
    return !nextRank || elo < nextRank.minElo;
  });
  
  const currentRank = RANK_THRESHOLDS[currentRankIndex];
  const nextRank = RANK_THRESHOLDS[currentRankIndex + 1];
  
  if (!nextRank) {
    return { nextRankName: 'Max Rank', eloToNextRank: 0, progress: 100 };
  }
  
  const eloInCurrentRank = elo - currentRank.minElo;
  const eloNeededForNext = nextRank.minElo - currentRank.minElo;
  const progress = Math.round((eloInCurrentRank / eloNeededForNext) * 100);
  
  return {
    nextRankName: nextRank.name,
    eloToNextRank: nextRank.minElo - elo,
    progress: Math.min(progress, 100),
  };
}

export function useBattleData() {
  const { user } = useAuth();

  // Fetch online warriors (users active in last 5 minutes)
  // For private beta, this will likely be empty
  const onlineWarriorsQuery = useQuery({
    queryKey: ['online-warriors'],
    queryFn: async (): Promise<OnlineWarrior[]> => {
      // In private beta, we don't have a real-time presence system
      // Return empty array - no fake users
      return [];
    },
    enabled: !!user,
  });

  // Fetch pending challenges
  // For private beta, no pending challenge system exists yet
  const pendingChallengesQuery = useQuery({
    queryKey: ['pending-challenges', user?.id],
    queryFn: async (): Promise<PendingChallenge[]> => {
      // No pending challenge table exists in the schema
      // Return empty array - no fake challenges
      return [];
    },
    enabled: !!user,
  });

  // Fetch recent battles from battle_history where user's clan participated
  const recentBattlesQuery = useQuery({
    queryKey: ['recent-battles', user?.id],
    queryFn: async (): Promise<RecentBattle[]> => {
      if (!user) return [];
      
      // First get user's clan membership
      const { data: clanMember } = await supabase
        .from('clan_members')
        .select('clan_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!clanMember?.clan_id) {
        // User not in a clan - no clan battles to show
        return [];
      }

      // Fetch battle history for user's clan
      const { data: battles, error } = await supabase
        .from('battle_history')
        .select('*')
        .or(`clan_a_id.eq.${clanMember.clan_id},clan_b_id.eq.${clanMember.clan_id}`)
        .order('ended_at', { ascending: false })
        .limit(10);

      if (error || !battles) return [];

      return battles.map(battle => {
        const isTeamA = battle.clan_a_id === clanMember.clan_id;
        const opponentName = isTeamA ? battle.clan_b_name : battle.clan_a_name;
        const opponentId = isTeamA ? battle.clan_b_id : battle.clan_a_id;
        
        let result: 'win' | 'loss' | 'draw';
        if (battle.winner === 'A' && isTeamA) result = 'win';
        else if (battle.winner === 'B' && !isTeamA) result = 'win';
        else if (battle.winner === 'tie' || !battle.winner) result = 'draw';
        else result = 'loss';

        const xpChange = result === 'win' ? battle.xp_change : 
                         result === 'loss' ? -battle.xp_change : 0;

        return {
          id: battle.id,
          opponent: { id: opponentId, name: opponentName },
          result,
          xpChange,
          date: formatRelativeTime(new Date(battle.ended_at)),
        };
      });
    },
    enabled: !!user,
  });

  // Calculate battle stats from real data
  const battleStatsQuery = useQuery({
    queryKey: ['battle-stats', user?.id],
    queryFn: async (): Promise<BattleStats> => {
      if (!user) {
        return getEmptyStats();
      }

      // Get user's clan
      const { data: clanMember } = await supabase
        .from('clan_members')
        .select('clan_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!clanMember?.clan_id) {
        // No clan, no battle stats
        return getEmptyStats();
      }

      // Fetch all battles for this clan
      const { data: battles, error } = await supabase
        .from('battle_history')
        .select('*')
        .or(`clan_a_id.eq.${clanMember.clan_id},clan_b_id.eq.${clanMember.clan_id}`)
        .order('ended_at', { ascending: false });

      if (error || !battles || battles.length === 0) {
        return getEmptyStats();
      }

      // Calculate stats
      let wins = 0;
      let currentStreak = 0;
      let maxStreak = 0;
      let totalEloChange = 0;

      battles.forEach((battle, index) => {
        const isTeamA = battle.clan_a_id === clanMember.clan_id;
        const isWin = (battle.winner === 'A' && isTeamA) || (battle.winner === 'B' && !isTeamA);
        
        if (isWin) {
          wins++;
          if (index === 0 || currentStreak > 0) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
          }
        } else {
          currentStreak = 0;
        }
        
        totalEloChange += battle.elo_change * (isWin ? 1 : -1);
      });

      const totalDuels = battles.length;
      const winRate = totalDuels > 0 ? Math.round((wins / totalDuels) * 100) : 0;
      const estimatedElo = 1000 + totalEloChange; // Base ELO + changes
      
      const rankProgress = calculateRankProgress(estimatedElo);

      // Calculate actual current streak from most recent battles
      let actualStreak = 0;
      for (const battle of battles) {
        const isTeamA = battle.clan_a_id === clanMember.clan_id;
        const isWin = (battle.winner === 'A' && isTeamA) || (battle.winner === 'B' && !isTeamA);
        if (isWin) {
          actualStreak++;
        } else {
          break;
        }
      }

      return {
        elo: estimatedElo,
        winRate,
        totalDuels,
        winStreak: actualStreak,
        nextRankProgress: rankProgress.progress,
        nextRankName: rankProgress.nextRankName,
        eloToNextRank: rankProgress.eloToNextRank,
      };
    },
    enabled: !!user,
  });

  return {
    onlineWarriors: onlineWarriorsQuery.data ?? [],
    isLoadingOnline: onlineWarriorsQuery.isLoading,
    
    pendingChallenges: pendingChallengesQuery.data ?? [],
    isLoadingPending: pendingChallengesQuery.isLoading,
    
    recentBattles: recentBattlesQuery.data ?? [],
    isLoadingRecent: recentBattlesQuery.isLoading,
    
    battleStats: battleStatsQuery.data ?? getEmptyStats(),
    isLoadingStats: battleStatsQuery.isLoading,
  };
}

function getEmptyStats(): BattleStats {
  return {
    elo: 1000,
    winRate: 0,
    totalDuels: 0,
    winStreak: 0,
    nextRankProgress: 0,
    nextRankName: 'Silver',
    eloToNextRank: 200,
  };
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}
