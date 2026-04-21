import { Crown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RankTier, RankDivision } from "@/hooks/useRankState";

interface Props {
  tier?: RankTier | null;
  division?: RankDivision | null;
  lp?: number | null;
  size?: "sm" | "md" | "lg";
  showLp?: boolean;
  className?: string;
}

const TIER_STYLES: Record<RankTier, { text: string; border: string; bg: string; glow: string }> = {
  iron:        { text: "text-zinc-400",   border: "border-zinc-500/40",  bg: "bg-zinc-500/10",  glow: "" },
  bronze:      { text: "text-amber-700",  border: "border-amber-700/50", bg: "bg-amber-700/10", glow: "" },
  silver:      { text: "text-slate-300",  border: "border-slate-300/50", bg: "bg-slate-300/10", glow: "" },
  gold:        { text: "text-gold",       border: "border-gold/50",      bg: "bg-gold/10",      glow: "shadow-[0_0_12px_rgba(251,191,36,0.25)]" },
  platinum:    { text: "text-cyan-300",   border: "border-cyan-300/50",  bg: "bg-cyan-300/10",  glow: "shadow-[0_0_14px_rgba(103,232,249,0.3)]" },
  diamond:     { text: "text-sky-300",    border: "border-sky-300/60",   bg: "bg-sky-300/10",   glow: "shadow-[0_0_16px_rgba(125,211,252,0.35)]" },
  master:      { text: "text-fuchsia-300",border: "border-fuchsia-300/60",bg: "bg-fuchsia-300/10",glow: "shadow-[0_0_18px_rgba(240,171,252,0.4)]" },
  grandmaster: { text: "text-rose-300",   border: "border-rose-300/60",  bg: "bg-rose-300/10",  glow: "shadow-[0_0_20px_rgba(253,164,175,0.45)]" },
  challenger:  { text: "text-amber-200",  border: "border-amber-200/70", bg: "bg-amber-200/10", glow: "shadow-[0_0_24px_rgba(254,240,138,0.5)]" },
};

export function RankBadge({ tier, division, lp, size = "md", showLp = true, className }: Props) {
  const t = (tier ?? "iron") as RankTier;
  const d = (division ?? "IV") as RankDivision;
  const style = TIER_STYLES[t];
  const showCrown = t === "challenger" || t === "grandmaster";

  const dims =
    size === "sm"
      ? "h-5 px-1.5 text-[9px] gap-1"
      : size === "lg"
        ? "h-9 px-3 text-[12px] gap-2"
        : "h-7 px-2 text-[10px] gap-1.5";

  const iconSize = size === "sm" ? "h-2.5 w-2.5" : size === "lg" ? "h-4 w-4" : "h-3 w-3";

  return (
    <span
      className={cn(
        "inline-flex items-center border font-display font-bold tracking-[0.18em] uppercase bl-clip-chevron",
        dims,
        style.border,
        style.bg,
        style.text,
        style.glow,
        className,
      )}
      title={`${t.toUpperCase()} ${d}${typeof lp === "number" ? ` · ${lp} LP` : ""}`}
    >
      {showCrown ? <Crown className={iconSize} /> : <Shield className={iconSize} />}
      <span>{t.slice(0, 4).toUpperCase()}</span>
      <span className="opacity-80">{d}</span>
      {showLp && typeof lp === "number" && (
        <span className="ml-1 font-mono opacity-90">{lp}</span>
      )}
    </span>
  );
}
