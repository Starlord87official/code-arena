import { User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type BattleFormat = "solo" | "duo";

interface Props {
  selected: BattleFormat;
  onSelect: (f: BattleFormat) => void;
  duoLocked?: boolean;
}

export function FormatSelector({ selected, onSelect, duoLocked }: Props) {
  return (
    <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-15" />
      <header className="relative flex items-center justify-between border-b border-line/60 px-5 py-3 bl-side-stripe">
        <span className="font-display text-[11px] font-bold tracking-[0.22em] text-text-mute">FORMAT</span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-text-dim">// TEAM_SIZE</span>
      </header>

      <div className="relative grid grid-cols-2 gap-3 p-4">
        <FormatCard
          id="solo"
          label="SOLO"
          sub="1 vs 1"
          icon={User}
          active={selected === "solo"}
          onClick={() => onSelect("solo")}
        />
        <FormatCard
          id="duo"
          label="DUO"
          sub="2 vs 2"
          icon={Users}
          active={selected === "duo"}
          locked={duoLocked}
          onClick={() => !duoLocked && onSelect("duo")}
        />
      </div>
    </div>
  );
}

function FormatCard({
  label,
  sub,
  icon: Icon,
  active,
  locked,
  onClick,
}: {
  id: BattleFormat;
  label: string;
  sub: string;
  icon: typeof User;
  active: boolean;
  locked?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={cn(
        "relative border bg-void/40 p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
        active ? "border-neon/70 bg-neon/10" : "border-line/60 hover:border-line-bright",
      )}
    >
      <div className="flex items-start justify-between">
        <Icon className={cn("h-5 w-5", active ? "text-neon" : "text-text-dim")} />
        {locked && (
          <span className="border border-line/70 bg-void/70 px-1.5 py-0.5 font-display text-[9px] font-bold tracking-[0.18em] text-text-mute">
            LOCKED
          </span>
        )}
      </div>
      <div className={cn("mt-3 font-display text-[14px] font-black tracking-[0.16em]", active ? "text-neon" : "text-text")}>
        {label}
      </div>
      <div className="font-mono text-[10px] tracking-[0.16em] text-text-dim mt-0.5">{sub}</div>
    </button>
  );
}
