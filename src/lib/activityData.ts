// ── Types ──────────────────────────────────────────────────────
export interface DayData {
  date: Date;
  dateStr: string;
  submissions: number;
  accepted: number;
  wrong: number;
  solved: number;
  hardSolved: number;
  timeSpent: number; // minutes
  weekIndex: number;
  dayIndex: number; // 0 = Sun … 6 = Sat
}

export type Metric = "submissions" | "accepted" | "solved";

// ── Layout constants (shared across components) ────────────────
export const TILE_W = 14;
export const TILE_H = 22;
export const GAP = 6;
export const TILE_RADIUS = 6;
export const FILL_INSET = 2;
export const FILL_RADIUS = 4;
export const GRID_COLS = 52;
export const GRID_ROWS = 7;
export const GRID_W = GRID_COLS * (TILE_W + GAP) - GAP;
export const GRID_H = GRID_ROWS * (TILE_H + GAP) - GAP;

// ── Empty day helper (used by useHeatmapData) ─────────────────
export function emptyDay(date: Date, week: number, day: number): DayData {
  return {
    date,
    dateStr: fmtISO(date),
    submissions: 0,
    accepted: 0,
    wrong: 0,
    solved: 0,
    hardSolved: 0,
    timeSpent: 0,
    weekIndex: week,
    dayIndex: day,
  };
}

// ── Helpers ────────────────────────────────────────────────────
export function fmtISO(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function fmtDisplay(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getMetricValue(day: DayData, metric: Metric): number {
  return day[metric];
}

export function getMaxMetric(data: DayData[], metric: Metric): number {
  return Math.max(1, ...data.map((d) => getMetricValue(d, metric)));
}

/**
 * Percentile-based P95 cap + log scaling.
 * Returns [0, 1].
 */
export function percentileLogScale(value: number, data: DayData[], metric: Metric): number {
  if (value <= 0) return 0;
  const values = data.map((d) => getMetricValue(d, metric)).filter((v) => v > 0).sort((a, b) => a - b);
  if (values.length === 0) return 0;
  const p95 = values[Math.min(values.length - 1, Math.floor(values.length * 0.95))];
  const capped = Math.min(value, p95);
  return Math.log(1 + capped) / Math.log(1 + p95);
}

/** Log-scale [0,1] */
export function logScale(value: number, max: number): number {
  if (value <= 0) return 0;
  return Math.log(1 + value) / Math.log(1 + max);
}

/**
 * Quality color: hue interpolation red(0) → yellow(55) → green(120).
 * Saturation 60%, lightness 48% – constant for readability on both themes.
 */
export function getQualityColor(ratio: number): string {
  const r = Math.max(0, Math.min(1, ratio));
  // 0 -> 0 (red), 0.5 -> 55 (yellow), 1 -> 120 (green)
  const hue = r < 0.5 ? r * 2 * 55 : 55 + (r - 0.5) * 2 * 65;
  return `hsl(${Math.round(hue)}, 60%, 48%)`;
}

// ── Insights ───────────────────────────────────────────────────
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function generateInsights(data: DayData[]): string[] {
  // Most consistent days
  const dayTotals = Array(7).fill(0) as number[];
  data.forEach((d) => (dayTotals[d.dayIndex] += d.solved));
  const sorted = dayTotals
    .map((t, i) => ({ n: DAY_NAMES[i], t }))
    .sort((a, b) => b.t - a.t);

  // Best week
  const weekMap = new Map<number, number>();
  data.forEach((d) => weekMap.set(d.weekIndex, (weekMap.get(d.weekIndex) ?? 0) + d.solved));
  const bestWeek = Math.max(...weekMap.values(), 0);

  // Longest streak
  let maxStreak = 0;
  let cur = 0;
  data.forEach((d) => {
    if (d.submissions > 0) {
      cur++;
      maxStreak = Math.max(maxStreak, cur);
    } else {
      cur = 0;
    }
  });

  return [
    `Most consistent on ${sorted[0].n} & ${sorted[1].n}`,
    `Best week: ${bestWeek} solved`,
    `Longest streak: ${maxStreak} days`,
  ];
}

// ── Month labels ───────────────────────────────────────────────
export function getMonthLabels(data: DayData[]): { label: string; weekIndex: number }[] {
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const labels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  for (const d of data) {
    const m = d.date.getMonth();
    if (m !== lastMonth && d.dayIndex === 0) {
      labels.push({ label: MONTHS[m], weekIndex: d.weekIndex });
      lastMonth = m;
    }
  }
  return labels;
}
