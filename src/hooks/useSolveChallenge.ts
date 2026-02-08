import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChallengeFromDB, ChallengeExample, useCompleteChallenge } from './useChallenges';
import type { Json } from '@/integrations/supabase/types';

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

export interface ChallengeWithStats extends ChallengeFromDB {
  solvedBy: number;
  attemptCount: number;
  successRate: number | null;
  isSolved: boolean;
}

interface ChallengeStat {
  challenge_id: string;
  solve_count: number;
  attempt_count: number;
  success_rate: number | null;
}

// Helper to check if string is a valid UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Hook to fetch and manage a single challenge for the solve page.
 * Accepts either a slug (e.g., "two-sum") or a UUID id.
 * Queries by slug first, falls back to id for backward compatibility.
 */
export function useSolveChallenge(slugOrId: string) {
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const { completeChallenge } = useCompleteChallenge();

  // Timer state
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerStopped, setTimerStopped] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<'success' | 'failure' | null>(null);

  // Determine if we're looking up by UUID or slug
  const lookupType = useMemo(() => {
    if (!slugOrId) return null;
    return isUUID(slugOrId) ? 'id' : 'slug';
  }, [slugOrId]);

  // Fetch single challenge - query by slug OR id
  const challengeQuery = useQuery({
    queryKey: ['challenge', slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;

      // First try by slug (most common case from URL)
      const { data: bySlug, error: slugError } = await supabase
        .from('challenges')
        .select('*')
        .eq('slug', slugOrId)
        .eq('is_active', true)
        .maybeSingle();

      if (bySlug) {
        return {
          ...bySlug,
          difficulty: bySlug.difficulty as ChallengeFromDB['difficulty'],
          examples: parseExamples(bySlug.examples),
        } as ChallengeFromDB;
      }

      // If not found by slug and it looks like a UUID, try by id (backward compatibility)
      if (lookupType === 'id') {
        const { data: byId, error: idError } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', slugOrId)
          .eq('is_active', true)
          .maybeSingle();

        if (byId) {
          return {
            ...byId,
            difficulty: byId.difficulty as ChallengeFromDB['difficulty'],
            examples: parseExamples(byId.examples),
          } as ChallengeFromDB;
        }
      }

      // Not found
      return null;
    },
    enabled: !!slugOrId,
  });

  // Get the challenge ID for subsequent queries (stats, completion)
  const challengeId = challengeQuery.data?.id;

  // Fetch stats for this challenge
  const statsQuery = useQuery({
    queryKey: ['challenge-stats-single', challengeId],
    queryFn: async () => {
      if (!challengeId) return null;
      const { data, error } = await supabase.rpc('get_challenge_stats');
      if (error) throw error;
      const stats = (data || []) as ChallengeStat[];
      return stats.find(s => s.challenge_id === challengeId) || null;
    },
    enabled: !!challengeId,
  });

  // Check if user already solved this challenge
  const completionQuery = useQuery({
    queryKey: ['challenge-completion', user?.id, challengeId],
    queryFn: async () => {
      if (!user?.id || !challengeId) return null;
      const { data, error } = await supabase
        .from('challenge_completions')
        .select('id, completed_at')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated && !!user?.id && !!challengeId,
  });

  // Combined challenge data
  const challenge: ChallengeWithStats | null = challengeQuery.data ? {
    ...challengeQuery.data,
    solvedBy: statsQuery.data?.solve_count || 0,
    attemptCount: statsQuery.data?.attempt_count || 0,
    successRate: statsQuery.data?.success_rate ?? null,
    isSolved: !!completionQuery.data,
  } : null;

  // Timer management
  useEffect(() => {
    // Don't start timer if already solved or timer already stopped
    if (completionQuery.data || timerStopped) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeElapsed(t => t + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [completionQuery.data, timerStopped]);

  // Stop timer function
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerStopped(true);
  }, []);

  // Submit solution
  const submitSolution = useCallback(async (options?: { language?: string; runtime_ms?: number; memory_kb?: number }) => {
    if (!challenge || !challengeId || isSubmitting) return null;

    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      // Check if already solved
      if (completionQuery.data) {
        setSubmissionResult('success');
        stopTimer();
        setIsSubmitting(false);
        return { success: true, already_solved: true };
      }

      // Call the complete_challenge RPC with the actual challenge ID
      const result = await completeChallenge(challengeId, options);

      if (result.success) {
        // Stop timer immediately on success
        stopTimer();
        setSubmissionResult('success');

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['challenge-stats-single', challengeId] });
        queryClient.invalidateQueries({ queryKey: ['challenge-stats'] });
        queryClient.invalidateQueries({ queryKey: ['challenge-completion', user?.id, challengeId] });
        queryClient.invalidateQueries({ queryKey: ['my-completions', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['challenges'] });
        queryClient.invalidateQueries({ queryKey: ['challenge', slugOrId] });
        // Refresh roadmap topic progress
        queryClient.invalidateQueries({ queryKey: ['user-completions', user?.id] });
        // Refresh Today's Plan / activity summary
        queryClient.invalidateQueries({ queryKey: ['activity-summary', user?.id] });

        // Refresh user profile to update XP on dashboard
        refreshProfile();

        return result;
      } else {
        setSubmissionResult('failure');
        return result;
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmissionResult('failure');
      return { success: false, error: String(error) };
    } finally {
      setIsSubmitting(false);
    }
  }, [challenge, challengeId, slugOrId, isSubmitting, completeChallenge, completionQuery.data, stopTimer, queryClient, user?.id, refreshProfile]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return {
    challenge,
    isLoading: challengeQuery.isLoading,
    error: challengeQuery.error,
    
    // Timer
    timeElapsed,
    formattedTime: formatTime(timeElapsed),
    timerStopped,
    stopTimer,
    
    // Submission
    isSubmitting,
    submissionResult,
    submitSolution,
    setSubmissionResult,
    
    // Completion status
    isSolved: !!completionQuery.data,
    completedAt: completionQuery.data?.completed_at,
    
    // Refetch
    refetch: () => {
      challengeQuery.refetch();
      statsQuery.refetch();
      completionQuery.refetch();
    },
  };
}
