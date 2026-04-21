import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromotionSeries } from "@/hooks/usePromotionSeries";

interface Props {
  series: PromotionSeries;
  compact?: boolean;
}

const TIER_LABEL: Record<string, string> = {
  bronze: "BRONZE",
  silver: "SILVER",
  gold: "GOLD",
  platinum: "PLATINUM",
  diamond: "DIAMOND",
  master: "MASTER",
  grandmaster: "GRANDMASTER",
  challenger: "CHALLENGER",
};

export function PromoSeriesTracker({ series, compact }: Props) {
  const total = series.wins_required + series.losses_allowed;
  const played = series.wins + series.losses;
  const winsLeft = Math.max(0, series.wins_required - series.wins);
  const lossesLeft = Math.max(0, series.losses_allowed - series.losses);

  const pips: ("win" | "loss" | "pending")[] = [];
  for (let i = 0; i < series.wins; i++) pips.push("win");
  for (let i = 0; i < series.losses; i++) pips.push("loss");
  for (let i = played; i < total; i++) pips.push("pending");

  const targetLabel =
    series.kind === "tier"
      ? `${TIER_LABEL[series.target_tier] ?? series.target_tier.toUpperCase()} ${series.target_division ?? "IV"}`
      : `${TIER_LABEL[series.target_tier] ?? series.target_tier.toUpperCase()} ${series.target_division ?? ""}`;

  return (
    <div
      className={cn(
        "relative border border-gold/40 bg-gradient-to-r from-gold/10 via-panel/60 to-ember/10 px-3 py-2",
        compact ? "" : "py-3",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-gold" />
          <span className="font-display text-[10px] font-bold tracking-[0.2em] text-gold">
            PROMO · {series.kind === "tier" ? "BO5" : "BO3"}
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-[0.14em] text-text-mute">
          → {targetLabel}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {pips.map((pip, i) => (
          <span
            key={i}
            className={cn(
              "inline-block h-2.5 w-2.5 rounded-full border",
              pip === "win" && "border-neon bg-neon shadow-[0_0_8px_hsl(var(--neon)/0.6)]",
              pip === "loss" && "border-ember bg-ember shadow-[0_0_8px_hsl(var(--ember)/0.6)]",
              pip === "pending" && "border-line bg-void",
            )}
          />
        ))}
        <span className="ml-auto font-display text-[10px] font-bold tracking-[0.18em] text-text-dim">
          {winsLeft > 0 ? `WIN ${winsLeft} MORE` : "LOCKED"}
          {lossesLeft === 0 && winsLeft > 0 && <span className="text-ember"> · MATCH POINT</span>}
        </span>
      </div>
    </div>
  );
}
