import { Award, Crown } from "lucide-react";
import type { Accent } from "../types";
import { cn } from "@/lib/utils";

export interface PlayerPerf {
  handle: string;
  initial: string;
  isCaptain?: boolean;
  accent: "neon" | "ember";
  solved: number;
  submissions: number;
  attempts: number;
  accuracy: number;
  wpm: number;
  avgTime: string;
  impact: number;
  mvp?: boolean;
}

interface Props {
  rows: PlayerPerf[];
}

export function PlayerStatsTable({ rows }: Props) {
  return (
    <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-20" />
      <div className="relative">
        <header className="flex items-center justify-between border-b border-line/60 px-5 py-3 bl-side-stripe">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-neon" />
            <span className="font-display text-[13px] font-bold tracking-[0.2em] text-text text-glow">
              PERFORMANCE STATS
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.14em] text-text-mute">PER WARRIOR</span>
        </header>

        {rows.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-display text-[12px] font-bold tracking-[0.2em] text-text-dim">
              NO PLAYER DATA
            </p>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[1.4fr_70px_70px_90px_70px_80px_1fr] items-center border-b border-line/40 px-5 py-2 font-display text-[9.5px] font-bold tracking-[0.22em] text-text-mute md:grid">
              <span>WARRIOR</span>
              <span className="text-center">SOLVED</span>
              <span className="text-center">SUBS</span>
              <span className="text-center">ACCURACY</span>
              <span className="text-center">WPM</span>
              <span className="text-center">AVG TIME</span>
              <span className="text-right">IMPACT</span>
            </div>
            <ul className="flex flex-col divide-y divide-line/30">
              {rows.map((r) => (
                <Row key={r.handle} p={r} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ p }: { p: PlayerPerf }) {
  const isBlue = p.accent === "neon";
  return (
    <li className="grid grid-cols-2 items-center gap-3 px-5 py-3 hover:bg-void/40 md:grid-cols-[1.4fr_70px_70px_90px_70px_80px_1fr]">
      <div className="col-span-2 flex items-center gap-3 md:col-span-1">
        <div className="relative shrink-0">
          {p.isCaptain && (
            <Crown className="absolute -top-3 left-1/2 h-3 w-3 -translate-x-1/2 text-gold drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
          )}
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center border font-display text-[14px] font-black bl-clip-notch",
              isBlue ? "border-neon/60 bg-neon/10 text-neon" : "border-ember/60 bg-ember/10 text-ember",
            )}
          >
            {p.initial}
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-display text-[13px] font-bold text-text">{p.handle}</span>
            {p.mvp && (
              <span className="inline-flex items-center gap-1 border border-gold/50 bg-gold/10 px-1.5 py-0.5 font-display text-[9px] font-bold tracking-[0.2em] text-gold">
                MVP
              </span>
            )}
          </div>
          <div className="font-mono text-[10px] tracking-[0.1em] text-text-dim md:hidden">
            {p.solved} solved · {p.accuracy}% acc · {p.wpm} wpm
          </div>
        </div>
      </div>

      <Cell value={p.solved} className="hidden md:flex" />
      <Cell value={`${p.submissions}/${p.attempts}`} className="hidden md:flex" />
      <Cell
        value={`${p.accuracy}%`}
        tone={p.accuracy >= 90 ? "neon" : p.accuracy >= 75 ? "text" : "ember"}
        className="hidden md:flex"
      />
      <Cell value={p.wpm} className="hidden md:flex" />
      <Cell value={p.avgTime} className="hidden md:flex" mono />

      <div className="col-span-2 flex items-center gap-2 md:col-span-1">
        <div className="bl-bar-track relative h-1.5 flex-1 overflow-hidden">
          <div
            className={cn(
              "h-full",
              isBlue
                ? "bg-gradient-to-r from-electric via-neon to-neon-soft"
                : "bg-gradient-to-r from-ember via-ember-soft to-gold",
            )}
            style={{ width: `${p.impact}%` }}
          />
        </div>
        <span
          className={cn(
            "w-9 text-right font-mono text-[12px] font-bold tabular-nums",
            isBlue ? "text-neon" : "text-ember",
          )}
        >
          {p.impact}
        </span>
      </div>
    </li>
  );
}

function Cell({
  value,
  tone = "text",
  mono = false,
  className,
}: {
  value: string | number;
  tone?: Accent | "text";
  mono?: boolean;
  className?: string;
}) {
  const map = { neon: "text-neon", ember: "text-ember", gold: "text-gold", text: "text-text" };
  return (
    <div
      className={cn(
        "items-center justify-center text-center font-display text-[13px] font-bold tabular-nums",
        mono && "font-mono text-[12px]",
        map[tone],
        className,
      )}
    >
      {value}
    </div>
  );
}
