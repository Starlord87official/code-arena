import { Loader2, Swords, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModeId } from "./ModeGrid";

interface Props {
  modeLabel: string;
  modeAccent: "neon" | "ember" | "gold";
  formatLabel: string;
  regionCode: string;
  stakesLabel: string;
  isSearching: boolean;
  isPending: boolean;
  waitTime?: number;
  onFind: () => void;
  onCancel: () => void;
}

export function LoadoutBar({
  modeLabel,
  modeAccent,
  formatLabel,
  regionCode,
  stakesLabel,
  isSearching,
  isPending,
  waitTime,
  onFind,
  onCancel,
}: Props) {
  const accentMap = {
    neon: { border: "border-neon/60", bg: "bg-neon/10", text: "text-neon" },
    ember: { border: "border-ember/60", bg: "bg-ember/10", text: "text-ember" },
    gold: { border: "border-gold/60", bg: "bg-gold/10", text: "text-gold" },
  };
  const a = accentMap[modeAccent];

  return (
    <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-15" />
      <div className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-neon/0 via-neon/5 to-ember/5" />

      <div className="relative grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-2">
          <div className="font-display text-[11px] font-bold tracking-[0.22em] text-text-mute">
            FINAL LOADOUT
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip className={cn("border", a.border, a.bg, a.text)}>{modeLabel}</Chip>
            <Chip>{formatLabel}</Chip>
            <Chip>{regionCode}</Chip>
            <Chip className="border-gold/50 bg-gold/10 text-gold">{stakesLabel}</Chip>
          </div>
        </div>

        {isSearching ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-neon/50 bg-neon/5 px-4 py-3">
              <Loader2 className="h-4 w-4 text-neon animate-spin" />
              <div>
                <div className="font-display text-[11px] font-bold tracking-[0.22em] text-neon">
                  SCANNING…
                </div>
                <div className="font-mono text-[10px] text-text-dim">
                  {waitTime !== undefined ? `${Math.floor(waitTime)}s elapsed` : "Standby"}
                </div>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 border border-blood/50 bg-blood/10 px-4 py-3 font-display text-[11px] font-bold tracking-[0.22em] text-blood hover:bg-blood/20 bl-clip-chevron"
            >
              <X className="h-4 w-4" />
              ABORT
            </button>
          </div>
        ) : (
          <button
            onClick={onFind}
            disabled={isPending}
            className="bl-btn-primary bl-clip-notch inline-flex items-center justify-center gap-3 px-8 py-4 text-[13px] tracking-[0.22em] disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Swords className="h-5 w-5" />}
            {isPending ? "CONNECTING…" : "FIND MATCH"}
            <span className="font-mono text-[10px] tracking-[0.18em] opacity-70">[ ENTER ]</span>
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center border border-line/60 bg-void/60 px-2.5 py-1 font-display text-[11px] font-bold tracking-[0.22em] text-text bl-clip-chevron",
      className,
    )}>
      {children}
    </span>
  );
}
