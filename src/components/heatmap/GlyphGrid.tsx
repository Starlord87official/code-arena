import { useMemo, useState, memo, useCallback } from "react";
import type { DayData, Metric } from "@/lib/activityData";
import {
  getMetricValue,
  percentileLogScale,
  getQualityColor,
  getMonthLabels,
  TILE_W,
  TILE_H,
  GAP,
  TILE_RADIUS,
  FILL_INSET,
  FILL_RADIUS,
  GRID_W,
  GRID_H,
} from "@/lib/activityData";

/* ── styling tokens (CSS variables for theme support) ─── */
const TILE_EMPTY_BG = "var(--tile-empty-bg)";
const TILE_BORDER = "var(--tile-border)";
const HOVER_RING = "var(--ring-hover)";
const SELECTED_RING = "var(--ring-selected)";
const TREND_COLOR = "var(--trend-color)";

interface GlyphGridProps {
  data: DayData[];
  metric: Metric;
  activeRange: [number, number] | null;
  showTrend: boolean;
  showMarkers: boolean;
  onTileMouseDown: (i: number, e: React.MouseEvent) => void;
  onTileMouseEnter: (i: number, e: React.MouseEvent) => void;
  onTileMouseMove: (e: React.MouseEvent) => void;
  onTileMouseLeave: () => void;
}

/* ── pre-computed tile data (stable unless data/metric change) ── */
interface TileData {
  day: DayData;
  index: number;
  fillHeight: number;
  qualityColor: string;
  hasActivity: boolean;
  isFuture: boolean;
  ariaLabel: string;
}

function computeTileData(data: DayData[], metric: Metric, today: Date): TileData[] {
  const maxFillHeight = TILE_H - FILL_INSET * 2;
  return data.map((day, i) => {
    const val = getMetricValue(day, metric);
    const fillRatio = val > 0 ? percentileLogScale(val, data, metric) : 0;
    const fillHeight = fillRatio * maxFillHeight;
    const hasActivity = day.submissions > 0;
    const ratio = day.submissions > 0 ? day.accepted / day.submissions : 0;
    const qualityColor = hasActivity ? getQualityColor(ratio) : "transparent";
    const isFuture = day.date > today;
    const dateLabel = day.date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const ariaLabel = hasActivity
      ? `${dateLabel}: ${day.submissions} submissions, ${day.accepted} accepted, ${day.solved} solved`
      : `${dateLabel}: no activity`;
    return { day, index: i, fillHeight, qualityColor, hasActivity, isFuture, ariaLabel };
  });
}

