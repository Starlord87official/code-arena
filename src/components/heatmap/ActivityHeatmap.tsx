import { useMemo, useState } from "react";
import {
  generateMockData,
  generateInsights,
  type Metric,
} from "@/lib/activityData";
import { useActivitySelection } from "@/hooks/useActivitySelection";
import GlyphGrid from "./GlyphGrid";
import ActivityTooltip from "./ActivityTooltip";
import RangeSummary from "./RangeSummary";
import InsightLines from "./InsightLines";
import ActivityLegend from "./ActivityLegend";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ActivityHeatmap() {
  const data = useMemo(() => generateMockData(), []);
  const insights = useMemo(() => generateInsights(data), [data]);
  const [metric, setMetric] = useState<Metric>("submissions");
  const [showTrend, setShowTrend] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);

  const {
    hoveredDay,
    hoverClientPos,
    activeRange,
    selectedDays,
    isDragging,
    dragClientPos,
    containerRef,
    handleMouseDown,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
    clearSelection,
  } = useActivitySelection(data);

  const hasSelection = selectedDays.length > 0;

  // Floating drag label text
  const dragLabel = useMemo(() => {
    if (!isDragging || !activeRange) return null;
    const startDay = data[activeRange[0]];
    const endDay = data[activeRange[1]];
    if (!startDay || !endDay) return null;
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `Selecting: ${fmt(startDay.date)} → ${fmt(endDay.date)}`;
  }, [isDragging, activeRange, data]);

  return (
    <div ref={containerRef} className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            Problem Solving Activity
          </h2>
          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Last 52 weeks · drag to select a range
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ToggleChip
            active={showMarkers}
            onClick={() => setShowMarkers((v) => !v)}
            icon={
              <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                <circle cx={5} cy={7} r={2} fill="hsl(var(--neon-blue))" opacity={0.8} />
                <circle cx={10} cy={7} r={2} fill="hsl(var(--muted-foreground))" opacity={0.5} />
              </svg>
            }
            label={showMarkers ? "Markers" : "Markers off"}
          />
          <ToggleChip
            active={showTrend}
            onClick={() => setShowTrend((v) => !v)}
            icon={
              <svg width={16} height={10} viewBox="0 0 16 10" fill="none">
                <path d="M1 8 Q4 2, 8 5 T15 2" stroke="var(--trend-color)" strokeWidth={1.5} fill="none" />
              </svg>
            }
            label={showTrend ? "Trend on" : "Trend off"}
          />
          <Select value={metric} onValueChange={(v) => setMetric(v as Metric)}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="submissions">Submissions</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* grid */}
      <GlyphGrid
        data={data}
        metric={metric}
        activeRange={activeRange}
        showTrend={showTrend}
        showMarkers={showMarkers}
        onTileMouseDown={handleMouseDown}
        onTileMouseEnter={handleMouseEnter}
        onTileMouseMove={handleMouseMove}
        onTileMouseLeave={handleMouseLeave}
      />

      {/* inline range summary */}
      {hasSelection && (
        <RangeSummary days={selectedDays} onClose={clearSelection} />
      )}

      <InsightLines insights={insights} />
      <ActivityLegend showTrend={showTrend} showMarkers={showMarkers} />

      {/* tooltip portal */}
      {!isDragging && hoveredDay && hoveredDay.submissions > 0 && hoverClientPos && (
        <ActivityTooltip day={hoveredDay} clientPos={hoverClientPos} metric={metric} />
      )}

      {/* floating drag label */}
      {isDragging && dragLabel && dragClientPos && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: dragClientPos.x,
            top: dragClientPos.y - 36,
            transform: "translateX(-50%)",
          }}
        >
          <div
            className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg border"
            style={{
              background: 'hsl(var(--popover))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            }}
          >
            {dragLabel}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── small toggle chip ──────────────────────────────────── */
function ToggleChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors"
      style={{
        background: active ? 'hsl(var(--secondary))' : 'transparent',
        borderColor: active ? 'hsl(var(--border))' : 'transparent',
        color: active ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
      }}
    >
      {icon}
      {label}
    </button>
  );
}
