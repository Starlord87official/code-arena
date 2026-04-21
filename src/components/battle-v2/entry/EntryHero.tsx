import { Activity, Radar, Zap } from "lucide-react";

interface GlobalStats {
  onlinePlayers: number;
  activeBattles: number;
  seasonDay: number;
  seasonTotalDays: number;
  queueHealth: number;
  avgQueue: string;
}

interface Props {
  stats?: GlobalStats;
}

const FALLBACK: GlobalStats = {
  onlinePlayers: 0,
  activeBattles: 0,
  seasonDay: 1,
  seasonTotalDays: 90,
  queueHealth: 100,
  avgQueue: "—",
};

export function EntryHero({ stats = FALLBACK }: Props) {
  return (
    <section className="relative overflow-hidden border border-line bg-panel/60 bl-glass">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-30" />
      <div className="pointer-events-none absolute inset-0 bl-scanline opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-neon/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-10 h-[320px] w-[320px] rounded-full bg-ember/10 blur-3xl" />

      <div className="relative flex items-center justify-between border-b border-line/70 px-5 py-2.5 md:px-8">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-neon" />
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-text-dim">
            BATTLE_PROTOCOL · v2.0 · ONLINE
          </span>
        </div>
        <div className="hidden items-center gap-5 font-mono text-[10px] tracking-[0.18em] text-text-dim sm:flex">
          <span className="inline-flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-neon" />
            {stats.onlinePlayers.toLocaleString()} IN ARENA
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Radar className="h-3 w-3 text-ember" />
            {stats.activeBattles.toLocaleString()} LIVE FIGHTS
          </span>
        </div>
      </div>

      <div className="relative px-5 py-10 md:px-10 md:py-14">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 border border-neon/40 bg-neon/10 px-3 py-1 bl-clip-chevron">
            <Zap className="h-3.5 w-3.5 text-neon" />
            <span className="font-display text-[10px] font-bold tracking-[0.28em] text-neon">
              BATTLE ENTRY · MATCH SETUP
            </span>
          </div>

          <h1 className="font-display text-[clamp(2.4rem,6vw,4.6rem)] font-black leading-[0.95] tracking-tight text-text">
            ENTER THE{" "}
            <span className="relative inline-block">
              <span className="text-neon text-glow bl-glitch">ARENA</span>
              <span className="pointer-events-none absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-neon to-transparent" />
            </span>
          </h1>

          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-text-dim md:text-base">
            Choose your war. Every click from here shapes the ladder — pick the
            format, lock your stance, and queue into the fight of your life.
          </p>

          <div className="mt-3 flex items-center gap-6">
            <span className="font-display text-[10px] font-bold tracking-[0.3em] text-text-mute">
              NO ESCAPE
            </span>
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-neon/40 to-transparent" />
            <span className="font-display text-[10px] font-bold tracking-[0.3em] text-ember">
              NO SECOND PLACE
            </span>
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-neon/40 to-transparent" />
            <span className="font-display text-[10px] font-bold tracking-[0.3em] text-text-mute">
              NO MERCY
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-line/70 bg-void/40 px-5 py-2.5 md:px-8">
        <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.18em] text-text-dim">
          <span>SEASON {stats.seasonDay}/{stats.seasonTotalDays}</span>
          <span className="h-3 w-px bg-line" />
          <span className="text-neon">QUEUE HEALTH {stats.queueHealth}%</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-text-dim">
          <span>AVG QUEUE</span>
          <span className="text-text">{stats.avgQueue}</span>
        </div>
      </div>
    </section>
  );
}
