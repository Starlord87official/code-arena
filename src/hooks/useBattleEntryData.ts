import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserBattleSummary {
  elo: number;
  rank_label: string;
  total_matches: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  current_streak: number;
  mvp_count: number;
}

export interface RecentBattleRow {
  match_id: string;
  mode: string;
  ended_at: string | null;
  opponent_handle: string;
  result: "win" | "loss" | "draw";
  score_self: number;
  score_opp: number;
  elo_change: number | null;
}

export interface OnlineWarriorRow {
  user_id: string;
  handle: string;
  elo: number;
  rank_label: string;
  status: "queueing" | "in_match";
}

export interface GlobalBattleStats {
  live_matches: number;
  players_online: number;
  matches_today: number;
}

const REFRESH_MS = 30_000;

export function useBattleEntryData() {
  const { user } = useAuth();
  const enabled = !!user;

  const summary = useQuery({
    queryKey: ["battle-summary", user?.id],
    queryFn: async (): Promise<UserBattleSummary> => {
      const { data, error } = await (supabase.rpc as any)("get_user_battle_summary", {});
      if (error) throw error;
      return data as UserBattleSummary;
    },
    enabled,
    refetchInterval: REFRESH_MS,
  });

  const recent = useQuery({
    queryKey: ["battle-recent", user?.id],
    queryFn: async (): Promise<RecentBattleRow[]> => {
      const { data, error } = await (supabase.rpc as any)("get_recent_battles", { p_limit: 10 });
      if (error) throw error;
      return (data as RecentBattleRow[]) ?? [];
    },
    enabled,
    refetchInterval: REFRESH_MS,
  });

  const online = useQuery({
    queryKey: ["battle-online"],
    queryFn: async (): Promise<OnlineWarriorRow[]> => {
      const { data, error } = await (supabase.rpc as any)("get_online_warriors", { p_limit: 12 });
      if (error) throw error;
      return (data as OnlineWarriorRow[]) ?? [];
    },
    enabled,
    refetchInterval: REFRESH_MS,
  });

  const global = useQuery({
    queryKey: ["battle-global"],
    queryFn: async (): Promise<GlobalBattleStats> => {
      const { data, error } = await (supabase.rpc as any)("get_global_battle_stats", {});
      if (error) throw error;
      return data as GlobalBattleStats;
    },
    refetchInterval: REFRESH_MS,
  });

  return {
    summary: summary.data,
    recent: recent.data ?? [],
    online: online.data ?? [],
    global: global.data,
    isLoading: summary.isLoading || recent.isLoading || online.isLoading || global.isLoading,
    isLoadingSummary: summary.isLoading,
    isLoadingRecent: recent.isLoading,
    isLoadingOnline: online.isLoading,
  };
}
