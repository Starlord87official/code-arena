import { Zap, Trophy, Target } from "lucide-react";
import type { BattleMode } from "@/hooks/useMatchmaking";
import { cn } from "@/lib/utils";

interface Props {
  selected: BattleMode;
  onSelect: (mode: BattleMode) => void;
}

const MODES: {
  id: BattleMode;
  label: string;
  desc: string;
  reward: string;
  icon: typeof Zap;
  accent: "neon" | "ember" | "gold";
}[] = [
  { id: "quick", label: "QUICK MATCH", desc: "Random opponent · 15 min", reward: "+50 XP", icon: Zap, accent: "neon" },
  { id: "ranked", label: "RANKED BATTLE", desc: "ELO matched · 30 min", reward: "+100 XP", icon: Trophy, accent: "ember" },
  { id: "custom", label: "CUSTOM DUEL", desc: "Pick your foe & rules", reward: "FLEXIBLE", icon: Target, accent: "gold" },
];

const accentMap = {
  neon: { border: "border-neon/70", bg: "bg-neon/10", text: "text-neon", iconText: "text-neon" },
  ember: { border: "border-ember/70", bg: "bg-ember/10", text: "text-ember", iconText: "text-ember" },
  gold: { border: "border-gold/70", bg: "bg-gold/10", text: "text-gold", iconText: "text-gold" },
};

export function ModeSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {MODES.map((m) => {
        const Icon = m.icon;
        const a = accentMap[m.accent];
        const active = selected === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={cn(
              "relative overflow-hidden border bg-panel/60 bl-glass p-5 text-left transition bl-clip-chevron",
              active ? `${a.border} ${a.bg}` : "border-line/60 hover:border-line-bright",
            )}
          >
            <div className="pointer-events-none absolute inset-0 bl-grid opacity-15" />
            <div className="relative">
              <Icon className={cn("h-7 w-7 mb-3", a.iconText)} />
              <h3 className={cn("font-display text-[14px] font-bold tracking-[0.18em]", active ? a.text : "text-text")}>
                {m.label}
              </h3>
              <p className="mt-1 text-[12px] text-text-dim">{m.desc}</p>
              <span
                className={cn(
                  "mt-3 inline-flex items-center border px-2 py-0.5 font-display text-[9px] font-bold tracking-[0.22em]",
                  a.border,
                  a.bg,
                  a.text,
                )}
              >
                {m.reward}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
