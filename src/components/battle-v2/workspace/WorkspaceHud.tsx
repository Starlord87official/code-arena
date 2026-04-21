import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Hash, Radio, Swords, Users, Flag, Zap, Trophy } from "lucide-react";

interface ScoreSnap {
  handle: string;
  score: number;
  problemsSolved: number;
  isSelf?: boolean;
}

interface Props {
  battleId: string;
  durationMinutes: number;
  startTime: number; // epoch ms
  opponentName?: string;
  spectators?: number;
  onForfeit: () => void;
  selfScore?: ScoreSnap;
  opponentScore?: ScoreSnap;
  problemCount?: number;
}

export function WorkspaceHud({
  battleId,
  durationMinutes,
  startTime,
  opponentName,
  spectators = 0,
  onForfeit,
  selfScore,
  opponentScore,
  problemCount,
}: Props) {
  const endTime = startTime + durationMinutes * 60 * 1000;
  const [seconds, setSeconds] = useState(() => Math.max(0, Math.floor((endTime - Date.now()) / 1000)));

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(Math.max(0, Math.floor((endTime - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const urgent = seconds < 120;
  const warn = seconds < 300;

  return (
    <header className="relative z-30 border-b border-line/70 bg-void/85 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-neon/50 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-20" />

      <div className="relative flex items-center gap-4 px-4 h-12 md:px-6">
        <Link
          to="/battle"
          className="group inline-flex items-center gap-1.5 border border-line/60 bg-panel/50 px-2.5 h-8 font-display text-[10px] font-bold tracking-[0.22em] text-text-dim transition hover:border-neon/60 hover:text-neon bl-clip-chevron"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
          EXIT
        </Link>

        <div className="h-5 w-px bg-line/60" />

        <div className="flex items-center gap-3">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-blood/60 blur-[2px]" />
            <span className="relative h-2 w-2 rounded-full bg-blood bl-flicker" />
          </span>
          <span className="font-display text-[10px] font-bold tracking-[0.28em] text-blood">LIVE</span>
          <div className="hidden items-center gap-1 text-text-mute md:flex">
            <Hash className="h-3 w-3" />
            <span className="font-mono text-[11px] tracking-[0.16em] text-text-dim">{battleId}</span>
          </div>
        </div>

        {selfScore && opponentScore && (
          <div className="hidden items-center gap-2 border border-line/60 bg-panel/50 px-2.5 h-7 md:flex bl-clip-chevron">
            <Trophy className="h-3 w-3 text-gold" />
            <span className="font-mono text-[11px] tabular-nums text-neon">{selfScore.score}</span>
            <span className="font-mono text-[10px] text-text-mute">vs</span>
            <span className="font-mono text-[11px] tabular-nums text-ember">{opponentScore.score}</span>
            {problemCount !== undefined && (
              <>
                <span className="ml-1 text-text-mute">·</span>
                <span className="font-mono text-[10px] text-text-dim tabular-nums">
                  {selfScore.problemsSolved}/{problemCount}
                </span>
              </>
            )}
          </div>
        )}

        {opponentName && (
          <div className="hidden items-center gap-1.5 border border-ember/40 bg-ember/5 px-2.5 h-7 md:flex bl-clip-chevron">
            <Zap className="h-3 w-3 text-ember" />
            <span className="font-display text-[10px] font-bold tracking-[0.2em] text-ember">vs {opponentName}</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          <Clock className={`h-4 w-4 ${urgent ? "text-blood" : warn ? "text-ember" : "text-neon"}`} />
          <div className="flex flex-col items-end leading-none">
            <span className="font-display text-[8px] font-bold tracking-[0.3em] text-text-mute">ROUND TIMER</span>
            <span
              className={`font-mono text-[18px] font-bold tabular-nums ${
                urgent ? "text-blood text-glow-blood" : warn ? "text-ember text-glow-ember" : "text-neon text-glow"
              }`}
            >
              {mm}:{ss}
            </span>
          </div>
        </div>

        <div className="hidden h-5 w-px bg-line/60 md:block" />

        {spectators > 0 && (
          <div className="hidden items-center gap-1.5 md:flex">
            <Radio className="h-3 w-3 text-neon" />
            <span className="font-mono text-[11px] text-text">
              <span className="text-neon">{spectators.toLocaleString()}</span>
            </span>
            <span className="font-mono text-[10px] text-text-mute">watching</span>
          </div>
        )}

        <div className="hidden items-center gap-1.5 lg:flex">
          <Users className="h-3 w-3 text-text-dim" />
          <span className="font-mono text-[11px] text-text-dim">2/2</span>
        </div>

        <button
          onClick={onForfeit}
          className="inline-flex items-center gap-1.5 border border-blood/40 bg-blood/10 px-2.5 h-8 font-display text-[10px] font-bold tracking-[0.2em] text-blood transition hover:bg-blood/25 bl-clip-chevron"
        >
          <Flag className="h-3 w-3" />
          FORFEIT
        </button>
      </div>
    </header>
  );
}
