import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type RankTier =
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master"
  | "grandmaster"
  | "challenger";

export type RankDivision = "I" | "II" | "III" | "IV";

export interface RankState {
  user_id: string;
  tier: RankTier;
  division: RankDivision;
  lp: number;
  mmr: number;
  mmr_deviation: number;
  games_played: number;
  win_streak: number;
  loss_streak: number;
  placements_remaining: number;
  demotion_shield: number;
  decay_bank_days: number;
  last_match_at: string | null;
  peak_tier: RankTier | null;
  peak_division: RankDivision | null;
  peak_lp: number | null;
  peak_mmr: number | null;
}

export const TIER_ORDER: RankTier[] = [
  "iron",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
  "master",
  "grandmaster",
  "challenger",
];

export const DIVISION_ORDER: RankDivision[] = ["IV", "III", "II", "I"];

export function tierIndex(t: RankTier): number {
  return TIER_ORDER.indexOf(t);
}

export function divisionIndex(d: RankDivision): number {
  return DIVISION_ORDER.indexOf(d);
}

/**
 * Returns the live rank state for a user (defaults to current auth user).
 * Subscribes to realtime updates on rank_states.
 */
export function useRankState(userId?: string) {
  const { user } = useAuth();
  const targetId = userId ?? user?.id;
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["rank-state", targetId],
    enabled: !!targetId,
    staleTime: 10_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rank_states")
        .select(
          "user_id, tier, division, lp, mmr, mmr_deviation, games_played, win_streak, loss_streak, placements_remaining, demotion_shield, decay_bank_days, last_match_at, peak_tier, peak_division, peak_lp, peak_mmr",
        )
        .eq("user_id", targetId!)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as RankState | null) ?? null;
    },
  });

  useEffect(() => {
    if (!targetId) return;
    const channel = supabase
      .channel(`rank-state-${targetId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rank_states",
          filter: `user_id=eq.${targetId}`,
        },
        () => qc.invalidateQueries({ queryKey: ["rank-state", targetId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetId, qc]);

  return { rank: query.data ?? null, isLoading: query.isLoading };
}
