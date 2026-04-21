import { Flag, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResultPlayer, ResultRound } from "@/hooks/useBattleResult";
import { useRankState } from "@/hooks/useRankState";
import { RankBadge } from "@/components/rank/RankBadge";

interface Props {
  rounds: ResultRound[];
  players: ResultPlayer[];
  callerId?: string;
}

export function FinalScoreboard({ rounds, players, callerId }: Props) {
  const me = players.find((p) => p.user_id === callerId);
  const opp = players.find((p) => p.user_id !== callerId);
  const myScore = me?.score ?? 0;
  const oppScore = opp?.score ?? 0;

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
            {rounds.length} ROUNDS
          </span>
        </header>

        {rounds.length === 0 ? (
          <div className="py-10 text-center">
            <Flag className="h-10 w-10 text-text-mute/50 mx-auto mb-3" />
            <p className="font-display text-[12px] font-bold tracking-[0.2em] text-text-dim">
              {"// no round data yet"}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[60px_1fr_90px_120px_90px] items-center border-b border-line/40 px-5 py-2 font-display text-[9.5px] font-bold tracking-[0.22em] text-text-mute md:grid">
              <span>ROUND</span>
              <span>PROBLEM</span>
              <span className="text-center">DIFF</span>
              <span className="text-center">FIRST SOLVE</span>
              <span className="text-right">RESULT</span>
            </div>

            <ul className="flex flex-col">
              {rounds.map((r, i) => (
                <RoundRow key={r.problem_id} r={r} idx={i + 1} callerId={callerId} players={players} />
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-line/60 bg-neon/5 px-5 py-3">
              <span className="font-display text-[10px] font-bold tracking-[0.22em] text-text-mute">
                FINAL TOTAL
              </span>
              <div className="flex items-center gap-4 font-display text-[13px] font-bold tabular-nums">
                <span className="text-neon text-glow">YOU {myScore}</span>
                <span className="text-text-mute">·</span>
                <span className="text-ember text-glow-ember">OPP {oppScore}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RoundRow({
  r,
  idx,
  callerId,
  players,
}: {
  r: ResultRound;
  idx: number;
  callerId?: string;
  players: ResultPlayer[];
}) {
  const winner = players.find((p) => p.user_id === r.winner_user_id);
  const callerWon = r.winner_user_id && r.winner_user_id === callerId;
  const noWinner = !r.winner_user_id;

  const diff = r.difficulty.toLowerCase();
  const diffTone =
    diff === "hard"
      ? "text-ember border-ember/40 bg-ember/10"
      : diff === "medium"
        ? "text-gold border-gold/40 bg-gold/10"
        : "text-neon border-neon/40 bg-neon/10";

  return (
    <li className="grid grid-cols-2 items-center gap-2 border-b border-line/30 px-5 py-3 last:border-b-0 hover:bg-void/40 md:grid-cols-[60px_1fr_90px_120px_90px]">
      <div className="flex items-center gap-2">
        <span className="font-display text-[16px] font-bold tabular-nums text-text">
          {String(idx).padStart(2, "0")}
        </span>
      </div>
      <div>
        <div className="font-display text-[13px] font-bold text-text">{r.title}</div>
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
      <div className="hidden items-center justify-center font-mono text-[11px] text-text-dim md:flex">
        {winner?.handle ?? "—"}
      </div>
      <div className="flex items-center justify-end">
        <span
          className={cn(
            "inline-flex items-center gap-1 border px-2 py-0.5 font-display text-[9.5px] font-bold tracking-[0.2em] bl-clip-chevron",
            noWinner
              ? "border-line text-text-mute bg-void/40"
              : callerWon
                ? "border-neon/50 bg-neon/10 text-neon"
                : "border-ember/50 bg-ember/10 text-ember",
          )}
        >
          <Zap className="h-3 w-3" />
          {noWinner ? "UNCLAIMED" : callerWon ? "YOU" : "OPP"}
        </span>
      </div>
    </li>
  );
}
