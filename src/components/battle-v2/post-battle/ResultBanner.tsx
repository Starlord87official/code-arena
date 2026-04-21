import { Crown, Medal, Sparkles, Trophy } from "lucide-react";

interface Props {
  outcome: "win" | "loss" | "draw";
  callerName: string;
  opponentName: string;
  finalScore: string;
  duration: string;
  lpDelta: number; // signed for caller
}

export function ResultBanner({ outcome, callerName, opponentName, finalScore, duration, lpDelta }: Props) {
  const isDraw = outcome === "draw";
  const callerWon = outcome === "win";

  const winnerName = isDraw ? callerName : callerWon ? callerName : opponentName;
  const loserName = isDraw ? opponentName : callerWon ? opponentName : callerName;
  const lpGain = callerWon ? Math.abs(lpDelta) : 0;
  const lpLoss = !callerWon && !isDraw ? Math.abs(lpDelta) : 0;

  return (
    <div className="relative overflow-hidden border border-neon/40 bg-panel/60 bl-glass bl-corners bl-result-in">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-25" />
      <div className="pointer-events-none absolute inset-0 bl-scanline opacity-[0.15]" />
      <div className="pointer-events-none absolute -right-40 -top-32 h-[380px] w-[380px] rounded-full bg-neon/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 -bottom-32 h-[320px] w-[320px] rounded-full bg-gold/15 blur-3xl" />

      <div className="relative grid grid-cols-1 gap-6 px-6 py-8 md:grid-cols-[1fr_auto_1fr] md:items-center md:py-10">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-gold drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
            <span className="font-display text-[10px] font-bold tracking-[0.3em] text-gold">
              {isDraw ? "STALEMATE" : "CHAMPION"}
            </span>
          </div>
          <h2 className="mt-2 font-display text-[28px] font-black leading-none tracking-tight text-neon text-glow md:text-[36px]">
            {isDraw ? "DRAW" : callerWon ? "VICTORY" : "DEFEAT"}
          </h2>
          <p className="mt-2 font-display text-[15px] font-bold tracking-tight text-text">{winnerName}</p>
          {!isDraw && lpGain > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-2 py-1 font-display text-[10px] font-bold tracking-[0.2em] text-gold">
              <Sparkles className="h-3 w-3" />
              +{lpGain} LP
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.3em] text-text-mute">FINAL SCORE</span>
          <div className="relative">
            <span className="font-display text-[68px] font-black leading-none tabular-nums text-text md:text-[84px]">
              {finalScore}
            </span>
            <span className="pointer-events-none absolute inset-0 bl-shine" />
          </div>
          <div className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.18em] text-text-dim">
            <Trophy className="h-3.5 w-3.5 text-neon" />
            <span>
              MATCH TIME <span className="text-text">{duration}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center md:items-end md:text-right">
          <div className="flex items-center gap-2">
            <Medal className="h-4 w-4 text-ember" />
            <span className="font-display text-[10px] font-bold tracking-[0.3em] text-ember">
              {isDraw ? "DEADLOCK" : "RUNNER-UP"}
            </span>
          </div>
          <h2 className="mt-2 font-display text-[28px] font-black leading-none tracking-tight text-ember text-glow-ember md:text-[36px]">
            {isDraw ? "TIE" : callerWon ? "OUTPLAYED" : "REGROUP"}
          </h2>
          <p className="mt-2 font-display text-[15px] font-bold tracking-tight text-text">{loserName}</p>
          {!isDraw && lpLoss > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 border border-ember/40 bg-ember/10 px-2 py-1 font-display text-[10px] font-bold tracking-[0.2em] text-ember">
              −{lpLoss} LP · REGROUP
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
