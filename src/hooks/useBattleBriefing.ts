import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BriefingParticipant {
  user_id: string;
  handle: string;
  avatar: string | null;
  elo: number;
  rank_label: string;
}

export interface BriefingProblem {
  id: string;
  challenge_id: string;
  title: string;
  difficulty: string;
  points: number;
  order_index: number;
}

export interface BriefingMatch {
  id: string;
  mode: string;
  state: string;
  status: string;
  duration_minutes: number;
  problem_count: number;
  hints_enabled: boolean;
  is_rated: boolean;
  started_at: string | null;
  phase_started_at: string | null;
  ended_at: string | null;
}

export interface MatchBriefingData {
  match: BriefingMatch;
  participants: BriefingParticipant[];
  problems: BriefingProblem[];
}

export function useBattleBriefing(matchId: string | undefined | null) {
  return useQuery({
    queryKey: ["match-briefing", matchId],
    queryFn: async (): Promise<MatchBriefingData | null> => {
      if (!matchId) return null;
      const { data, error } = await (supabase.rpc as any)("get_match_briefing", { p_match_id: matchId });
      if (error) throw error;
      return data as MatchBriefingData;
    },
    enabled: !!matchId,
    staleTime: 60_000,
  });
}
