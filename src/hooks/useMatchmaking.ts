import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type MatchmakingStatus = 'idle' | 'searching' | 'matched' | 'in_battle';
export type BattleMode = 'quick' | 'ranked' | 'custom';

export interface MatchmakingState {
  status: MatchmakingStatus;
  queueId?: string;
  sessionId?: string;
  battleId?: string;
  opponentId?: string;
  waitTime?: number;
  mode?: BattleMode;
}

export interface BattleSession {
  id: string;
  battle_id: string;
  player_a_id: string;
  player_b_id: string;
  mode: BattleMode;
  status: string;
  player_a_score: number;
  player_b_score: number;
  player_a_elo: number;
  player_b_elo: number;
  duration_minutes: number;
  start_time: string;
  end_time?: string;
  winner_id?: string;
  xp_awarded_a?: number;
  xp_awarded_b?: number;
  elo_change?: number;
}

export interface UserBattleStats {
  elo: number;
  total_duels: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  win_streak: number;
  best_win_streak: number;
  total_xp_earned: number;
  next_rank: string;
  elo_to_next: number;
  rank_progress: number;
}

export function useMatchmaking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [matchmakingState, setMatchmakingState] = useState<MatchmakingState>({ status: 'idle' });
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef<MatchmakingState>({ status: 'idle' });

  // Keep ref synchronized with latest state for async race protection
  useEffect(() => {
    stateRef.current = matchmakingState;
  }, [matchmakingState]);

  // Guarded setter: prevents stale async responses from downgrading a real match.
  // Once we have a sessionId or are matched/in_battle, ignore idle/searching updates.
  const safeSetState = useCallback((next: MatchmakingState | ((prev: MatchmakingState) => MatchmakingState)) => {
    setMatchmakingState((prev) => {
      const candidate = typeof next === 'function' ? next(prev) : next;
      const hasActiveMatch =
        !!prev.sessionId || prev.status === 'matched' || prev.status === 'in_battle';
      const candidateIsDowngrade =
        candidate.status === 'idle' || candidate.status === 'searching';
      if (hasActiveMatch && candidateIsDowngrade && !candidate.sessionId) {
        return prev;
      }
      return candidate;
    });
  }, []);

  // Check queue status
  const checkQueueStatus = useCallback(async () => {
    if (!user) return null;
    
    const { data, error } = await supabase.rpc('check_battle_queue_status');
    
    if (error) {
      console.error('Error checking queue status:', error);
      return null;
    }
    
    return data as {
      success: boolean;
      status: MatchmakingStatus;
      queue_id?: string;
      session_id?: string;
      battle_id?: string;
      opponent_id?: string;
      wait_time?: number;
      mode?: BattleMode;
    };
  }, [user]);

  // Poll for match status when searching
  useEffect(() => {
    if (matchmakingState.status === 'searching') {
      pollingIntervalRef.current = setInterval(async () => {
        const result = await checkQueueStatus();
        
        if (result?.success) {
          if (result.status === 'matched' || result.status === 'in_battle') {
            setMatchmakingState({
              status: result.status,
              sessionId: result.session_id,
              battleId: result.battle_id,
              opponentId: result.opponent_id,
            });
            toast.success('Opponent found! Battle starting...');
            
            // Stop polling
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          } else if (result.status === 'searching') {
            setMatchmakingState(prev => ({
              ...prev,
              waitTime: result.wait_time,
            }));
          } else if (result.status === 'idle') {
            // Queue expired
            setMatchmakingState({ status: 'idle' });
            toast.error('Search timed out. Please try again.');
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [matchmakingState.status, checkQueueStatus]);

  // Check initial state on mount
  useEffect(() => {
    const checkInitialState = async () => {
      if (!user) return;
      // Skip if we already have a fresh match in local state — avoid clobbering
      // the result of a just-resolved join_battle_queue RPC.
      if (matchmakingState.sessionId) return;

      const result = await checkQueueStatus();
      if (result?.success && result.status !== 'idle') {
        setMatchmakingState({
          status: result.status,
          queueId: result.queue_id,
          sessionId: result.session_id,
          battleId: result.battle_id,
          opponentId: result.opponent_id,
          waitTime: result.wait_time,
          mode: result.mode,
        });
      }
    };

    checkInitialState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Join queue mutation
  const joinQueue = useMutation({
    mutationFn: async ({ mode, targetUserId }: { mode: BattleMode; targetUserId?: string }) => {
      const { data, error } = await supabase.rpc('join_battle_queue', {
        p_mode: mode,
        p_target_user_id: targetUserId || null,
      });
      
      if (error) throw error;
      return data as {
        success: boolean;
        matched: boolean;
        queue_id?: string;
        session_id?: string;
        battle_id?: string;
        opponent_id?: string;
        message?: string;
        error?: string;
      };
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.error || 'Failed to join queue');
        return;
      }
      
      if (data.matched) {
        setMatchmakingState({
          status: 'matched',
          sessionId: data.session_id,
          battleId: data.battle_id,
          opponentId: data.opponent_id,
        });
        toast.success('Match found! Starting battle...');
      } else {
        setMatchmakingState({
          status: 'searching',
          queueId: data.queue_id,
          waitTime: 0,
        });
        toast.info('Searching for opponent...');
      }
    },
    onError: (error) => {
      console.error('Join queue error:', error);
      toast.error('Failed to start matchmaking');
      setMatchmakingState({ status: 'idle' });
    },
  });

  // Cancel queue mutation
  const cancelQueue = useMutation({
    mutationFn: async () => {
      // Stop polling immediately before making the request
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      const { data, error } = await supabase.rpc('cancel_battle_queue');
      
      // Handle the response - the RPC now returns success even if no rows deleted (idempotent)
      if (error) {
        // Only throw for real errors (network, auth), not constraint violations
        if (error.code !== '23505') {
          throw error;
        }
        // Constraint violation means already cancelled/gone - treat as success
        return { success: true, deleted_count: 0 };
      }
      
      return data as { success: boolean; deleted_count?: number };
    },
    onSuccess: () => {
      setMatchmakingState({ status: 'idle' });
      toast.info('Search cancelled');
    },
    onError: (error: any) => {
      console.error('Cancel queue error:', error);
      // Only show error for actual failures (network issues, etc.)
      // Still reset state to idle since we want the user to be able to retry
      setMatchmakingState({ status: 'idle' });
      if (error?.message?.includes('Failed to fetch') || error?.code === 'NETWORK_ERROR') {
        toast.error('Network error - please try again');
      } else {
        toast.error('Failed to cancel search');
      }
    },
  });

  // Get user battle stats
  const { data: battleStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['user-battle-stats', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_battle_stats');
      
      if (error) throw error;
      
      const result = data as unknown as { success: boolean; stats?: UserBattleStats; error?: string };
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.stats!;
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });

  // Complete battle mutation
  const completeBattle = useMutation({
    mutationFn: async ({ 
      sessionId, 
      playerAScore, 
      playerBScore 
    }: { 
      sessionId: string; 
      playerAScore: number; 
      playerBScore: number;
    }) => {
      const { data, error } = await supabase.rpc('complete_duo_battle', {
        p_session_id: sessionId,
        p_player_a_score: playerAScore,
        p_player_b_score: playerBScore,
      });
      
      if (error) throw error;
      return data as {
        success: boolean;
        winner_id?: string;
        is_draw: boolean;
        elo_change: number;
        xp_awarded: number;
        error?: string;
      };
    },
    onSuccess: (data) => {
      if (data.success) {
        setMatchmakingState({ status: 'idle' });
        queryClient.invalidateQueries({ queryKey: ['user-battle-stats'] });
        queryClient.invalidateQueries({ queryKey: ['recent-battles'] });
        
        if (data.is_draw) {
          toast.info(`Battle ended in a draw! +${data.xp_awarded} XP`);
        } else if (data.winner_id === user?.id) {
          toast.success(`Victory! +${data.xp_awarded} XP${data.elo_change > 0 ? `, +${data.elo_change} ELO` : ''}`);
        } else {
          toast.error(`Defeat. +${data.xp_awarded} XP${data.elo_change > 0 ? `, -${data.elo_change} ELO` : ''}`);
        }
      } else {
        toast.error(data.error || 'Failed to complete battle');
      }
    },
    onError: (error) => {
      console.error('Complete battle error:', error);
      toast.error('Failed to complete battle');
    },
  });

  // Get active battle session
  const { data: activeSession } = useQuery({
    queryKey: ['active-battle-session', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_sessions')
        .select('*')
        .or(`player_a_id.eq.${user!.id},player_b_id.eq.${user!.id}`)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) throw error;
      return data as BattleSession | null;
    },
    enabled: !!user && (matchmakingState.status === 'matched' || matchmakingState.status === 'in_battle'),
    refetchInterval: matchmakingState.status === 'in_battle' ? 5000 : false,
  });

  // Get recent duo battles
  const { data: recentDuoBattles, isLoading: isLoadingRecent } = useQuery({
    queryKey: ['recent-duo-battles', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_sessions')
        .select('*')
        .or(`player_a_id.eq.${user!.id},player_b_id.eq.${user!.id}`)
        .eq('status', 'completed')
        .order('end_time', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as BattleSession[];
    },
    enabled: !!user,
  });

  const findOpponent = useCallback((mode: BattleMode, targetUserId?: string) => {
    if (!user) {
      toast.error('Please log in to battle');
      return;
    }
    joinQueue.mutate({ mode, targetUserId });
  }, [user, joinQueue]);

  const cancelSearch = useCallback(() => {
    cancelQueue.mutate();
  }, [cancelQueue]);

  const resetState = useCallback(() => {
    setMatchmakingState({ status: 'idle' });
  }, []);

  return {
    matchmakingState,
    findOpponent,
    cancelSearch,
    completeBattle: completeBattle.mutate,
    resetState,
    isSearching: matchmakingState.status === 'searching',
    isMatched: matchmakingState.status === 'matched',
    isInBattle: matchmakingState.status === 'in_battle',
    isFindingOpponent: joinQueue.isPending,
    battleStats: battleStats ?? {
      elo: 1000,
      total_duels: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      win_rate: 0,
      win_streak: 0,
      best_win_streak: 0,
      total_xp_earned: 0,
      next_rank: 'Silver',
      elo_to_next: 200,
      rank_progress: 0,
    },
    isLoadingStats,
    activeSession,
    recentDuoBattles: recentDuoBattles ?? [],
    isLoadingRecent,
  };
}
