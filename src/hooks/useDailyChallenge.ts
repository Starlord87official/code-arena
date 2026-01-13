import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChallengeFromDB, ChallengeExample } from './useChallenges';
import type { Json } from '@/integrations/supabase/types';

// Daily challenge resets at midnight UTC
function getDailyResetTime(): Date {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return tomorrow;
}

// Get current day number since epoch (for deterministic selection)
function getCurrentDayNumber(): number {
  const now = new Date();
  const startOfDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor(startOfDay / (24 * 60 * 60 * 1000));
}

// Deterministic challenge selection based on day
function selectDailyChallenge<T extends { id: string }>(challenges: T[], dayNumber: number): T | null {
  if (challenges.length === 0) return null;
  // Use modulo to rotate through challenges deterministically
  const index = dayNumber % challenges.length;
  // Sort by ID to ensure consistent ordering across all users
  const sorted = [...challenges].sort((a, b) => a.id.localeCompare(b.id));
  return sorted[index];
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

export interface DailyChallengeInfo {
  challenge: ChallengeFromDB | null;
  expiresAt: Date;
  timeRemaining: string;
  hoursRemaining: number;
  isCompleted: boolean;
  isExpired: boolean;
}

export function useDailyChallenge() {
  const { user, isAuthenticated } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [hoursRemaining, setHoursRemaining] = useState<number>(24);

  // Fetch all active challenges
  const challengesQuery = useQuery({
    queryKey: ['all-challenges-for-daily'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('id');

      if (error) throw error;
      
      return (data || []).map((row) => ({
        ...row,
        difficulty: row.difficulty as ChallengeFromDB['difficulty'],
        examples: parseExamples(row.examples),
      })) as ChallengeFromDB[];
    },
    enabled: isAuthenticated,
  });

  // Get the daily challenge deterministically
  const dayNumber = getCurrentDayNumber();
  const dailyChallenge = useMemo(() => {
    if (!challengesQuery.data || challengesQuery.data.length === 0) return null;
    return selectDailyChallenge(challengesQuery.data, dayNumber);
  }, [challengesQuery.data, dayNumber]);

  // Check if user has completed today's daily challenge
  const completionQuery = useQuery({
    queryKey: ['daily-challenge-completion', user?.id, dailyChallenge?.id, dayNumber],
    queryFn: async () => {
      if (!user?.id || !dailyChallenge?.id) return false;
      
      // Get today's start in UTC
      const today = new Date();
      const todayStart = new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        0, 0, 0, 0
      )).toISOString();
      
      const { data, error } = await supabase
        .from('challenge_completions')
        .select('id')
        .eq('user_id', user.id)
        .eq('challenge_id', dailyChallenge.id)
        .gte('completed_at', todayStart)
        .limit(1);

      if (error) throw error;
      return (data?.length || 0) > 0;
    },
    enabled: isAuthenticated && !!user?.id && !!dailyChallenge?.id,
  });

  // Update countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const expiresAt = getDailyResetTime();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        setHoursRemaining(0);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setHoursRemaining(hours);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const dailyChallengeInfo: DailyChallengeInfo = {
    challenge: dailyChallenge,
    expiresAt: getDailyResetTime(),
    timeRemaining,
    hoursRemaining,
    isCompleted: completionQuery.data || false,
    isExpired: hoursRemaining <= 0,
  };

  return {
    dailyChallenge: dailyChallengeInfo,
    isLoading: challengesQuery.isLoading || completionQuery.isLoading,
    error: challengesQuery.error || completionQuery.error,
    refetch: () => {
      challengesQuery.refetch();
      completionQuery.refetch();
    },
  };
}

// Hook to check and update user streak based on daily challenge completion
export function useDailyStreak() {
  const { user, isAuthenticated } = useAuth();

  const streakQuery = useQuery({
    queryKey: ['user-streak', user?.id],
    queryFn: async () => {
      if (!user?.id) return { streak: 0, streakBroken: false };

      // Check and update streak status (this will reset if missed)
      const { data: streakCheck, error: checkError } = await supabase
        .rpc('check_daily_streak');
      
      if (checkError) {
        console.error('Streak check error:', checkError);
        // Fallback to just reading profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('streak')
          .eq('id', user.id)
          .single();
        return { streak: profile?.streak || 0, streakBroken: false };
      }

      return { 
        streak: (streakCheck as any)?.streak || 0,
        streakBroken: (streakCheck as any)?.streak_broken || false
      };
    },
    enabled: isAuthenticated && !!user?.id,
  });

  return {
    streak: streakQuery.data?.streak || 0,
    streakBroken: streakQuery.data?.streakBroken || false,
    isLoading: streakQuery.isLoading,
    refetch: streakQuery.refetch,
  };
}

// Hook to complete daily challenge
export function useCompleteDailyChallenge() {
  const completeDailyChallenge = async (challengeId: string) => {
    const { data, error } = await supabase.rpc('complete_daily_challenge', {
      p_challenge_id: challengeId,
    });

    if (error) throw error;
    return data as { 
      success: boolean; 
      streak?: number; 
      xp_earned?: number; 
      streak_continued?: boolean;
      error?: string 
    };
  };

  return { completeDailyChallenge };
}
