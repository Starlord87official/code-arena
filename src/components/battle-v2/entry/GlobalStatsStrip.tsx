import { Activity, BarChart3, Radar, Users } from "lucide-react";

interface Props {
  online: number;
  liveBattles: number;
  avgQueue: string;
  queueHealth: number;
}

export function GlobalStatsStrip({ online, liveBattles, avgQueue, queueHealth }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Tile icon={Users} label="ONLINE" value={online.toLocaleString()} accent="neon" />
      <Tile icon={Radar} label="LIVE BATTLES" value={liveBattles.toLocaleString()} accent="ember" />
      <Tile icon={Activity} label="AVG QUEUE" value={avgQueue} accent="gold" />
      <Tile icon={BarChart3} label="QUEUE HEALTH" value={`${queueHealth}%`} accent="neon" />
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  accent: "neon" | "ember" | "gold";
}) {
  const map = {
    neon: { border: "border-neon/40", text: "text-neon" },
    ember: { border: "border-ember/40", text: "text-ember" },
    gold: { border: "border-gold/40", text: "text-gold" },
  };
  const a = map[accent];
  return (
    <div className="relative overflow-hidden border border-line bg-panel/50 bl-glass px-4 py-3 flex items-center gap-3">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-10" />
      <div className={`relative flex h-10 w-10 items-center justify-center border ${a.border} bg-void/60`}>
        <Icon className={`h-4 w-4 ${a.text}`} />
      </div>
      <div className="relative">
        <div className="font-mono text-[10px] tracking-[0.2em] text-text-mute">{label}</div>
        <div className="font-display text-[20px] font-black text-text tabular-nums leading-tight">
          {value}
        </div>
      </div>
    </div>
  );
}
