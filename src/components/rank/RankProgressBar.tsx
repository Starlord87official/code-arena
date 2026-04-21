import { Shield, AlertTriangle } from "lucide-react";
import type { RankTier } from "@/hooks/useRankState";

interface Props {
  tier: RankTier;
  lp: number;
  demotionShield?: number;
  decayActive?: boolean;
  nextLabel?: string;
}

const TIER_FILL: Record<RankTier, string> = {
  iron: "from-zinc-500 to-zinc-400",
  bronze: "from-amber-800 to-amber-600",
  silver: "from-slate-400 to-slate-200",
  gold: "from-yellow-500 to-amber-300",
  platinum: "from-cyan-500 to-cyan-200",
  diamond: "from-sky-500 to-sky-200",
  master: "from-fuchsia-500 to-fuchsia-300",
  grandmaster: "from-rose-500 to-rose-300",
  challenger: "from-amber-300 to-yellow-100",
};

export function RankProgressBar({ tier, lp, demotionShield = 0, decayActive, nextLabel }: Props) {
  const pct = Math.min(100, Math.max(0, lp));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.14em] text-text-dim">
        <span>{nextLabel ?? "NEXT TIER"}</span>
        <span className="flex items-center gap-2">
          {demotionShield > 0 && (
            <span className="inline-flex items-center gap-1 text-cyan-300" title="Demotion shield active">
              <Shield className="h-3 w-3" />
              {demotionShield}
            </span>
          )}
          {decayActive && (
            <span className="inline-flex items-center gap-1 text-amber-300" title="Decay imminent">
              <AlertTriangle className="h-3 w-3" />
            </span>
          )}
          <span className="text-text">{lp} / 100 LP</span>
        </span>
      </div>
      <div className="bl-bar-track h-2 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${TIER_FILL[tier]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
