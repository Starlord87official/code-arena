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

// ── Seeded RNG ─────────────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Mock data ──────────────────────────────────────────────────
export function generateMockData(): DayData[] {
  const rand = seededRandom(42);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentDow = today.getDay();
  const thisSunday = new Date(today);
  thisSunday.setDate(today.getDate() - currentDow);

  const startDate = new Date(thisSunday);
  startDate.setDate(startDate.getDate() - 51 * 7);

  const data: DayData[] = [];

  for (let week = 0; week < 52; week++) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + week * 7 + day);
      date.setHours(0, 0, 0, 0);

      const isFuture = date > today;
      if (isFuture) {
        data.push(emptyDay(date, week, day));
        continue;
      }

      const isWeekday = day >= 1 && day <= 5;
      const activityChance = isWeekday ? 0.62 : 0.3;
      const weekPhase = Math.sin((week / 52) * Math.PI * 3.5);
      const streakBoost = weekPhase > 0.2 ? 1.6 : 1;

      if (rand() > activityChance * streakBoost * 0.7) {
        data.push(emptyDay(date, week, day));
        continue;
      }

      const submissions = Math.max(1, Math.round((rand() * 10 + 1) * streakBoost));
      const acceptanceRate = 0.25 + rand() * 0.7;
      const accepted = Math.max(0, Math.round(submissions * acceptanceRate));
      const wrong = submissions - accepted;
      const solved = Math.min(accepted, Math.round(accepted * (0.5 + rand() * 0.5)));
      const hardSolved = rand() < 0.14 ? Math.max(1, Math.round(rand() * 2)) : 0;
      const timeSpent = Math.round(submissions * (12 + rand() * 35));

      data.push({
        date,
        dateStr: fmtISO(date),
        submissions,
        accepted,
        wrong,
        solved,
        hardSolved,
        timeSpent,
        weekIndex: week,
        dayIndex: day,
      });
    }
  }
  return data;
}

function emptyDay(date: Date, week: number, day: number): DayData {
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
