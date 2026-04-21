import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { tierIndex, divisionIndex, type RankTier, type RankDivision } from "@/hooks/useRankState";

interface Snapshot {
  tier: RankTier;
  division: RankDivision;
  lp: number;
  demotion_shield: number;
  placements_remaining: number;
  decay_bank_days: number;
}

const STORAGE_KEY = "rank-state-last-seen";

function readLastSeen(userId: string): Snapshot | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${userId}`);
    return raw ? (JSON.parse(raw) as Snapshot) : null;
  } catch {
    return null;
  }
}

function writeLastSeen(userId: string, snap: Snapshot) {
  try {
    localStorage.setItem(`${STORAGE_KEY}:${userId}`, JSON.stringify(snap));
  } catch {
    /* ignore */
  }
}

function diffAndToast(prev: Snapshot | null, next: Snapshot) {
  if (!prev) return; // first sighting — never toast
  const prevT = tierIndex(prev.tier);
  const nextT = tierIndex(next.tier);
  const prevD = divisionIndex(prev.division);
  const nextD = divisionIndex(next.division);

  const tierLabel = (s: Snapshot) => `${s.tier.toUpperCase()} ${s.division}`;

  if (nextT > prevT || (nextT === prevT && nextD > prevD)) {
    toast.success(`Promoted to ${tierLabel(next)}`, {
      description: `+${Math.max(0, next.lp - 0)} LP carried`,
    });
  } else if (nextT < prevT || (nextT === prevT && nextD < prevD)) {
    toast.error(`Demoted to ${tierLabel(next)}`, {
      description: "Win your next match to recover.",
    });
  }

  if (prev.demotion_shield > 0 && next.demotion_shield < prev.demotion_shield) {
    toast.message("Demotion shield consumed", {
      description: `${next.demotion_shield} shield charge${next.demotion_shield === 1 ? "" : "s"} remaining.`,
    });
  }

  if (prev.placements_remaining > 0 && next.placements_remaining < prev.placements_remaining) {
    const done = 5 - next.placements_remaining;
    toast.message(`Placement match ${done} / 5`, {
      description: next.placements_remaining === 0 ? "Placements complete!" : undefined,
    });
  }
}

/**
 * Mounts once at the App root. Subscribes to rank_states + promotion_series
 * and fires deduped toasts for tier transitions.
 */
export function useRankToasts() {
  const { user } = useAuth();
  const lastPromoStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const uid = user.id;

    // Hydrate baseline snapshot on mount (do NOT toast on first read)
    let primed = false;
    const prime = async () => {
      const { data } = await supabase
        .from("rank_states")
        .select("tier, division, lp, demotion_shield, placements_remaining, decay_bank_days")
        .eq("user_id", uid)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        const snap = data as Snapshot;
        if (!readLastSeen(uid)) writeLastSeen(uid, snap);
      }
      primed = true;
    };
    prime();

    const rankChannel = supabase
      .channel(`rank-toasts-${uid}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rank_states",
          filter: `user_id=eq.${uid}`,
        },
        (payload) => {
          if (!primed) return;
          const next = payload.new as Snapshot;
          const prev = readLastSeen(uid);
          diffAndToast(prev, next);
          writeLastSeen(uid, next);
        },
      )
      .subscribe();

    const promoChannel = supabase
      .channel(`promo-toasts-${uid}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "promotion_series",
          filter: `user_id=eq.${uid}`,
        },
        (payload) => {
          const row = (payload.new ?? payload.old) as { status?: string; target_tier?: string; target_division?: string | null } | null;
          if (!row?.status) return;
          if (row.status === lastPromoStatusRef.current) return;
          lastPromoStatusRef.current = row.status;

          const target = `${row.target_tier?.toUpperCase() ?? ""} ${row.target_division ?? ""}`.trim();
          if (payload.eventType === "INSERT") {
            toast.message(`Promotion series started`, { description: `Win 2 of 3 to reach ${target}.` });
          } else if (row.status === "promoted") {
            toast.success(`Promotion series passed`, { description: `Welcome to ${target}.` });
          } else if (row.status === "failed") {
            toast.error(`Promotion series failed`, { description: `LP refunded — try again soon.` });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(rankChannel);
      supabase.removeChannel(promoChannel);
    };
  }, [user?.id]);
}
