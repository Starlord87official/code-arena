import { Bot, Lock, Swords, Zap } from "lucide-react";
import type { BattleMode } from "@/hooks/useMatchmaking";
import { cn } from "@/lib/utils";

export type ModeId = BattleMode | "practice";

interface ModeDef {
  id: ModeId;
  code: string;
  label: string;
  badge?: "RANKED" | "FEATURED";
  icon: typeof Zap;
  accent: "neon" | "ember" | "gold" | "blood";
  tagline: string;
  description: string;
  stakes: string;
  queue: string;
  players: string;
  disabled?: boolean;
}

const MODES: ModeDef[] = [
  {
    id: "quick",
    code: "M-01",
    label: "Quick Match",
    icon: Zap,
    accent: "neon",
    tagline: "No stakes · Instant queue",
    description:
      "Drop into a fast 3-round skirmish. No LP on the line — pure muscle memory, pure reps.",
    stakes: "No LP change",
    queue: "~45s queue",
    players: "2-4",
  },
  {
    id: "ranked",
    code: "M-02",
    label: "Ranked Duo",
    badge: "FEATURED",
    icon: Swords,
    accent: "ember",
    tagline: "Best of 5 · Climb the ladder",
    description:
      "The real arena. Competitive duo battles with LP swings, promotion series, and seasonal glory.",
    stakes: "±24 LP",
    queue: "~1m 20s queue",
    players: "4",
  },
  {
    id: "custom",
    code: "M-03",
    label: "Custom Battle",
    icon: Lock,
    accent: "gold",
    tagline: "Private lobby · Invite only",
    description:
      "Build the fight. Pick difficulty, map pool, timer, and invite friends or clan members.",
    stakes: "Configurable",
    queue: "On demand",
    players: "2-8",
  },
  {
    id: "practice",
    code: "M-04",
    label: "Practice Arena",
    icon: Bot,
    accent: "neon",
    tagline: "Solo drills · AI sparring",
    description:
      "Sharpen your strike against adaptive AI. No rivals, no pressure — just reps and replays.",
    stakes: "Training only",
    queue: "Instant",
    players: "1",
    disabled: true,
  },
];

const accentMap = {
  neon: { border: "border-neon/60", bg: "bg-neon/10", text: "text-neon", soft: "text-neon/80" },
  ember: { border: "border-ember/60", bg: "bg-ember/10", text: "text-ember", soft: "text-ember/80" },
  gold: { border: "border-gold/60", bg: "bg-gold/10", text: "text-gold", soft: "text-gold/80" },
  blood: { border: "border-blood/60", bg: "bg-blood/10", text: "text-blood", soft: "text-blood/80" },
};

interface Props {
  selected: ModeId;
  onSelect: (m: ModeId) => void;
}

export function ModeGrid({ selected, onSelect }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {MODES.map((m) => {
        const Icon = m.icon;
        const a = accentMap[m.accent];
        const active = selected === m.id;
        return (
          <button
            key={m.id}
            onClick={() => !m.disabled && onSelect(m.id)}
            disabled={m.disabled}
            className={cn(
              "relative flex flex-col overflow-hidden border bg-panel/60 bl-glass p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
              active ? `${a.border} ${a.bg}` : "border-line/60 hover:border-line-bright",
            )}
          >
            <div className="pointer-events-none absolute inset-0 bl-grid opacity-10" />
            {m.badge === "FEATURED" && (
              <span className="absolute -top-px right-3 inline-flex items-center border border-gold/60 bg-gold/15 px-2 py-0.5 font-display text-[9px] font-bold tracking-[0.22em] text-gold">
                FEATURED
              </span>
            )}

            <div className="relative">
              <div className="flex items-start justify-between">
                <div className={cn("flex h-9 w-9 items-center justify-center border", a.border, a.bg)}>
                  <Icon className={cn("h-4 w-4", a.text)} />
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] tracking-[0.18em] text-text-mute">{m.code}</div>
                  {m.badge === "RANKED" && (
                    <div className={cn("font-display text-[9px] font-bold tracking-[0.22em]", a.text)}>· RANKED</div>
                  )}
                </div>
              </div>

              <h3 className={cn("mt-3 font-display text-[18px] font-black leading-tight", active ? a.text : "text-text")}>
                {m.label}
              </h3>
              <p className="mt-1 font-mono text-[10px] tracking-[0.14em] text-text-dim">{m.tagline}</p>

              <p className="mt-3 text-[12px] leading-relaxed text-text-dim min-h-[60px]">
                {m.description}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line/40 pt-3">
                <Spec label="STAKES" value={m.stakes} tone={a.text} />
                <Spec label="QUEUE" value={m.queue} />
                <Spec label="PLAYERS" value={m.players} />
              </div>

              {active && (
                <div className={cn(
                  "mt-3 inline-flex items-center border px-2 py-0.5 font-display text-[9px] font-bold tracking-[0.22em] bl-clip-chevron",
                  a.border, a.bg, a.text,
                )}>
                  SELECTED
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Spec({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] tracking-[0.18em] text-text-mute">{label}</div>
      <div className={cn("mt-0.5 font-display text-[11px] font-bold leading-tight", tone ?? "text-text")}>
        {value}
      </div>
    </div>
  );
}
