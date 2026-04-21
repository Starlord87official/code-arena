import { useEffect } from "react";
import { Check, TriangleAlert, Timer, Skull, X, Loader2 } from "lucide-react";
import type { Verdict } from "../types";

const MAP: Record<
  Exclude<Verdict, "PENDING">,
  { title: string; sub: string; accent: string; border: string; bg: string; text: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  AC: { title: "ACCEPTED", sub: "All test cases passed", accent: "#00f0ff", border: "border-neon/70", bg: "bg-neon/10", text: "text-neon", Icon: Check },
  WA: { title: "WRONG ANSWER", sub: "Output does not match expected", accent: "#ff6b00", border: "border-ember/70", bg: "bg-ember/10", text: "text-ember", Icon: TriangleAlert },
  TLE: { title: "TIME LIMIT EXCEEDED", sub: "Your solution is too slow", accent: "#ffc85a", border: "border-gold/70", bg: "bg-gold/10", text: "text-gold", Icon: Timer },
  RE: { title: "RUNTIME ERROR", sub: "Unhandled exception", accent: "#ff3355", border: "border-blood/70", bg: "bg-blood/10", text: "text-blood", Icon: Skull },
};

interface Props {
  verdict: Verdict | null;
  onClose: () => void;
  passed?: number;
  total?: number;
  runtimeMs?: number;
  lpDelta?: number;
}

export function VerdictOverlay({ verdict, onClose, passed = 0, total = 0, runtimeMs, lpDelta }: Props) {
  useEffect(() => {
    if (!verdict || verdict === "PENDING") return;
    const id = setTimeout(onClose, 3400);
    return () => clearTimeout(id);
  }, [verdict, onClose]);

  if (!verdict) return null;

  // Pending — server is judging
  if (verdict === "PENDING") {
    return (
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center" role="status" aria-live="polite">
        <div
          className="absolute inset-0 bl-result-in"
          style={{
            background: `radial-gradient(60% 50% at 50% 50%, #00f0ff22 0%, transparent 60%), rgba(4,8,17,0.65)`,
            backdropFilter: "blur(4px)",
          }}
        />
        <div className="absolute inset-0 bl-scanline opacity-40" />
        <div
          className="pointer-events-auto relative border border-neon/60 bg-neon/5 bl-result-in bl-corners max-w-md px-10 py-7"
          style={{ clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)" }}
        >
          <div className="flex items-center gap-5">
            <div className="relative flex h-14 w-14 items-center justify-center border border-neon/60 bg-neon/10">
              <span className="absolute inset-0 bl-pulse-ring" style={{ boxShadow: `0 0 30px #00f0ff66 inset, 0 0 30px #00f0ff66` }} />
              <Loader2 className="relative h-6 w-6 animate-spin text-neon" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-[10px] font-bold tracking-[0.3em] text-text-mute">VERDICT</span>
              <h2
                className="font-display text-2xl md:text-3xl font-bold leading-none tracking-tight text-neon"
                style={{ textShadow: `0 0 20px #00f0ff80` }}
              >
                JUDGING…
              </h2>
              <p className="mt-1 font-mono text-[12px] text-text-dim">Server is evaluating your submission</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cfg = MAP[verdict];
  const { Icon } = cfg;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center" role="status" aria-live="polite">
      <div
        className="absolute inset-0 bl-result-in"
        style={{
          background: `radial-gradient(60% 50% at 50% 50%, ${cfg.accent}22 0%, transparent 60%), rgba(4,8,17,0.75)`,
          backdropFilter: "blur(6px)",
        }}
      />
      <div className="absolute inset-0 bl-scanline opacity-50" />

      <div
        className={`pointer-events-auto relative border ${cfg.border} ${cfg.bg} bl-result-in bl-corners max-w-xl px-10 py-8`}
        style={{ clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)" }}
      >
        <button onClick={onClose} className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center text-text-mute hover:text-text">
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-center gap-5">
          <div className={`relative flex h-16 w-16 items-center justify-center border ${cfg.border} ${cfg.bg}`}>
            <span className="absolute inset-0 bl-pulse-ring" style={{ boxShadow: `0 0 30px ${cfg.accent}66 inset, 0 0 30px ${cfg.accent}66` }} />
            <Icon className={`relative h-7 w-7 ${cfg.text}`} />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-[10px] font-bold tracking-[0.3em] text-text-mute">VERDICT</span>
            <h2
              className={`font-display text-3xl md:text-4xl font-bold leading-none tracking-tight ${cfg.text}`}
              style={{ textShadow: `0 0 20px ${cfg.accent}80` }}
            >
              {cfg.title}
            </h2>
            <p className="mt-1 font-mono text-[12px] text-text-dim">{cfg.sub}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line/40 pt-4">
          <div>
            <div className="font-display text-[9px] font-bold tracking-[0.22em] text-text-mute">TESTS</div>
            <div className={`font-mono text-xl font-bold ${cfg.text} tabular-nums`}>{passed}/{total}</div>
          </div>
          <div>
            <div className="font-display text-[9px] font-bold tracking-[0.22em] text-text-mute">RUNTIME</div>
            <div className="font-mono text-xl font-bold text-text tabular-nums">
              {runtimeMs ?? "—"}<span className="text-text-mute text-base">ms</span>
            </div>
          </div>
          <div>
            <div className="font-display text-[9px] font-bold tracking-[0.22em] text-text-mute">LP</div>
            <div className={`font-mono text-xl font-bold tabular-nums ${verdict === "AC" ? "text-gold" : "text-ember"}`}>
              {lpDelta !== undefined ? (lpDelta >= 0 ? `+${lpDelta}` : `${lpDelta}`) : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
