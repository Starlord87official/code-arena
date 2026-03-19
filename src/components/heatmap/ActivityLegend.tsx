import { getQualityColor } from "@/lib/activityData";

interface Props {
  showTrend: boolean;
  showMarkers: boolean;
}

export default function ActivityLegend({ showTrend, showMarkers }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-5 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
      {/* volume – mini liquid bars */}
      <div className="flex items-center gap-1.5">
        <span className="font-medium">Volume</span>
        <div className="flex items-end gap-[2px]">
          {[25, 50, 75, 100].map((h, i) => (
            <div
              key={i}
              className="w-[6px] rounded-sm"
              style={{
                height: `${h / 8}px`,
                background: 'hsl(var(--primary))',
                opacity: 0.3 + (i * 0.2),
              }}
            />
          ))}
        </div>
        <span className="opacity-60">Low → High</span>
      </div>

      {/* quality – colored chips */}
      <div className="flex items-center gap-1.5">
        <span className="font-medium">Quality</span>
        <div className="flex gap-[2px]">
          {[0, 0.33, 0.66, 1].map((r) => (
            <div
              key={r}
              className="w-3 h-3 rounded-sm"
              style={{ background: getQualityColor(r) }}
            />
          ))}
        </div>
        <span className="opacity-60">Low → High acceptance</span>
      </div>

      {/* hard solved icon */}
      {showMarkers && (
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: 'hsl(var(--neon-blue))' }}
          />
          <span>Hard solved</span>
        </div>
      )}

      {/* solved count */}
      {showMarkers && (
        <div className="flex items-center gap-1.5">
          <div className="flex gap-[2px]">
            {[0, 1, 2].map((j) => (
              <span
                key={j}
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: 'hsl(var(--muted-foreground))', opacity: 0.6 }}
              />
            ))}
          </div>
          <span>Solved count</span>
        </div>
      )}

      {/* trend label */}
      {showTrend && (
        <div className="flex items-center gap-1.5">
          <div
            className="w-4 h-[2px] rounded"
            style={{ background: 'var(--trend-color)' }}
          />
          <span>Trend = weekly avg (selected metric)</span>
        </div>
      )}
    </div>
  );
}
