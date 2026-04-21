import type { BattlePhase } from "./types";

const PHASES: { id: BattlePhase; label: string }[] = [
  { id: "entry", label: "ENTRY" },
  { id: "searching", label: "QUEUE" },
  { id: "pre_battle", label: "LOBBY" },
  { id: "live", label: "LIVE" },
  { id: "post_battle", label: "RESULT" },
];

interface Props {
  current: BattlePhase;
  onChange: (p: BattlePhase) => void;
}

/**
 * Dev-only floating phase switcher. Hidden in production.
 * Renders only when import.meta.env.DEV is true.
 */
export function PhaseToggle({ current, onChange }: Props) {
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] bl-glass border border-neon/40 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      <div className="font-mono text-[9px] tracking-[0.22em] text-text-mute mb-1.5 px-1">
        DEV · PHASE PREVIEW
      </div>
      <div className="flex flex-col gap-1">
        {PHASES.map((p) => (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`px-2.5 py-1 text-left font-display text-[10px] font-bold tracking-[0.2em] transition border bl-clip-chevron ${
              current === p.id
                ? "border-neon/70 bg-neon/15 text-neon"
                : "border-line/60 bg-void/60 text-text-dim hover:border-neon/40 hover:text-text"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
