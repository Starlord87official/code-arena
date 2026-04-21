import { useEffect, useState } from "react";
import { Play, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onLaunch: () => void;
  duration?: number;
  isLaunching?: boolean;
}

export function CountdownLauncher({ onLaunch, duration = 5, isLaunching = false }: Props) {
  const [counting, setCounting] = useState(false);
  const [seconds, setSeconds] = useState(duration);

  useEffect(() => {
    if (!counting) return;
    if (seconds <= 0) {
      onLaunch();
      return;
    }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [counting, seconds, onLaunch]);

  const progress = counting ? ((duration - seconds) / duration) * 100 : 0;
  const isActive = counting || isLaunching;

  return (
    <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-25" />
      <div className="pointer-events-none absolute inset-0 bl-scanline opacity-[0.15]" />

      <div className="relative flex flex-col items-center gap-5 px-6 py-8">
        {isActive ? (
          <>
            <span className="font-mono text-[11px] tracking-[0.3em] text-text-mute">
              {isLaunching ? "INITIALIZING" : "LAUNCHING IN"}
            </span>
            <div className="relative flex h-40 w-40 items-center justify-center">
              <span className="absolute inset-0 rounded-full border border-neon/40 bl-pulse-ring" />
              <span className="absolute inset-3 rounded-full border border-neon/20" />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(hsl(var(--neon)) ${progress}%, transparent ${progress}%)`,
                  mask: "radial-gradient(circle, transparent 62%, #000 63%)",
                  WebkitMask: "radial-gradient(circle, transparent 62%, #000 63%)",
                }}
              />
              <span
                key={seconds}
                className={cn(
                  "font-display text-[72px] font-black leading-none tabular-nums text-neon text-glow",
                  "bl-countdown-pop",
                )}
              >
                {isLaunching ? "•" : seconds}
              </span>
            </div>
            {!isLaunching && (
              <button
                type="button"
                onClick={() => {
                  setCounting(false);
                  setSeconds(duration);
                }}
                className="inline-flex items-center gap-2 border border-blood/40 bg-blood/10 px-3 py-1.5 font-display text-[10px] font-bold tracking-[0.2em] text-blood transition hover:bg-blood/15"
              >
                <X className="h-3.5 w-3.5" />
                ABORT
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gold" />
              <span className="font-mono text-[11px] tracking-[0.24em] text-text-dim">
                ALL WARRIORS STANDBY · ARBITER READY
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCounting(true)}
              className="group relative inline-flex items-center justify-center gap-3 border-2 border-neon/80 bg-neon/10 px-10 py-4 font-display text-[16px] font-black tracking-[0.22em] text-neon transition hover:bg-neon/20 bl-pulse bl-clip-chevron glow-neon"
            >
              <Play className="h-5 w-5 fill-neon" />
              START BATTLE
              <span className="pointer-events-none absolute inset-0 bl-sweep" />
            </button>
            <span className="font-mono text-[10px] tracking-[0.18em] text-text-mute">
              {duration}-second fuse. Last call for timeouts &amp; warm-ups.
            </span>
          </>
        )}
      </div>
    </div>
  );
}
