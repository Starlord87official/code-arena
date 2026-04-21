import { AlertTriangle, Flame, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePromotionSeries } from "@/hooks/usePromotionSeries";
import { PromoSeriesTracker } from "@/components/battle-v2/PromoSeriesTracker";
import { useDecayWarning } from "@/hooks/useDecayWarning";
import { useRankState } from "@/hooks/useRankState";
import { RankBadge } from "@/components/rank/RankBadge";
import { RankProgressBar } from "@/components/rank/RankProgressBar";

interface Stats {
  elo: number;
  total_duels: number;
  win_rate: number;
  win_streak: number;
  next_rank: string;
  elo_to_next: number;
  rank_progress: number;
}

interface Props {
  stats?: Stats;
  isLoading: boolean;
}

export function StatsPanel({ stats, isLoading }: Props) {
  // All hooks at top — order must remain stable across renders.
  const { series } = usePromotionSeries();
  const { data: decay } = useDecayWarning();
  const { rank } = useRankState();
  return (
    <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-15" />
      <header className="relative flex items-center justify-between border-b border-line/60 px-4 py-3 bl-side-stripe">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-neon" />
          <span className="font-display text-[12px] font-bold tracking-[0.2em] text-text text-glow">
            YOUR STATS
          </span>
        </div>
      </header>

      <div className="relative p-4 space-y-3">
        {isLoading || !stats ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          </>
        ) : (
          <>
            <Row label="ELO" value={String(stats.elo)} accent="neon" big />
            <Row label="WIN RATE" value={stats.total_duels > 0 ? `${stats.win_rate}%` : "—"} />
            <Row label="TOTAL DUELS" value={String(stats.total_duels)} />
            <Row
              label="STREAK"
              value={
                stats.win_streak > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-gold" />
                    {stats.win_streak}
                  </span>
                ) : (
                  "—"
                )
              }
              accent="gold"
            />

            <div className="pt-3 border-t border-line/40">
              {rank && (
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-display text-[10px] font-bold tracking-[0.2em] text-text-mute">
                    RANK
                  </span>
                  <RankBadge tier={rank.tier} division={rank.division} lp={rank.lp} size="sm" />
                </div>
              )}
              {decay?.active && (
                <div className="mb-2 flex items-center gap-1.5 border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 font-mono text-[10px] tracking-[0.14em] text-amber-300">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  <span className="font-bold">
                    DECAY IN {decay.daysUntilDecay}D · -{decay.weeklyLoss} LP/WK
                  </span>
                </div>
              )}
              {series ? (
                <PromoSeriesTracker series={series} />
              ) : rank ? (
                <RankProgressBar
                  tier={rank.tier}
                  lp={rank.lp}
                  demotionShield={rank.demotion_shield}
                  decayActive={decay?.active}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1.5 font-mono text-[10px] tracking-[0.14em] text-text-dim">
                    <span>NEXT: {stats.next_rank}</span>
                    <span>{stats.elo_to_next} LP</span>
                  </div>
                  <div className="bl-bar-track h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-electric via-neon to-neon-soft"
                      style={{ width: `${Math.min(100, stats.rank_progress)}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent = "text",
  big,
}: {
  label: string;
  value: React.ReactNode;
  accent?: "neon" | "gold" | "ember" | "text";
  big?: boolean;
}) {
  const map = { neon: "text-neon", gold: "text-gold", ember: "text-ember", text: "text-text" };
  return (
    <div className="flex items-center justify-between">
      <span className="font-display text-[10px] font-bold tracking-[0.2em] text-text-mute">{label}</span>
      <span
        className={`font-display font-bold tabular-nums ${map[accent]} ${big ? "text-[18px]" : "text-[13px]"}`}
      >
        {value}
      </span>
    </div>
  );
}
