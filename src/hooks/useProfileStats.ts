import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SolveBreakdown {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  extreme: number;
}

export interface TrainingAttributes {
  attack: number;      // Problem-solving power (total problems / expected baseline)
  defense: number;     // Accuracy (assume 100% since we only track successful completions)
  vision: number;      // Topic diversity (unique topics solved / total topics)
  stamina: number;     // Consistency (streak + activity frequency)
  adaptability: number; // Difficulty diversity (how spread across easy/med/hard)
  clutch: number;      // Timed performance (daily challenges, battles)
}

export interface ProfileStats {
  solveBreakdown: SolveBreakdown;
  trainingAttributes: TrainingAttributes;
  totalProblems: number;
  uniqueTopics: number;
  activeDaysLast30: number;
  currentStreak: number;
  bestStreak: number;
  battleStats: {
    played: number;
    won: number;
    winRate: number;
    elo: number;
  };
  dailyChallengesCompleted: number;
  revisionsDue: number;
  revisionsCompleted: number;
}

export function useProfileStats(userId?: string) {
  return useQuery({
    queryKey: ['profile-stats', userId],
    queryFn: async (): Promise<ProfileStats> => {
      if (!userId) {
        return getDefaultStats();
      }

      // Fetch all required data in parallel
      const [
        completionsResult,
        challengesResult,
        activityResult,
        battleStatsResult,
        dailyCompletionsResult,
        revisionResult,
        roadmapProgressResult,
      ] = await Promise.all([
        // Get completions with challenge details
        supabase
          .from('challenge_completions')
          .select('challenge_id, completed_at')
          .eq('user_id', userId),
        
        // Get all challenges to map difficulties
        supabase
          .from('challenges')
          .select('id, difficulty, tags')
          .eq('is_active', true),
        
        // Get activity summary
        supabase.rpc('get_activity_summary'),
        
        // Get battle stats
        supabase
          .from('user_battle_stats')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        
        // Get daily challenge completions count
        supabase
          .from('daily_challenge_completions')
          .select('id')
          .eq('user_id', userId),
        
        // Get revision queue
        supabase.rpc('get_revision_queue'),
        
        // Get roadmap progress for topic diversity
        supabase
          .from('user_roadmap_progress')
          .select('topic_id, state')
          .eq('user_id', userId),
      ]);

      // Parse completions
      const completions = completionsResult.data || [];
      const challenges = challengesResult.data || [];
      const battleStats = battleStatsResult.data;
      const dailyCompletions = dailyCompletionsResult.data || [];
      const activityData = activityResult.data as any;
      const revisionData = revisionResult.data as any;
      const roadmapProgress = roadmapProgressResult.data || [];

      // Create challenge lookup
      const challengeMap = new Map(
        challenges.map(c => [c.id, c])
      );

      // Calculate solve breakdown
      const solveBreakdown: SolveBreakdown = {
        total: completions.length,
        easy: 0,
        medium: 0,
        hard: 0,
        extreme: 0,
      };

      const uniqueTags = new Set<string>();

      completions.forEach(completion => {
        const challenge = challengeMap.get(completion.challenge_id);
        if (challenge) {
          const diff = challenge.difficulty as keyof Omit<SolveBreakdown, 'total'>;
          if (diff in solveBreakdown) {
            solveBreakdown[diff]++;
          }
          // Track unique topics
          (challenge.tags || []).forEach((tag: string) => uniqueTags.add(tag));
        }
      });

      // Calculate activity stats
      const activity = activityData?.activity || [];
      const streak = activityData?.streak || 0;
      
      // Count active days in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeDaysLast30 = activity.filter((a: any) => {
        const date = new Date(a.date);
        return date >= thirtyDaysAgo && a.count > 0;
      }).length;

      // Calculate revision stats
      const revisionItems = revisionData?.items || [];
      const revisionsDue = revisionItems.filter((r: any) => 
        r.status === 'due' || r.status === 'overdue'
      ).length;
      const revisionsCompleted = revisionItems.filter((r: any) => 
        r.status === 'completed'
      ).length;

      // Calculate training attributes (all on 0-100 scale)
      const trainingAttributes = calculateTrainingAttributes({
        solveBreakdown,
        uniqueTopics: uniqueTags.size,
        totalTopics: 13, // Total DSA topics
        streak,
        activeDaysLast30,
        battleStats,
        dailyChallengesCompleted: dailyCompletions.length,
        topicsInProgress: roadmapProgress.filter(p => p.state === 'in_progress').length,
        topicsCompleted: roadmapProgress.filter(p => p.state === 'completed').length,
      });

      return {
        solveBreakdown,
        trainingAttributes,
        totalProblems: solveBreakdown.total,
        uniqueTopics: uniqueTags.size,
        activeDaysLast30,
        currentStreak: streak,
        bestStreak: battleStats?.best_win_streak || 0,
        battleStats: {
          played: battleStats?.total_duels || 0,
          won: battleStats?.wins || 0,
          winRate: battleStats?.total_duels 
            ? Math.round((battleStats.wins / battleStats.total_duels) * 100)
            : 0,
          elo: battleStats?.elo || 1000,
        },
        dailyChallengesCompleted: dailyCompletions.length,
        revisionsDue,
        revisionsCompleted,
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

function getDefaultStats(): ProfileStats {
  return {
    solveBreakdown: { total: 0, easy: 0, medium: 0, hard: 0, extreme: 0 },
    trainingAttributes: {
      attack: 0,
      defense: 0,
      vision: 0,
      stamina: 0,
      adaptability: 0,
      clutch: 0,
    },
    totalProblems: 0,
    uniqueTopics: 0,
    activeDaysLast30: 0,
    currentStreak: 0,
    bestStreak: 0,
    battleStats: { played: 0, won: 0, winRate: 0, elo: 1000 },
    dailyChallengesCompleted: 0,
    revisionsDue: 0,
    revisionsCompleted: 0,
  };
}

function calculateTrainingAttributes(data: {
  solveBreakdown: SolveBreakdown;
  uniqueTopics: number;
  totalTopics: number;
  streak: number;
  activeDaysLast30: number;
  battleStats: any;
  dailyChallengesCompleted: number;
  topicsInProgress: number;
  topicsCompleted: number;
}): TrainingAttributes {
  const {
    solveBreakdown,
    uniqueTopics,
    totalTopics,
    streak,
    activeDaysLast30,
    battleStats,
    dailyChallengesCompleted,
    topicsCompleted,
  } = data;

  // Attack: Problem-solving power (weighted by difficulty)
  // Baseline: 50 problems = 100 attack
  const weightedProblems = 
    solveBreakdown.easy * 1 +
    solveBreakdown.medium * 2 +
    solveBreakdown.hard * 4 +
    solveBreakdown.extreme * 8;
  const attack = Math.min(100, Math.round((weightedProblems / 100) * 100));

  // Defense: Accuracy (since we only track successful completions, use topic depth)
  // Higher score for completing harder problems
  const hardRatio = solveBreakdown.total > 0
    ? (solveBreakdown.hard + solveBreakdown.extreme) / solveBreakdown.total
    : 0;
  const defense = Math.min(100, Math.round(50 + hardRatio * 50));

  // Vision: Topic diversity
  const vision = Math.min(100, Math.round((uniqueTopics / totalTopics) * 100));

  // Stamina: Consistency (streak + activity frequency)
  const streakScore = Math.min(50, streak * 5); // Max 50 from streak
  const activityScore = Math.min(50, (activeDaysLast30 / 30) * 50);
  const stamina = Math.round(streakScore + activityScore);

  // Adaptability: Difficulty spread (penalize only doing easy problems)
  const difficultySpread = [
    solveBreakdown.easy > 0 ? 1 : 0,
    solveBreakdown.medium > 0 ? 1 : 0,
    solveBreakdown.hard > 0 ? 1 : 0,
    solveBreakdown.extreme > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  const adaptability = Math.min(100, Math.round(
    (difficultySpread / 4) * 60 + 
    (topicsCompleted / totalTopics) * 40
  ));

  // Clutch: Timed performance (battles, daily challenges)
  const battleScore = Math.min(50, (battleStats?.wins || 0) * 5);
  const dailyScore = Math.min(50, dailyChallengesCompleted * 2);
  const clutch = Math.round(battleScore + dailyScore);

  return {
    attack,
    defense,
    vision,
    stamina,
    adaptability,
    clutch,
  };
}
