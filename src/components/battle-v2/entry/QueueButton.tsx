import { Loader2, Lock, Swords, X } from "lucide-react";
import { useQueueLockout, formatLockoutTime } from "@/hooks/useQueueLockout";

interface Props {
  isSearching: boolean;
  isPending: boolean;
  waitTime?: number;
  onFind: () => void;
  onCancel: () => void;
}

export function QueueButton({ isSearching, isPending, waitTime, onFind, onCancel }: Props) {
  const { lockout, secondsRemaining } = useQueueLockout();

  if (isSearching) {
    const widening = (waitTime ?? 0) > 30;
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
              {widening && <span className="ml-2 text-gold">· widening search</span>}
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

  if (lockout && secondsRemaining > 0) {
    const reasonLabel = lockout.reason === "dodge" ? "DODGE PENALTY" : "QUEUE LOCKED";
    const lpPenalty = lockout.meta?.lp_penalty;
    return (
      <div className="space-y-2">
        <button
          disabled
          className="w-full inline-flex items-center justify-center gap-3 border border-blood/40 bg-blood/5 px-6 py-4 font-display text-[13px] font-bold tracking-[0.22em] text-blood/80 opacity-80 cursor-not-allowed bl-clip-notch"
        >
          <Lock className="h-5 w-5" />
          LOCKED {formatLockoutTime(secondsRemaining)}
        </button>
        <div className="text-center font-mono text-[10px] tracking-[0.14em] text-text-dim">
          {reasonLabel}
          {lpPenalty ? ` · −${lpPenalty} LP` : ""}
        </div>
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
