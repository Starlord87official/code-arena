import { useRef, useLayoutEffect, useState } from "react";
import type { DayData, Metric } from "@/lib/activityData";

interface Props {
  day: DayData;
  clientPos: { x: number; y: number };
  metric: Metric;
}

const METRIC_LABELS: Record<string, string> = {
  submissions: "Submissions",
  accepted: "Accepted",
  solved: "Solved",
};

export default function ActivityTooltip({ day, clientPos, metric }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; tx: string; ty: string }>({
    left: clientPos.x,
    top: clientPos.y - 14,
    tx: "-50%",
    ty: "-100%",
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 12;

    let left = clientPos.x;
    let top = clientPos.y - 14;
    let tx = "-50%";
    let ty = "-100%";

    // Flip below if too close to top
    if (top - rect.height - pad < 0) {
      top = clientPos.y + 14;
      ty = "0%";
    }
    // Flip horizontally if overflows right
    if (left + rect.width / 2 + pad > window.innerWidth) {
      tx = "-100%";
      left = clientPos.x - 8;
    }
    // Flip horizontally if overflows left
    if (left - rect.width / 2 - pad < 0) {
      tx = "0%";
      left = clientPos.x + 8;
    }

    setPos({ left, top, tx, ty });
  }, [clientPos.x, clientPos.y]);

  const acceptance =
    day.submissions > 0
      ? Math.round((day.accepted / day.submissions) * 100)
      : 0;

  const dateLabel = day.date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const metricValue = day[metric];

  return (
    <div
      ref={ref}
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: pos.left,
        top: pos.top,
        transform: `translate(${pos.tx}, ${pos.ty})`,
      }}
    >
      <div
        className="rounded-xl border px-3.5 py-2.5 text-xs shadow-xl backdrop-blur-md"
        style={{
          background: 'hsl(var(--popover))',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--popover-foreground))',
          minWidth: 180,
        }}
      >
        <p className="font-bold text-sm mb-1.5" style={{ color: 'hsl(var(--foreground))' }}>
          {dateLabel}
        </p>

        <div className="space-y-0.5 text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
          <Row label={METRIC_LABELS[metric]} value={metricValue} accent />
          <Row label="Submissions" value={day.submissions} />
          <Row label="Accepted" value={day.accepted} />
          <Row label="Wrong" value={day.wrong} danger={day.wrong > 0} />
          <Row label="Acceptance" value={`${acceptance}%`} accent={acceptance >= 70} />
        </div>

        {day.hardSolved > 0 && (
          <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="flex gap-0.5">
              {Array.from({ length: Math.min(day.hardSolved, 3) }).map((_, j) => (
                <span
                  key={j}
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: 'hsl(var(--neon-blue))' }}
                />
              ))}
            </div>
            <span className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {day.hardSolved} hard solved
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  danger,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span
        className="font-semibold"
        style={{
          color: danger
            ? 'hsl(var(--destructive))'
            : accent
            ? 'hsl(var(--primary))'
            : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}