/* ── memoized single tile ─────────────────────────────── */
const GlyphTile = memo(function GlyphTile({
  tile,
  inRange,
  showMarkers,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}: {
  tile: TileData;
  inRange: boolean;
  showMarkers: boolean;
  onMouseDown: (i: number, e: React.MouseEvent) => void;
  onMouseEnter: (i: number, e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}) {
  const { day, index, fillHeight, qualityColor, isFuture, ariaLabel } = tile;

  return (
    <g
      role="button"
      tabIndex={isFuture ? -1 : 0}
      aria-label={ariaLabel}
      style={{ cursor: isFuture ? "default" : "pointer" }}
      onMouseDown={(e) => onMouseDown(index, e)}
      onMouseEnter={(e) => onMouseEnter(index, e)}
      onMouseLeave={onMouseLeave}
    >
      {/* tile background */}
      <rect
        x={day.weekIndex * (TILE_W + GAP)}
        y={day.dayIndex * (TILE_H + GAP)}
        width={TILE_W}
        height={TILE_H}
        rx={TILE_RADIUS}
        fill={TILE_EMPTY_BG}
        stroke={inRange ? SELECTED_RING : TILE_BORDER}
        strokeWidth={inRange ? 1.5 : 0.5}
      />

      {/* liquid fill bar */}
      {fillHeight > 0 && (
        <rect
          x={day.weekIndex * (TILE_W + GAP) + FILL_INSET}
          y={day.dayIndex * (TILE_H + GAP) + TILE_H - FILL_INSET - fillHeight}
          width={TILE_W - FILL_INSET * 2}
          height={fillHeight}
          rx={FILL_RADIUS}
          fill={qualityColor}
          opacity={0.85}
        />
      )}

      {/* hard-solved marker */}
      {showMarkers && day.hardSolved > 0 && (
        <g transform={`translate(${day.weekIndex * (TILE_W + GAP) + TILE_W / 2}, ${day.dayIndex * (TILE_H + GAP) - 1})`}>
          {Array.from({ length: Math.min(day.hardSolved, 2) }).map((_, j) => (
            <circle
              key={j}
              cx={j * 5 - (Math.min(day.hardSolved, 2) - 1) * 2.5}
              cy={0}
              r={2}
              fill="hsl(var(--neon-blue))"
              opacity={0.9}
            />
          ))}
        </g>
      )}

      {/* solved count dots */}
      {showMarkers && day.solved > 0 && day.solved <= 3 && !day.hardSolved && (
        <g transform={`translate(${day.weekIndex * (TILE_W + GAP) + TILE_W / 2}, ${day.dayIndex * (TILE_H + GAP) + TILE_H + 4})`}>
          {Array.from({ length: day.solved }).map((_, j) => (
            <circle
              key={j}
              cx={j * 4 - (day.solved - 1) * 2}
              cy={0}
              r={1.5}
              fill="hsl(var(--muted-foreground))"
              opacity={0.6}
            />
          ))}
        </g>
      )}

      {/* hover ring */}
      <rect
        x={day.weekIndex * (TILE_W + GAP) - 1}
        y={day.dayIndex * (TILE_H + GAP) - 1}
        width={TILE_W + 2}
        height={TILE_H + 2}
        rx={TILE_RADIUS + 1}
        fill="none"
        stroke={HOVER_RING}
        strokeWidth={1.5}
        opacity={0}
        className="transition-opacity duration-100"
        style={{ pointerEvents: "none" }}
      >
        <set attributeName="opacity" to="1" begin="mouseover" end="mouseout" />
      </rect>
    </g>
  );
});

/* ── main grid ────────────────────────────────────────── */
export default function GlyphGrid({
  data,
  metric,
  activeRange,
  showTrend,
  showMarkers,
  onTileMouseDown,
  onTileMouseEnter,
  onTileMouseMove,
  onTileMouseLeave,
}: GlyphGridProps) {
  const monthLabels = useMemo(() => getMonthLabels(data), [data]);
  const [gridHovered, setGridHovered] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const tiles = useMemo(() => computeTileData(data, metric, today), [data, metric, today]);

  const { trendPath, trendMarkers } = useMemo(
    () => computeWeeklyTrend(data, metric),
    [data, metric]
  );

  const longestStreakPath = useMemo(
    () => computeLongestStreakPath(data),
    [data]
  );

  // Trend behind tiles: 0.16-0.22 default → 0.30 on grid hover (150ms)
  const trendOpacity = gridHovered ? 0.30 : 0.18;
  const markerOpacity = gridHovered ? 0.50 : 0.25;

  const handleGridEnter = useCallback(() => setGridHovered(true), []);
  const handleGridLeave = useCallback(() => {
    setGridHovered(false);
    onTileMouseLeave();
  }, [onTileMouseLeave]);

  const MARGIN_LEFT = 28;
  const MARGIN_TOP = 18;
  const svgW = MARGIN_LEFT + GRID_W + 8;
  const svgH = MARGIN_TOP + GRID_H + 12;

  return (
    <div className="relative select-none overflow-x-auto">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        onMouseMove={onTileMouseMove}
        onMouseEnter={handleGridEnter}
        onMouseLeave={handleGridLeave}
        className="block"
      >
        {/* month labels */}
        <g transform={`translate(${MARGIN_LEFT}, 12)`}>
          {monthLabels.map((m) => (
            <text
              key={m.weekIndex}
              x={m.weekIndex * (TILE_W + GAP)}
              y={0}
              fontSize={10}
              fill="hsl(var(--muted-foreground))"
              className="select-none"
            >
              {m.label}
            </text>
          ))}
        </g>

        {/* day labels */}
        <g transform={`translate(0, ${MARGIN_TOP})`}>
          {[1, 3, 5].map((di) => (
            <text
              key={di}
              x={MARGIN_LEFT - 6}
              y={di * (TILE_H + GAP) + TILE_H / 2 + 3}
              fontSize={9}
              fill="hsl(var(--muted-foreground))"
              textAnchor="end"
              className="select-none"
            >
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][di]}
            </text>
          ))}
        </g>

        {/* grid + overlays */}
        <g transform={`translate(${MARGIN_LEFT}, ${MARGIN_TOP})`}>
          {/* SVG behind tiles: z-0, pointer-events none */}
          <g style={{ pointerEvents: "none" }}>
            {/* Longest streak */}
            {longestStreakPath && (
              <path
                d={longestStreakPath}
                fill="none"
                stroke="hsl(var(--neon-cyan))"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.22}
              />
            )}

            {/* Weekly trend line */}
            {showTrend && trendPath && (
              <path
                d={trendPath}
                fill="none"
                stroke={TREND_COLOR}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={trendOpacity}
                className="transition-opacity duration-150"
              />
            )}

            {/* Trend markers */}
            {showTrend &&
              trendMarkers.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={2.5}
                  fill={TREND_COLOR}
                  opacity={markerOpacity}
                  className="transition-opacity duration-150"
                />
              ))}
          </g>

          {/* tile grid */}
          {tiles.map((tile) => (
            <GlyphTile
              key={tile.index}
              tile={tile}
              inRange={
                !!activeRange &&
                tile.index >= activeRange[0] &&
                tile.index <= activeRange[1]
              }
              showMarkers={showMarkers}
              onMouseDown={onTileMouseDown}
              onMouseEnter={onTileMouseEnter}
              onMouseLeave={onTileMouseLeave}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
function computeWeeklyTrend(
  data: DayData[],
  metric: Metric
): { trendPath: string | null; trendMarkers: { x: number; y: number }[] } {
  const weekBuckets = new Map<number, number[]>();
  for (const d of data) {
    const val = getMetricValue(d, metric);
    if (!weekBuckets.has(d.weekIndex)) weekBuckets.set(d.weekIndex, []);
    weekBuckets.get(d.weekIndex)!.push(val);
  }

  const weeklyAvgs: { week: number; avg: number }[] = [];
  for (let w = 0; w < 52; w++) {
    const vals = weekBuckets.get(w) ?? [];
    const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    weeklyAvgs.push({ week: w, avg });
  }

  const maxAvg = Math.max(...weeklyAvgs.map((w) => w.avg), 1);
  const MARGIN_TOP = 8;
  const MARGIN_BOTTOM = 8;
  const usableHeight = GRID_H - MARGIN_TOP - MARGIN_BOTTOM;

  const points = weeklyAvgs.map((w) => ({
    x: w.week * (TILE_W + GAP) + TILE_W / 2,
    y: MARGIN_TOP + usableHeight * (1 - w.avg / maxAvg),
  }));

  if (points.length < 2) return { trendPath: null, trendMarkers: [] };

  const trendPath = buildCatmullRomPath(points);

  const markerCount = 10;
  const step = Math.floor((points.length - 1) / (markerCount - 1));
  const trendMarkers: { x: number; y: number }[] = [];
  for (let i = 0; i < markerCount; i++) {
    trendMarkers.push(points[Math.min(i * step, points.length - 1)]);
  }

  return { trendPath, trendMarkers };
}

function computeLongestStreakPath(data: DayData[]): string | null {
  const activeDays = data
    .filter((d) => d.submissions > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  if (activeDays.length < 2) return null;

  const ONE_DAY = 24 * 60 * 60 * 1000;
  const center = (d: DayData) => ({
    x: d.weekIndex * (TILE_W + GAP) + TILE_W / 2,
    y: d.dayIndex * (TILE_H + GAP) + TILE_H / 2,
  });

  let longest: DayData[] = [];
  let current: DayData[] = [activeDays[0]];

  for (let i = 1; i < activeDays.length; i++) {
    if (activeDays[i].date.getTime() - activeDays[i - 1].date.getTime() === ONE_DAY) {
      current.push(activeDays[i]);
    } else {
      if (current.length > longest.length) longest = current;
      current = [activeDays[i]];
    }
  }
  if (current.length > longest.length) longest = current;
  if (longest.length < 2) return null;

  const pts = longest.map(center);
  return "M " + pts.map((p) => `${p.x} ${p.y}`).join(" L ");
}

function buildCatmullRomPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return path + ` L ${points[1].x} ${points[1].y}`;

  const tension = 4;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    path += ` C ${p1.x + (p2.x - p0.x) / tension} ${p1.y + (p2.y - p0.y) / tension}, ${p2.x - (p3.x - p1.x) / tension} ${p2.y - (p3.y - p1.y) / tension}, ${p2.x} ${p2.y}`;
  }
  return path;
}
