import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

export interface ChallengeExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ChallengeFromDB {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  tags: string[];
  xp_reward: number;
  problem_statement: string;
  examples: ChallengeExample[];
  constraints: string[];
  hints: string[];
  rank_impact_win: number;
  rank_impact_loss: number;
  time_limit: number;
  is_daily: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ChallengeWithStats extends ChallengeFromDB {
  solvedBy: number;
  isSolved: boolean;
}

interface ChallengeStat {
  challenge_id: string;
  solve_count: number;
}

function parseExamples(examples: Json): ChallengeExample[] {
  if (Array.isArray(examples)) {
    return examples.map((ex) => ({
      input: String((ex as Record<string, unknown>)?.input || ''),
      output: String((ex as Record<string, unknown>)?.output || ''),
      explanation: (ex as Record<string, unknown>)?.explanation 
        ? String((ex as Record<string, unknown>).explanation) 
        : undefined,
    }));
  }
  return [];
}

export function useChallenges() {
  const { user, isAuthenticated } = useAuth();

  const challengesQuery = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('difficulty', { ascending: true });

      if (error) throw error;
      
      return (data || []).map((row) => ({
        ...row,
        difficulty: row.difficulty as ChallengeFromDB['difficulty'],
        examples: parseExamples(row.examples),
      })) as ChallengeFromDB[];
    },
    enabled: isAuthenticated,
  });

  const statsQuery = useQuery({
    queryKey: ['challenge-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_challenge_stats');
      if (error) throw error;
      return (data || []) as ChallengeStat[];
    },
    enabled: isAuthenticated,
  });

  const completionsQuery = useQuery({
    queryKey: ['my-completions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('challenge_completions')
        .select('challenge_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map(c => c.challenge_id);
    },
    enabled: isAuthenticated && !!user?.id,
  });

  // Combine challenges with stats and completion status
  const challengesWithStats: ChallengeWithStats[] = (challengesQuery.data || []).map(challenge => {
    const stat = (statsQuery.data || []).find(s => s.challenge_id === challenge.id);
    const isSolved = (completionsQuery.data || []).includes(challenge.id);

    return {
      ...challenge,
      solvedBy: stat?.solve_count || 0,
      isSolved,
    };
  });

  // Get all unique tags
  const allTags = [...new Set(challengesWithStats.flatMap(c => c.tags))].sort();

  return {
    challenges: challengesWithStats,
    allTags,
    isLoading: challengesQuery.isLoading || statsQuery.isLoading || completionsQuery.isLoading,
    error: challengesQuery.error || statsQuery.error || completionsQuery.error,
    refetch: () => {
      challengesQuery.refetch();
      statsQuery.refetch();
      completionsQuery.refetch();
    },
  };
}

export function useCompleteChallenge() {
  const completeChallenge = async (
    challengeId: string,
    options?: { language?: string; runtime_ms?: number; memory_kb?: number }
  ) => {
    const { data, error } = await supabase.rpc('complete_challenge', {
      p_challenge_id: challengeId,
      p_language: options?.language || null,
      p_runtime_ms: options?.runtime_ms || null,
      p_memory_kb: options?.memory_kb || null,
    });

    if (error) throw error;
    return data as { success: boolean; xp_earned?: number; completion_id?: string; error?: string };
  };

  return { completeChallenge };
}
