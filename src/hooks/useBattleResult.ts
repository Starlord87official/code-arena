import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ResultPlayer {
  user_id: string;
  handle: string;
  score: number;
  problems_solved: number;
  wrong_submissions: number;
  total_solve_time_sec: number;
  elo_before: number;
  elo_after: number | null;
  elo_change: number | null;
  xp_earned: number;
  integrity_score: number;
  is_forfeit: boolean;
}

export interface ResultRound {
  problem_id: string;
  order_index: number;
  title: string;
  difficulty: string;
  winner_user_id: string | null;
}

export interface MatchResultData {
  match_id: string;
  winner_id: string | null;
  is_draw: boolean;
  duration_sec: number;
  mode: string;
  invalidated_reason: string | null;
  players: ResultPlayer[];
  rounds: ResultRound[];
}

export function useBattleResult(matchId: string | undefined | null, enabled = true) {
  return useQuery({
    queryKey: ["match-result", matchId],
    queryFn: async (): Promise<MatchResultData | null> => {
      if (!matchId) return null;
      const { data, error } = await (supabase.rpc as any)("get_match_result", { p_match_id: matchId });
      if (error) throw error;
      return data as MatchResultData;
    },
    enabled: !!matchId && enabled,
    staleTime: 30_000,
  });
}
