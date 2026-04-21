import { Loader2, Swords, X } from "lucide-react";

interface Props {
  isSearching: boolean;
  isPending: boolean;
  waitTime?: number;
  onFind: () => void;
  onCancel: () => void;
}

export function QueueButton({ isSearching, isPending, waitTime, onFind, onCancel }: Props) {
  if (isSearching) {
    return (
      <div className="space-y-3">
        <div className="relative flex items-center gap-3 border border-neon/40 bg-neon/5 p-4 bl-glass">
          <Loader2 className="h-5 w-5 text-neon animate-spin" />
          <div>
            <div className="font-display text-[12px] font-bold tracking-[0.2em] text-neon">
              SCANNING FOR OPPONENT
            </div>
            <div className="font-mono text-[11px] text-text-dim mt-0.5">
              {waitTime !== undefined ? `${Math.floor(waitTime)}s elapsed` : "Standby…"}
            </div>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="w-full inline-flex items-center justify-center gap-2 border border-blood/40 bg-blood/10 px-4 py-3 font-display text-[11px] font-bold tracking-[0.22em] text-blood transition hover:bg-blood/20 bl-clip-chevron"
        >
          <X className="h-4 w-4" />
          ABORT SEARCH
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onFind}
      disabled={isPending}
      className="bl-btn-primary bl-clip-notch w-full inline-flex items-center justify-center gap-3 px-6 py-4 text-[13px] tracking-[0.22em] disabled:opacity-60"
    >
      {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Swords className="h-5 w-5" />}
      {isPending ? "CONNECTING…" : "FIND OPPONENT"}
    </button>
  );
}
