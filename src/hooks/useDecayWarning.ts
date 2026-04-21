import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const GRACE_BY_TIER: Record<string, { graceDays: number; weeklyLoss: number }> = {
  platinum: { graceDays: 21, weeklyLoss: 25 },
  diamond: { graceDays: 14, weeklyLoss: 35 },
  master: { graceDays: 10, weeklyLoss: 50 },
  grandmaster: { graceDays: 7, weeklyLoss: 75 },
  challenger: { graceDays: 7, weeklyLoss: 75 },
};

export interface DecayWarning {
  active: boolean;
  daysUntilDecay: number;
  weeklyLoss: number;
  decayBankDays: number;
  tier: string;
}

/**
 * Returns a decay warning when a Plat+ user is within 3 days of grace expiry
 * (and has no decay bank to absorb it).
 */
export function useDecayWarning() {
  const { user } = useAuth();

  return useQuery<DecayWarning | null>({
    queryKey: ["decay-warning", user?.id],
    enabled: !!user?.id,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rank_states")
        .select("tier, last_match_at, decay_bank_days")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data || !data.last_match_at) return null;

      const cfg = GRACE_BY_TIER[data.tier];
      if (!cfg) return null;

      const lastMatchMs = new Date(data.last_match_at).getTime();
      const daysSince = (Date.now() - lastMatchMs) / 86_400_000;
      const daysUntilDecay = Math.ceil(cfg.graceDays - daysSince);

      // Warn within 3 days of expiry, and only if bank is empty
      const bank = data.decay_bank_days ?? 0;
      if (daysUntilDecay > 3 || daysUntilDecay < -2) return null;
      if (bank > 0 && daysUntilDecay >= 0) return null;

      return {
        active: true,
        daysUntilDecay: Math.max(0, daysUntilDecay),
        weeklyLoss: cfg.weeklyLoss,
        decayBankDays: bank,
        tier: data.tier,
      };
    },
  });
}
