import { Award, Crown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResultPlayer } from "@/hooks/useBattleResult";

interface Props {
  players: ResultPlayer[];
  callerId?: string;
}

function fmtTime(sec: number): string {
  if (!sec || sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PlayerStatsTable({ players, callerId }: Props) {
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

        {players.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-display text-[12px] font-bold tracking-[0.2em] text-text-dim">
              {"// no player data yet"}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[1.4fr_70px_70px_80px_80px_80px_90px] items-center border-b border-line/40 px-5 py-2 font-display text-[9.5px] font-bold tracking-[0.22em] text-text-mute md:grid">
              <span>WARRIOR</span>
              <span className="text-center">SCORE</span>
              <span className="text-center">SOLVED</span>
              <span className="text-center">WRONG</span>
              <span className="text-center">SOLVE TIME</span>
              <span className="text-center">INTEGRITY</span>
              <span className="text-right">LP</span>
            </div>
            <ul className="flex flex-col divide-y divide-line/30">
              {players.map((p) => (
                <Row key={p.user_id} p={p} isCaller={p.user_id === callerId} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ p, isCaller }: { p: ResultPlayer; isCaller: boolean }) {
  const accent = isCaller ? "neon" : "ember";
  const isBlue = accent === "neon";
  const integrityTone =
    p.integrity_score >= 80 ? "text-neon" : p.integrity_score >= 50 ? "text-gold" : "text-blood";
  const lp = p.elo_change ?? 0;

  return (
    <li className="grid grid-cols-2 items-center gap-3 px-5 py-3 hover:bg-void/40 md:grid-cols-[1.4fr_70px_70px_80px_80px_80px_90px]">
      <div className="col-span-2 flex items-center gap-3 md:col-span-1">
        <div className="relative shrink-0">
          {isCaller && (
            <Crown className="absolute -top-3 left-1/2 h-3 w-3 -translate-x-1/2 text-gold drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
          )}
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center border font-display text-[14px] font-black bl-clip-notch",
              isBlue ? "border-neon/60 bg-neon/10 text-neon" : "border-ember/60 bg-ember/10 text-ember",
            )}
          >
            {p.handle.slice(0, 1).toUpperCase()}
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-display text-[13px] font-bold text-text">{p.handle}</span>
            {p.is_forfeit && (
              <span className="inline-flex items-center gap-1 border border-blood/50 bg-blood/10 px-1.5 py-0.5 font-display text-[9px] font-bold tracking-[0.2em] text-blood">
                <Shield className="h-2.5 w-2.5" />
                FORFEIT
              </span>
            )}
          </div>
          <div className="font-mono text-[10px] tracking-[0.1em] text-text-dim md:hidden">
            {p.score} pts · {p.problems_solved} solved · int {p.integrity_score}
          </div>
        </div>
      </div>

      <Cell value={p.score} className="hidden md:flex" tone={isBlue ? "neon" : "ember"} />
      <Cell value={p.problems_solved} className="hidden md:flex" />
      <Cell value={p.wrong_submissions} className="hidden md:flex" tone={p.wrong_submissions > 3 ? "ember" : "text"} />
      <Cell value={fmtTime(p.total_solve_time_sec)} className="hidden md:flex" mono />
      <div className={cn("hidden md:flex items-center justify-center font-display text-[13px] font-bold tabular-nums", integrityTone)}>
        {p.integrity_score}
      </div>

      <div className="col-span-2 flex items-center justify-end gap-2 md:col-span-1">
        <span
          className={cn(
            "font-display text-[13px] font-bold tabular-nums",
            lp > 0 ? "text-neon" : lp < 0 ? "text-ember" : "text-text-mute",
          )}
        >
          {lp > 0 ? "+" : ""}{lp}
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
  tone?: "neon" | "ember" | "gold" | "text";
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
