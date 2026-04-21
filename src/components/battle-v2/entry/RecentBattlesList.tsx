import { Crown, Shield, Swords } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecentBattleRow } from "@/hooks/useBattleEntryData";
import { cn } from "@/lib/utils";

interface Props {
  battles: RecentBattleRow[];
  isLoading: boolean;
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function RecentBattlesList({ battles, isLoading }: Props) {
  return (
    <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-15" />
      <header className="relative flex items-center justify-between border-b border-line/60 px-5 py-3 bl-side-stripe">
        <div className="flex items-center gap-2">
          <Swords className="h-4 w-4 text-ember" />
          <span className="font-display text-[13px] font-bold tracking-[0.2em] text-text text-glow">
            RECENT BATTLES
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-[0.14em] text-text-mute">
          LAST 10
        </span>
      </header>

      <div className="relative p-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-line/40 bg-void/40">
                <Skeleton className="h-6 w-6" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        ) : battles.length === 0 ? (
          <div className="py-10 text-center">
            <Swords className="h-10 w-10 text-text-mute/50 mx-auto mb-3" />
            <p className="font-display text-[12px] font-bold tracking-[0.2em] text-text-dim">
              NO BATTLES YET
            </p>
            <p className="font-mono text-[10px] text-text-mute mt-1">
              {"// no data yet — win your first match."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {battles.map((b) => {
              const isWin = b.result === "win";
              const isLoss = b.result === "loss";
              const elo = b.elo_change ?? 0;
              return (
                <li
                  key={b.match_id}
                  className={cn(
                    "flex items-center gap-3 border bg-void/40 p-3",
                    isWin && "border-neon/40 bg-neon/5",
                    isLoss && "border-ember/40 bg-ember/5",
                    !isWin && !isLoss && "border-line/50",
                  )}
                >
                  {isWin ? (
                    <Crown className="h-5 w-5 text-gold" />
                  ) : (
                    <Shield className={cn("h-5 w-5", isLoss ? "text-ember" : "text-text-mute")} />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[12px] font-bold text-text">
                      vs {b.opponent_handle}
                    </div>
                    <div className="font-mono text-[10px] text-text-dim mt-0.5">
                      {formatRelative(b.ended_at)} · {b.score_self}-{b.score_opp}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "font-display text-[11px] font-bold tracking-[0.2em]",
                      isWin ? "text-neon" : isLoss ? "text-ember" : "text-text-mute",
                    )}
                  >
                    {isWin ? "WIN" : isLoss ? "LOSS" : "DRAW"}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[11px] font-bold tabular-nums w-14 text-right",
                      elo > 0 ? "text-neon" : elo < 0 ? "text-ember" : "text-text-mute",
                    )}
                  >
                    {elo > 0 ? "+" : ""}
                    {elo} LP
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
