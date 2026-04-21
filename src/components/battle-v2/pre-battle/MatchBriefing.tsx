import { Ban, Coins, Lock, ScrollText, Sparkles, Swords, Timer, Trophy, Zap } from "lucide-react";
import type { BriefingProblem } from "@/hooks/useBattleBriefing";

interface Props {
  problems?: BriefingProblem[];
  durationMinutes?: number;
  modeLabel?: string;
  totalPoints?: number;
  isRated?: boolean;
  bannedTopics?: string[];
  pickedTopics?: string[];
}

export function MatchBriefing({
  problems = [],
  durationMinutes = 15,
  modeLabel = "Duo Battle",
  totalPoints,
  isRated,
  bannedTopics = [],
  pickedTopics = [],
}: Props) {
  const points = totalPoints ?? problems.reduce((s, p) => s + (p.points ?? 0), 0);

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
            {problems.length} PROBLEMS
          </span>
        </header>

        {(bannedTopics.length > 0 || pickedTopics.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 border-b border-line/60 px-5 py-3">
            {bannedTopics.map((t) => (
              <span key={`b-${t}`} className="inline-flex items-center gap-1 border border-blood/40 bg-blood/10 px-2 py-0.5 font-mono text-[10px] text-blood line-through">
                <Ban className="h-2.5 w-2.5" /> {t}
              </span>
            ))}
            {pickedTopics.map((t) => (
              <span key={`p-${t}`} className="inline-flex items-center gap-1 border border-neon/40 bg-neon/10 px-2 py-0.5 font-mono text-[10px] text-neon shadow-[0_0_8px_rgba(0,255,200,0.2)]">
                <Sparkles className="h-2.5 w-2.5" /> {t}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-px bg-line/30 md:grid-cols-4">
          <Tile icon={Swords} label="MODE" value={modeLabel} sub={isRated ? "Rated" : "Unrated"} />
          <Tile icon={Trophy} label="FORMAT" value={`${problems.length || "—"} rounds`} sub="First to clear" />
          <Tile icon={Timer} label="TIME LIMIT" value={`${durationMinutes}:00`} sub="Total" />
          <Tile icon={Coins} label="MAX POINTS" value={String(points || 0)} sub="Combined" tone="gold" />
        </div>

        {problems.length > 0 && (
          <div className="border-t border-line/60 px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="font-display text-[10px] font-bold tracking-[0.22em] text-text-mute">
                PROBLEM SET
              </span>
              <span className="font-mono text-[10px] text-neon/70">{"// arbitrated"}</span>
            </div>
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {problems.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 border border-line/60 bg-void/50 px-3 py-2"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center border border-neon/40 bg-neon/10 font-display text-[11px] font-bold text-neon">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-[13px] font-bold text-text">{p.title}</div>
                    <div className="font-mono text-[10px] tracking-[0.14em] text-text-dim">
                      {p.difficulty.toUpperCase()} · {p.points} pts
                    </div>
                  </div>
                  <DiffBadge difficulty={p.difficulty} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {problems.length === 0 && (
          <div className="border-t border-line/60 px-5 py-8 text-center">
            <Lock className="h-8 w-8 mx-auto text-text-mute/50 mb-2" />
            <p className="font-mono text-[11px] text-text-mute">{"// problems sealed until launch"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  sub,
  tone = "neon",
}: {
  icon: typeof Swords;
  label: string;
  value: string;
  sub: string;
  tone?: "neon" | "ember" | "gold";
}) {
  const toneText = tone === "ember" ? "text-ember" : tone === "gold" ? "text-gold" : "text-neon";
  return (
    <div className="flex flex-col gap-1 bg-void/50 px-4 py-3.5">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${toneText}`} />
        <span className="font-display text-[9.5px] font-bold tracking-[0.22em] text-text-mute">
          {label}
        </span>
      </div>
      <span className={`font-display text-[18px] font-bold leading-none ${toneText}`}>{value}</span>
      <span className="font-mono text-[10.5px] tracking-[0.08em] text-text-dim">{sub}</span>
    </div>
  );
}

function DiffBadge({ difficulty }: { difficulty: string }) {
  const d = difficulty.toLowerCase();
  const tone =
    d === "hard" ? "border-blood/50 text-blood bg-blood/10" :
    d === "medium" ? "border-gold/50 text-gold bg-gold/10" :
    "border-neon/50 text-neon bg-neon/10";
  return (
    <span className={`inline-flex items-center gap-1 border px-1.5 py-0.5 font-display text-[9px] font-bold tracking-[0.2em] bl-clip-chevron ${tone}`}>
      <Zap className="h-2.5 w-2.5" />
      {d.toUpperCase()}
    </span>
  );
}
