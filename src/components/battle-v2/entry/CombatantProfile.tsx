import { Crown, Flame, Target, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentForm {
  result: "W" | "L" | "D";
}

interface RecentMatch {
  id: string;
  opponent: string;
  mode: string;
  score: string;
  lp: number;
  ago: string;
  time: string;
  result: "W" | "L" | "D";
}

export interface CombatantData {
  pid: string;
  username: string;
  initial: string;
  level: number;
  rank: string;
  topPercent?: number;
  lpCurrent: number;
  lpTarget: number;
  nextRank: string;
  isCaptain?: boolean;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  mvps: number;
  dailyDone: number;
  dailyTotal: number;
  dailyLabel: string;
  form: RecentForm[];
  recent: RecentMatch[];
}

interface Props {
  data?: CombatantData;
  isLoading?: boolean;
}

export function CombatantProfile({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners p-5 space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-3 w-full" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  const lpPct = Math.min(100, (data.lpCurrent / data.lpTarget) * 100);

  return (
    <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-15" />

      <div className="relative flex items-start justify-between gap-3 border-b border-line/60 px-5 py-3 bl-side-stripe">
        <div>
          <div className="font-display text-[11px] font-bold tracking-[0.22em] text-text-mute">
            COMBATANT PROFILE
          </div>
          <div className="font-mono text-[10px] tracking-[0.18em] text-text-dim mt-0.5">
            // PID-{data.pid} · <span className="text-neon">ACTIVE</span>
          </div>
        </div>
        {data.isCaptain && (
          <span className="inline-flex items-center gap-1 border border-gold/50 bg-gold/10 px-2 py-1 font-display text-[10px] font-bold tracking-[0.22em] text-gold bl-clip-chevron">
            <Crown className="h-3 w-3" />
            CAPTAIN
          </span>
        )}
      </div>

      <div className="relative p-5 space-y-5">
        {/* Identity */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center border border-neon/50 bg-neon/10 font-display text-2xl font-black text-neon bl-clip-notch">
              {data.initial}
            </div>
            <span className="absolute -bottom-1.5 -right-1.5 inline-flex items-center border border-neon/60 bg-void px-1.5 py-0.5 font-display text-[9px] font-bold tracking-[0.18em] text-neon">
              LVL {data.level}
            </span>
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="truncate font-display text-[20px] font-black text-text leading-tight">
              {data.username}
            </h3>
            <div className="mt-1 flex items-center gap-2 font-display text-[11px] font-bold tracking-[0.2em]">
              <span className="text-neon">{data.rank}</span>
              {data.topPercent !== undefined && (
                <>
                  <span className="text-line">·</span>
                  <span className="text-text-dim">TOP {data.topPercent}%</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* LP progress / placement state */}
        {data.rank === "UNRANKED" || data.lpTarget === 0 ? (
          <div>
            <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] tracking-[0.16em]">
              <span className="text-text-dim">PLACEMENT MATCHES</span>
              <span className="text-text">
                <span className="font-display text-gold font-bold">{data.lpTarget - data.lpCurrent}</span>
                <span className="text-text-mute"> remaining</span>
              </span>
            </div>
            <div className="bl-bar-track h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold/60 via-gold to-gold/60"
                style={{ width: `${data.lpTarget > 0 ? (data.lpCurrent / data.lpTarget) * 100 : 0}%` }}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] tracking-[0.16em]">
              <span className="text-text-dim">LP TO {data.nextRank.toUpperCase()}</span>
              <span className="text-text">
                <span className="font-display text-neon font-bold">{data.lpCurrent}</span>
                <span className="text-text-mute"> / {data.lpTarget}</span>
              </span>
            </div>
            <div className="bl-bar-track h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-electric via-neon to-neon-soft"
                style={{ width: `${lpPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile icon={Trophy} label="W-L" value={`${data.wins}-${data.losses}`} accent="neon" />
          <StatTile icon={Target} label="WIN %" value={`${data.winRate}%`} accent="neon" />
          <StatTile icon={Flame} label="STREAK" value={`W${data.streak}`} accent="gold" />
          <StatTile icon={Crown} label="MVPs" value={String(data.mvps)} accent="gold" />
        </div>

        {/* Daily objective */}
        {data.dailyTotal > 0 && (
          <div className="flex items-center justify-between border-t border-line/40 pt-3">
            <div>
              <div className="font-mono text-[10px] tracking-[0.18em] text-text-mute">DAILY OBJECTIVE</div>
              <div className="font-display text-[13px] font-bold text-text mt-0.5">
                {data.dailyLabel}
              </div>
            </div>
            <div className="font-display tabular-nums">
              <span className="text-2xl font-black text-gold">{data.dailyDone}</span>
              <span className="text-sm text-text-mute">/{data.dailyTotal}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Crown;
  label: string;
  value: string;
  accent: "neon" | "gold" | "ember";
}) {
  const accentMap = {
    neon: "text-neon",
    gold: "text-gold",
    ember: "text-ember",
  };
  return (
    <div className="border border-line/50 bg-void/40 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3 w-3 ${accentMap[accent]}`} />
        <span className="font-mono text-[9px] tracking-[0.18em] text-text-mute">{label}</span>
      </div>
      <div className={`mt-1 font-display text-[15px] font-black tabular-nums ${accentMap[accent]}`}>
        {value}
      </div>
    </div>
  );
}
