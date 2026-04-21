import { Flag, Timer, Zap } from "lucide-react";
import type { RoundResult } from "../types";
import { cn } from "@/lib/utils";

interface Props {
  rounds: RoundResult[];
  blueTotal: number;
  redTotal: number;
}

export function FinalScoreboard({ rounds, blueTotal, redTotal }: Props) {
  return (
    <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-20" />
      <div className="relative">
        <header className="flex items-center justify-between border-b border-line/60 px-5 py-3 bl-side-stripe">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-neon" />
            <span className="font-display text-[13px] font-bold tracking-[0.2em] text-text text-glow">
              ROUND BREAKDOWN
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.14em] text-text-mute">
            {rounds.length} ROUNDS PLAYED
          </span>
        </header>

        {rounds.length === 0 ? (
          <div className="py-10 text-center">
            <Flag className="h-10 w-10 text-text-mute/50 mx-auto mb-3" />
            <p className="font-display text-[12px] font-bold tracking-[0.2em] text-text-dim">
              NO ROUND DATA
            </p>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[60px_1fr_90px_120px_120px_90px] items-center border-b border-line/40 px-5 py-2 font-display text-[9.5px] font-bold tracking-[0.22em] text-text-mute md:grid">
              <span>ROUND</span>
              <span>PROBLEM</span>
              <span className="text-center">DIFF</span>
              <span className="text-center">BLUE TIME</span>
              <span className="text-center">RED TIME</span>
              <span className="text-right">RESULT</span>
            </div>

            <ul className="flex flex-col">
              {rounds.map((r) => (
                <RoundRow key={r.round} r={r} />
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-line/60 bg-neon/5 px-5 py-3">
              <span className="font-display text-[10px] font-bold tracking-[0.22em] text-text-mute">
                SERIES TOTAL
              </span>
              <div className="flex items-center gap-4 font-display text-[13px] font-bold tabular-nums">
                <span className="text-neon text-glow">BLUE {blueTotal}</span>
                <span className="text-text-mute">·</span>
                <span className="text-ember text-glow-ember">RED {redTotal}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RoundRow({ r }: { r: RoundResult }) {
  const blueWon = r.winner === "blue";
  const diffTone =
    r.difficulty === "Hard"
      ? "text-ember border-ember/40 bg-ember/10"
      : r.difficulty === "Medium"
        ? "text-gold border-gold/40 bg-gold/10"
        : "text-neon border-neon/40 bg-neon/10";

  return (
    <li className="grid grid-cols-2 items-center gap-2 border-b border-line/30 px-5 py-3 last:border-b-0 hover:bg-void/40 md:grid-cols-[60px_1fr_90px_120px_120px_90px]">
      <div className="flex items-center gap-2 md:col-span-1">
        <span className="font-display text-[9.5px] font-bold tracking-[0.22em] text-text-mute md:hidden">
          R{r.round}
        </span>
        <span className="hidden font-display text-[16px] font-bold tabular-nums text-text md:inline">
          {String(r.round).padStart(2, "0")}
        </span>
      </div>
      <div className="md:col-span-1">
        <div className="font-display text-[13px] font-bold text-text">{r.problem}</div>
        <div className="font-mono text-[10px] tracking-[0.12em] text-text-dim md:hidden">
          {r.difficulty} · margin {r.margin}
        </div>
      </div>
      <div className="hidden justify-center md:flex">
        <span
          className={cn(
            "inline-flex h-[18px] items-center px-1.5 font-display text-[9px] font-bold tracking-[0.2em] border bl-clip-chevron",
            diffTone,
          )}
        >
          {r.difficulty.toUpperCase()}
        </span>
      </div>
      <div
        className={cn(
          "hidden items-center justify-center gap-1 font-mono text-[12px] tabular-nums md:flex",
          blueWon ? "text-neon" : "text-text-mute",
        )}
      >
        <Timer className="h-3 w-3" />
        {r.blueTime}
      </div>
      <div
        className={cn(
          "hidden items-center justify-center gap-1 font-mono text-[12px] tabular-nums md:flex",
          !blueWon ? "text-ember" : "text-text-mute",
        )}
      >
        <Timer className="h-3 w-3" />
        {r.redTime}
      </div>
      <div className="flex items-center justify-end md:col-span-1">
        <span
          className={cn(
            "inline-flex items-center gap-1 border px-2 py-0.5 font-display text-[9.5px] font-bold tracking-[0.2em] bl-clip-chevron",
            blueWon
              ? "border-neon/50 bg-neon/10 text-neon"
              : "border-ember/50 bg-ember/10 text-ember",
          )}
        >
          <Zap className="h-3 w-3" />
          {blueWon ? "BLUE" : "RED"}
        </span>
      </div>
    </li>
  );
}
