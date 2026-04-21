import { useEffect, useState } from "react";
import { Dot, Radio, Shield, Swords } from "lucide-react";

export interface LobbyTeam {
  name: string;
  initial: string;
  accent: "neon" | "ember";
  seed?: string;
  elo?: number;
}

interface Props {
  blue: LobbyTeam;
  red: LobbyTeam;
  matchId?: string;
  formatLabel?: string;
  modeLabel?: string;
}

export function LobbyHeader({ blue, red, matchId = "—", formatLabel = "DUO BATTLE", modeLabel }: Props) {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d % 3) + 1), 500);
    return () => clearInterval(id);
  }, []);

  const idShort = matchId.length > 12 ? matchId.slice(0, 8) : matchId;

  return (
    <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-25" />
      <div className="pointer-events-none absolute -right-32 -top-24 h-[320px] w-[320px] rounded-full bg-neon/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 -bottom-24 h-[300px] w-[300px] rounded-full bg-ember/15 blur-3xl" />

      <div className="relative flex flex-col items-center gap-4 px-6 py-8 md:py-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 items-center border border-gold/40 bg-gold/10 px-1.5 font-display text-[9px] font-bold tracking-[0.24em] text-gold">
            <Radio className="mr-1 h-3 w-3 animate-pulse" />
            MATCH LOBBY
          </span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-text-dim">{idShort}</span>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-5 md:flex-row md:gap-10">
          <Crest team={blue} />
          <div className="flex flex-col items-center gap-2">
            <Swords className="h-7 w-7 text-gold drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
            <div className="font-display text-[36px] font-black leading-none tracking-tight md:text-[56px]">
              <span className="text-neon text-glow">VS</span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.24em] text-text-mute">
              {formatLabel}{modeLabel ? ` · ${modeLabel}` : ""}
            </span>
          </div>
          <Crest team={red} align="right" />
        </div>

        <div className="mt-2 flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-text-dim">
          <Shield className="h-3.5 w-3.5 text-neon" />
          <span>
            WAITING FOR ALL WARRIORS TO LOCK IN
            <span className="text-neon">{".".repeat(dots)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Crest({ team, align }: { team: LobbyTeam; align?: "right" }) {
  const isBlue = team.accent === "neon";
  return (
    <div
      className={`flex items-center gap-4 ${align === "right" ? "md:flex-row-reverse md:text-right" : ""}`}
    >
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center border font-display text-[28px] font-black bl-clip-notch ${
          isBlue
            ? "border-neon/70 bg-neon/10 text-neon glow-neon"
            : "border-ember/70 bg-ember/10 text-ember glow-ember"
        }`}
      >
        {team.initial}
      </div>
      <div>
        <h3
          className={`font-display text-[18px] font-bold tracking-tight md:text-[22px] ${
            isBlue ? "text-neon text-glow" : "text-ember text-glow-ember"
          }`}
        >
          {team.name}
        </h3>
        <div className="mt-0.5 flex items-center gap-2 font-mono text-[10.5px] tracking-[0.18em] text-text-dim">
          {team.seed && <span>SEED {team.seed}</span>}
          {team.seed && team.elo !== undefined && <Dot className="h-3 w-3" />}
          {team.elo !== undefined && (
            <span>
              ELO <span className="text-text">{team.elo.toLocaleString()}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
