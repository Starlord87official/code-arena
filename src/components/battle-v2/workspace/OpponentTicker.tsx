import { Activity, Shield, Swords } from "lucide-react";

export interface OpponentSnapshot {
  handle: string;
  status: "CODING" | "COMPILING" | "DEBUGGING" | "CLEARED" | "STUCK" | "IDLE";
  progress: number;
  testsPassed: number;
  testsTotal: number;
  submissions: number;
  tone: "neon" | "ember" | "gold";
}

interface Props {
  teammate?: OpponentSnapshot | null;
  opponents: OpponentSnapshot[];
  momentum?: number;
}

function ProgressChip({ snap }: { snap: OpponentSnapshot }) {
  const toneBar = snap.tone === "neon" ? "bg-neon" : snap.tone === "ember" ? "bg-ember" : "bg-gold";
  const toneText = snap.tone === "neon" ? "text-neon" : snap.tone === "ember" ? "text-ember" : "text-gold";
  const statusColor =
    snap.status === "CLEARED" ? "text-neon" : snap.status === "STUCK" ? "text-blood" : snap.status === "DEBUGGING" ? "text-ember" : "text-text-dim";

  return (
    <div className="flex min-w-[220px] items-center gap-3 border border-line/60 bg-panel/50 px-3 h-9 bl-clip-chevron">
      <span className={`relative inline-flex h-2 w-2 rounded-full ${toneBar} bl-pulse`} />
      <div className="flex flex-col leading-none">
        <span className={`font-display text-[10px] font-bold tracking-[0.2em] ${toneText}`}>
          {snap.handle.toUpperCase()}
        </span>
        <span className={`font-mono text-[9px] tracking-[0.14em] ${statusColor}`}>
          {snap.status} · {snap.testsPassed}/{snap.testsTotal}
        </span>
      </div>
      <div className="ml-auto flex flex-col items-end gap-1">
        <span className="font-mono text-[10px] text-text-dim tabular-nums">{snap.progress}%</span>
        <div className="h-1 w-16 overflow-hidden bg-line/50">
          <div className={`h-full ${toneBar} transition-all duration-500`} style={{ width: `${snap.progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export function OpponentTicker({ teammate, opponents, momentum = 50 }: Props) {
  return (
    <div className="relative z-20 flex items-center gap-3 border-b border-line/60 bg-void/70 backdrop-blur-md px-4 py-2 md:px-6 overflow-x-auto">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-15" />

      {teammate && (
        <>
          <div className="relative flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-neon" />
            <span className="font-display text-[10px] font-bold tracking-[0.24em] text-text">ALLY</span>
          </div>
          <ProgressChip snap={teammate} />
        </>
      )}

      <div className="mx-2 flex items-center gap-2 text-text-mute">
        <Swords className="h-3.5 w-3.5 text-blood bl-flicker" />
        <span className="font-display text-[10px] font-bold tracking-[0.3em] text-blood">VS</span>
      </div>

      <div className="relative flex items-center gap-2">
        <Activity className="h-3.5 w-3.5 text-ember" />
        <span className="font-display text-[10px] font-bold tracking-[0.24em] text-text">ENEMY</span>
      </div>

      <div className="flex items-center gap-2">
        {opponents.length === 0 ? (
          <span className="font-mono text-[10px] text-text-mute">No opponent data</span>
        ) : (
          opponents.map((o) => <ProgressChip key={o.handle} snap={o} />)
        )}
      </div>

      <div className="ml-auto hidden items-center gap-2 lg:flex">
        <span className="font-display text-[10px] font-bold tracking-[0.24em] text-text-mute">MOMENTUM</span>
        <div className="relative h-1.5 w-40 overflow-hidden bg-line/50">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon/90 to-neon/30"
            style={{ width: `${momentum}%` }}
          />
          <div
            className="absolute inset-y-0 right-0 bg-gradient-to-l from-ember/90 to-ember/30"
            style={{ width: `${100 - momentum}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-neon">{momentum}%</span>
      </div>
    </div>
  );
}
