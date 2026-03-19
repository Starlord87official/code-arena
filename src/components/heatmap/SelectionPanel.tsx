import type { DayData } from "@/lib/activityData";
import { fmtDisplay } from "@/lib/activityData";
import { X } from "lucide-react";

interface Props {
  days: DayData[];
  onClose: () => void;
}

export default function SelectionPanel({ days, onClose }: Props) {
  if (days.length === 0) return null;

  const totalSub = days.reduce((s, d) => s + d.submissions, 0);
  const totalAcc = days.reduce((s, d) => s + d.accepted, 0);
  const totalSolved = days.reduce((s, d) => s + d.solved, 0);
  const totalHard = days.reduce((s, d) => s + d.hardSolved, 0);
  const totalTime = days.reduce((s, d) => s + d.timeSpent, 0);
  const accRate = totalSub > 0 ? Math.round((totalAcc / totalSub) * 100) : 0;
  const hours = Math.floor(totalTime / 60);
  const mins = totalTime % 60;

  const start = days[0].date;
  const end = days[days.length - 1].date;

  return (
    <div
      className="rounded-xl border p-4 mt-4"
      style={{
        background: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>
          Selection
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-secondary transition-colors"
        >
          <X className="h-4 w-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
        </button>
      </div>
      <p className="text-xs mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {fmtDisplay(start)} — {fmtDisplay(end)}
      </p>
      <div className="space-y-1">
        <StatRow label="Submissions" value={totalSub} />
        <StatRow label="Accepted" value={totalAcc} />
        <StatRow label="Solved" value={totalSolved} />
        <StatRow label="Hard" value={totalHard} />
        <StatRow label="Acceptance" value={`${accRate}%`} />
        <StatRow label="Time" value={hours > 0 ? `${hours}h ${mins}m` : `${mins}m`} />
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex justify-between text-xs">
      <span style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</span>
      <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
    </div>
  );
}
