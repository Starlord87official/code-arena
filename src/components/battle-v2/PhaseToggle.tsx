import { DoorOpen, Hourglass, Swords, Trophy } from "lucide-react";
import type { BattlePhase } from "./types";

const PHASES: { id: BattlePhase; label: string; icon: typeof DoorOpen }[] = [
  { id: "entry", label: "ENTRY", icon: DoorOpen },
  { id: "pre_battle", label: "LOBBY", icon: Hourglass },
  { id: "live", label: "LIVE", icon: Swords },
  { id: "post_battle", label: "RESULT", icon: Trophy },
];

interface Props {
  current: BattlePhase;
  onChange: (p: BattlePhase) => void;
}

/**
 * Dev-only horizontal phase switcher rendered above the entry hero.
 * Hidden in production builds.
 */
export function PhaseToggle({ current, onChange }: Props) {
  if (!import.meta.env.DEV) return null;

  return (
    <div className="relative overflow-hidden border border-line/70 bg-panel/50 bl-glass">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-15" />
      <div className="relative flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 md:px-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center border border-ember/50 bg-ember/10 px-2 py-0.5 font-display text-[10px] font-bold tracking-[0.22em] text-ember bl-clip-chevron">
            DEMO MODE
          </span>
          <span className="hidden font-mono text-[10px] tracking-[0.16em] text-text-dim md:inline">
            // switch states to preview the full battle lifecycle
          </span>
        </div>
        <div className="flex items-center gap-1">
          {PHASES.map((p) => {
            const Icon = p.icon;
            const active = current === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onChange(p.id)}
                className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 font-display text-[10px] font-bold tracking-[0.22em] transition bl-clip-chevron ${
                  active
                    ? "border-neon/70 bg-neon/15 text-neon"
                    : "border-line/60 bg-void/40 text-text-dim hover:border-neon/40 hover:text-text"
                }`}
              >
                <Icon className="h-3 w-3" />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
