import { CheckCircle2, Clock, Crown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type Readiness = "ready" | "waiting" | "syncing";

export interface RosterPlayer {
  user_id: string;
  handle: string;
  initial: string;
  rank?: string;
  elo?: number;
  accent: "neon" | "ember";
  isCaptain?: boolean;
  state?: Readiness;
}

interface Props {
  players: RosterPlayer[];
}

export function ReadyRoster({ players }: Props) {
  if (!players || players.length === 0) {
    return (
      <div className="border border-line bg-panel/60 bl-glass p-6 text-center">
        <p className="font-mono text-[11px] text-text-mute">{"// no participants yet"}</p>
      </div>
    );
  }

  const blue = players.filter((p) => p.accent === "neon");
  const red = players.filter((p) => p.accent === "ember");

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <SideRoster label="TEAM BLUE" accent="neon" players={blue} />
      <SideRoster label="TEAM RED" accent="ember" players={red} />
    </div>
  );
}

function SideRoster({ label, accent, players }: { label: string; accent: "neon" | "ember"; players: RosterPlayer[] }) {
  const isBlue = accent === "neon";
  const accentText = isBlue ? "text-neon" : "text-ember";
  const accentBorder = isBlue ? "border-neon/40" : "border-ember/40";
  const stripe = isBlue ? "bl-side-stripe" : "bl-side-stripe bl-side-stripe-ember";
  const readyCount = players.filter((p) => (p.state ?? "waiting") === "ready").length;

  return (
    <div className={cn("relative overflow-hidden border bg-panel/60 bl-glass bl-corners", accentBorder)}>
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-25" />
      <div className={cn("relative", stripe)}>
        <header
          className={cn(
            "flex items-center justify-between border-b border-line/60 px-5 py-3",
            isBlue ? "bg-neon/5" : "bg-ember/5",
          )}
        >
          <span className={cn("font-display text-[13px] font-bold tracking-tight", accentText)}>
            {label}
          </span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-text-dim">
            READY <span className={accentText}>{readyCount}</span>/{players.length}
          </span>
        </header>

        <div className="flex flex-col gap-3 p-4 md:p-5">
          {players.length === 0 ? (
            <p className="font-mono text-[11px] text-text-mute py-4">{"// awaiting signal"}</p>
          ) : (
            players.map((p) => (
              <PlayerRow key={p.user_id} player={p} accent={accent} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PlayerRow({ player, accent }: { player: RosterPlayer; accent: "neon" | "ember" }) {
  const isBlue = accent === "neon";
  const state = player.state ?? "waiting";
  const map = {
    ready: { icon: CheckCircle2, label: "READY", tone: "text-neon border-neon/50 bg-neon/10 text-glow", spin: false },
    waiting: { icon: Clock, label: "WAITING", tone: "text-text-mute border-line bg-void", spin: false },
    syncing: { icon: Loader2, label: "SYNCING", tone: "text-gold border-gold/40 bg-gold/10", spin: true },
  } as const;
  const entry = map[state];
  const Icon = entry.icon;

  return (
    <div className="relative overflow-hidden border border-line/70 bg-void/50 p-4">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          {player.isCaptain && (
            <Crown className="absolute -top-3 left-1/2 h-3.5 w-3.5 -translate-x-1/2 text-gold drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
          )}
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center border font-display text-[18px] font-black bl-clip-notch",
              isBlue ? "border-neon/60 bg-neon/10 text-neon" : "border-ember/60 bg-ember/10 text-ember",
            )}
          >
            {player.initial}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-display text-[14px] font-bold text-text">{player.handle}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 font-mono text-[10.5px] tracking-[0.1em] text-text-dim">
            {player.rank && <span>{player.rank}</span>}
            {player.rank && player.elo !== undefined && <span className="text-text-mute">·</span>}
            {player.elo !== undefined && (
              <span className="text-text">{player.elo.toLocaleString()} LP</span>
            )}
          </div>
        </div>

        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 border px-2 py-1 font-display text-[10px] font-bold tracking-[0.18em]",
            entry.tone,
          )}
        >
          <Icon className={cn("h-3.5 w-3.5", entry.spin && "animate-spin")} />
          {entry.label}
        </span>
      </div>
    </div>
  );
}
