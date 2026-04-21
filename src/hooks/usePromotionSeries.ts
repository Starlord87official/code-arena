import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PromotionSeries {
  id: string;
  user_id: string;
  season_id: string;
  kind: "division" | "tier";
  from_tier: string | null;
  from_division: string | null;
  target_tier: string;
  target_division: string | null;
  wins_required: number;
  losses_allowed: number;
  wins: number;
  losses: number;
  status: "active" | "promoted" | "failed";
  created_at: string;
  closed_at: string | null;
}

export function usePromotionSeries(userId?: string) {
  const { user } = useAuth();
  const targetId = userId ?? user?.id;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["promotion-series", targetId],
    queryFn: async () => {
      if (!targetId) return null;
      const { data, error } = await supabase.rpc("get_active_promotion_series", {
        p_user_id: targetId,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return (row as PromotionSeries | null) ?? null;
    },
    enabled: !!targetId,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (!targetId) return;
    const channel = supabase
      .channel(`promotion-series-${targetId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "promotion_series",
          filter: `user_id=eq.${targetId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["promotion-series", targetId] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetId, queryClient]);

  return { series: query.data ?? null, isLoading: query.isLoading };
}
