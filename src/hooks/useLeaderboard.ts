import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type Division = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'legend';

export interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url: string | null;
  xp: number;
  streak: number;
  division: Division;
  rank: number;
  level: number;
  solvedChallenges: number;
  joinedAt: Date;
  zone: 'promotion' | 'neutral' | 'demotion';
  isCurrentUser: boolean;
  lastActive: Date | null;
}

export interface LeaderboardStats {
  totalUsers: number;
  promotionThreshold: number;
  demotionThreshold: number;
}

// Calculate level from XP
const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 500) + 1;
};

// Calculate division zone based on rank position
const calculateZone = (
  rank: number,
  totalUsers: number
): 'promotion' | 'neutral' | 'demotion' => {
  if (totalUsers === 0) return 'neutral';
  
  const promotionThreshold = Math.max(1, Math.ceil(totalUsers * 0.15)); // Top 15%
  const demotionThreshold = Math.max(1, Math.ceil(totalUsers * 0.15)); // Bottom 15%
  
  if (rank <= promotionThreshold) return 'promotion';
  if (rank > totalUsers - demotionThreshold) return 'demotion';
  return 'neutral';
};

export function useLeaderboard(divisionFilter: string = 'all') {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['leaderboard', divisionFilter, user?.id],
    queryFn: async (): Promise<{ users: LeaderboardUser[]; stats: LeaderboardStats }> => {
      // Use SECURITY DEFINER RPC to fetch public profile data safely
      const { data: profiles, error } = await supabase.rpc('get_leaderboard_data', {
        p_division: divisionFilter === 'all' ? null : divisionFilter,
        p_limit: 100
      });
      
      if (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
      }
      
      if (!profiles || profiles.length === 0) {
        return {
          users: [],
          stats: {
            totalUsers: 0,
            promotionThreshold: 0,
            demotionThreshold: 0,
          },
        };
      }
      
      // Get challenge completion counts for all users
      const userIds = profiles.map(p => p.id).filter(Boolean) as string[];
      
      const { data: completions } = await supabase
        .from('challenge_completions')
        .select('user_id')
        .in('user_id', userIds);
      
      // Count completions per user
      const completionCounts: Record<string, number> = {};
      completions?.forEach(c => {
        completionCounts[c.user_id] = (completionCounts[c.user_id] || 0) + 1;
      });
      
      // Get last activity for users
      const { data: activities } = await supabase
        .from('user_activity')
        .select('user_id, activity_date')
        .in('user_id', userIds)
        .order('activity_date', { ascending: false });
      
      // Get latest activity per user
      const lastActivityMap: Record<string, Date> = {};
      activities?.forEach(a => {
        if (!lastActivityMap[a.user_id]) {
          lastActivityMap[a.user_id] = new Date(a.activity_date);
        }
      });
      
      // Sort users by XP, then streak, then last activity
      const sortedProfiles = [...profiles].sort((a, b) => {
        // Primary: XP (descending)
        if ((b.xp || 0) !== (a.xp || 0)) {
          return (b.xp || 0) - (a.xp || 0);
        }
        // Secondary: Streak (descending)
        if ((b.streak || 0) !== (a.streak || 0)) {
          return (b.streak || 0) - (a.streak || 0);
        }
        // Tertiary: Last activity (most recent first)
        const aActivity = lastActivityMap[a.id || '']?.getTime() || 0;
        const bActivity = lastActivityMap[b.id || '']?.getTime() || 0;
        return bActivity - aActivity;
      });
      
      const totalUsers = sortedProfiles.length;
      const promotionThreshold = Math.max(1, Math.ceil(totalUsers * 0.15));
      const demotionThreshold = Math.max(1, Math.ceil(totalUsers * 0.15));
      
      // Map to LeaderboardUser
      const users: LeaderboardUser[] = sortedProfiles.map((profile, index) => {
        const rank = index + 1;
        const id = profile.id || '';
        
        return {
          id,
          username: profile.username || 'Anonymous',
          avatar_url: profile.avatar_url,
          xp: profile.xp || 0,
          streak: profile.streak || 0,
          division: (profile.division as Division) || 'bronze',
          rank,
          level: calculateLevel(profile.xp || 0),
          solvedChallenges: completionCounts[id] || 0,
          joinedAt: new Date(profile.joined_at || Date.now()),
          zone: calculateZone(rank, totalUsers),
          isCurrentUser: id === user?.id,
          lastActive: lastActivityMap[id] || null,
        };
      });
      
      return {
        users,
        stats: {
          totalUsers,
          promotionThreshold,
          demotionThreshold,
        },
      };
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

// Get the current user's rank from the leaderboard
export function useUserRank() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-rank', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Use SECURITY DEFINER RPC to get leaderboard data safely
      const { data: profiles, error } = await supabase.rpc('get_leaderboard_data', {
        p_division: null,
        p_limit: 1000
      });
      
      if (error || !profiles) return null;
      
      const userIndex = profiles.findIndex(p => p.id === user.id);
      if (userIndex === -1) return null;
      
      return {
        rank: userIndex + 1,
        totalUsers: profiles.length,
      };
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });
}
