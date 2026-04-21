import { FileSearch, Home, Repeat, Share2 } from "lucide-react";

interface Props {
  onRematch?: () => void;
  onDetails?: () => void;
  onShare?: () => void;
  onExit: () => void;
}

export function PostActions({ onRematch, onDetails, onShare, onExit }: Props) {
  return (
    <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-20" />
      <div className="relative flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-5 items-center border border-neon/40 bg-neon/10 px-1.5 font-display text-[9px] font-bold tracking-[0.22em] text-neon">
            ROUTINES
          </span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-text-dim">
            {"// choose your next move"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onRematch && (
            <button
              onClick={onRematch}
              className="group relative inline-flex items-center gap-2 border border-neon/70 bg-neon/10 px-5 py-2.5 font-display text-[11.5px] font-bold tracking-[0.22em] text-neon transition hover:bg-neon/20 bl-clip-chevron glow-neon"
            >
              <Repeat className="h-4 w-4" />
              REMATCH
              <span className="pointer-events-none absolute inset-0 bl-sweep" />
            </button>
          )}

          {onDetails && (
            <button
              onClick={onDetails}
              className="inline-flex items-center gap-2 border border-line bg-void/60 px-4 py-2.5 font-display text-[11px] font-bold tracking-[0.22em] text-text-dim transition hover:border-line-bright hover:text-text bl-clip-chevron"
            >
              <FileSearch className="h-4 w-4" />
              VIEW DETAILS
            </button>
          )}

          {onShare && (
            <button
              onClick={onShare}
              className="inline-flex items-center gap-2 border border-line bg-void/60 px-4 py-2.5 font-display text-[11px] font-bold tracking-[0.22em] text-text-dim transition hover:border-line-bright hover:text-text bl-clip-chevron"
            >
              <Share2 className="h-4 w-4" />
              SHARE
            </button>
          )}

          <button
            onClick={onExit}
            className="inline-flex items-center gap-2 border border-blood/40 bg-blood/10 px-4 py-2.5 font-display text-[11px] font-bold tracking-[0.22em] text-blood transition hover:bg-blood/15 bl-clip-chevron"
          >
            <Home className="h-4 w-4" />
            EXIT ARENA
          </button>
        </div>
      </div>
    </div>
  );
}
