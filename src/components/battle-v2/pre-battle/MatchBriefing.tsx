import { Coins, Lock, ScrollText, Swords, Timer, Trophy, Users } from "lucide-react";

interface BriefingItem {
  icon: typeof Swords;
  label: string;
  value: string;
  sub: string;
  tone?: "neon" | "ember" | "gold";
}

interface Props {
  items?: BriefingItem[];
  rules?: { tone: "neon" | "ember"; text: string }[];
}

const DEFAULT_ITEMS: BriefingItem[] = [
  { icon: Swords, label: "MODE", value: "Duo Battle", sub: "2 vs 2" },
  { icon: Trophy, label: "FORMAT", value: "Best of 5", sub: "Sudden death on 2-2" },
  { icon: Timer, label: "ROUND LIMIT", value: "15:00", sub: "Per round" },
  { icon: Coins, label: "STAKES", value: "+28 LP", sub: "Winner takes", tone: "gold" },
  { icon: Lock, label: "DIFFICULTY", value: "Hard", sub: "Mixed topics", tone: "ember" },
  { icon: Users, label: "SPECTATORS", value: "—", sub: "Public arena" },
];

const DEFAULT_RULES: { tone: "neon" | "ember"; text: string }[] = [
  { tone: "neon", text: "One active coder per team per round. Teammate supports via chat only." },
  { tone: "neon", text: "Each team gets 1 timeout (60s) per match. Cannot stack." },
  { tone: "ember", text: "Copy-paste from external sources auto-disqualifies the round." },
  { tone: "ember", text: "Surrender forfeits current round, not the whole match." },
];

export function MatchBriefing({ items = DEFAULT_ITEMS, rules = DEFAULT_RULES }: Props) {
  return (
    <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-20" />
      <div className="relative">
        <header className="flex items-center justify-between border-b border-line/60 px-5 py-3 bl-side-stripe">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-neon" />
            <span className="font-display text-[13px] font-bold tracking-[0.2em] text-text text-glow">
              MATCH BRIEFING
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.14em] text-text-mute">
            PROTOCOL v3.2
          </span>
        </header>

        <div className="grid grid-cols-2 gap-px bg-line/30 md:grid-cols-3">
          {items.map((it) => {
            const Icon = it.icon;
            const tone = it.tone ?? "neon";
            const toneText = tone === "ember" ? "text-ember" : tone === "gold" ? "text-gold" : "text-neon";
            return (
              <div key={it.label} className="flex flex-col gap-1 bg-void/50 px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-3.5 w-3.5 ${toneText}`} />
                  <span className="font-display text-[9.5px] font-bold tracking-[0.22em] text-text-mute">
                    {it.label}
                  </span>
                </div>
                <span className={`font-display text-[18px] font-bold leading-none ${toneText}`}>
                  {it.value}
                </span>
                <span className="font-mono text-[10.5px] tracking-[0.08em] text-text-dim">{it.sub}</span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-line/60 px-5 py-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-display text-[10px] font-bold tracking-[0.22em] text-text-mute">
              RULES
            </span>
            <span className="font-mono text-[10px] text-neon/70">{"// arbitrated"}</span>
          </div>
          <ul className="grid grid-cols-1 gap-2 font-mono text-[11.5px] leading-relaxed text-text-dim md:grid-cols-2">
            {rules.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`mt-1 h-1.5 w-1.5 shrink-0 ${r.tone === "ember" ? "bg-ember" : "bg-neon"}`} />
                {r.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
