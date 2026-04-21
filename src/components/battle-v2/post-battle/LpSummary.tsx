import { ArrowDownRight, ArrowUpRight, Gem, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResultPlayer } from "@/hooks/useBattleResult";

interface Props {
  players: ResultPlayer[];
  callerId?: string;
}

export function LpSummary({ players, callerId }: Props) {
  const me = players.find((p) => p.user_id === callerId);
  const opp = players.find((p) => p.user_id !== callerId);

  if (!me) {
    return (
      <div className="border border-line bg-panel/60 bl-glass p-6 text-center">
        <p className="font-mono text-[11px] text-text-mute">{"// rating unavailable"}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-20" />
      <div className="relative">
        <header className="flex items-center justify-between border-b border-line/60 px-5 py-3 bl-side-stripe">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-neon" />
            <span className="font-display text-[13px] font-bold tracking-[0.2em] text-text text-glow">
              RATING ADJUSTMENT
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.14em] text-text-mute">LP FLOW</span>
        </header>

        <div className="grid grid-cols-1 gap-px bg-line/30 md:grid-cols-2">
          <LpCard player={me} accent="neon" label="YOU" />
          {opp && <LpCard player={opp} accent="ember" label="OPPONENT" />}
        </div>
      </div>
    </div>
  );
}

function LpCard({ player, accent, label }: { player: ResultPlayer; accent: "neon" | "ember"; label: string }) {
  const delta = player.elo_change ?? 0;
  const isUp = delta >= 0;
  const accentText = accent === "neon" ? "text-neon" : "text-ember";
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight;
  const fromLp = player.elo_before;
  const toLp = player.elo_after ?? player.elo_before + delta;

  const tierFloor = Math.floor(toLp / 200) * 200;
  const nextTierAt = tierFloor + 200;
  const pct = Math.max(0, Math.min(100, ((toLp - tierFloor) / (nextTierAt - tierFloor)) * 100));

  return (
    <div className="relative bg-void/50 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gem className={cn("h-3.5 w-3.5", accentText)} />
          <span className="font-display text-[12px] font-bold tracking-tight text-text">
            {label} · {player.handle}
          </span>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 border px-2 py-0.5 font-display text-[10px] font-bold tracking-[0.2em]",
            isUp ? "border-neon/50 bg-neon/10 text-neon" : "border-ember/50 bg-ember/10 text-ember",
          )}
        >
          <Arrow className="h-3 w-3" />
          {delta > 0 ? `+${delta}` : delta} LP
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-mono text-[12px] tracking-[0.14em] text-text-mute">
          {fromLp.toLocaleString()}
        </span>
        <Arrow className={cn("h-3.5 w-3.5", accentText)} />
        <span
          className={cn(
            "font-display text-[32px] font-black leading-none tabular-nums bl-count-flicker",
            accentText,
          )}
        >
          {toLp.toLocaleString()}
        </span>
        <span className="font-mono text-[10px] tracking-[0.14em] text-text-mute">LP</span>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between font-mono text-[10px] tracking-[0.14em] text-text-dim">
          <span>Tier {tierFloor}</span>
          <span>→ {nextTierAt}</span>
        </div>
        <div className="bl-bar-track h-2 overflow-hidden">
          <div
            className={cn(
              "h-full",
              accent === "neon"
                ? "bg-gradient-to-r from-electric via-neon to-neon-soft"
                : "bg-gradient-to-r from-ember via-ember-soft to-gold",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {player.xp_earned > 0 && (
        <div className="mt-4 inline-flex items-center gap-2 border px-2 py-1 font-display text-[9.5px] font-bold tracking-[0.2em] border-gold/40 bg-gold/10 text-gold">
          <Sparkles className="h-3 w-3" />
          +{player.xp_earned} XP
        </div>
      )}
    </div>
  );
}
