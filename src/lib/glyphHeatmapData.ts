import { format, subDays, eachDayOfInterval, getDay, startOfWeek, addDays, differenceInDays } from 'date-fns';

// === Data Types ===
export interface GlyphDayData {
  date: string; // YYYY-MM-DD
  submissions: number;
  accepted: number;
  wrong: number;
  solved: number;
  hardSolved: number;
  timeSpentMin: number;
  problems: string[];
}

export interface ProcessedGlyphDay extends GlyphDayData {
  weekIndex: number;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  fillLevel: number; // 0-1 normalized volume
  hue: number; // 0-120 (red to green)
  isActive: boolean;
  dateObj: Date;
}

export interface StreakSegment {
  startWeek: number;
  startDay: number;
  endWeek: number;
  endDay: number;
  length: number;
}

export interface StoryInsight {
  id: string;
  icon: string;
  title: string;
  value: string;
  description: string;
}

export type GlyphMetric = 'submissions' | 'accepted' | 'solved';

// === Configuration ===
export const TILE_SIZE = 13;
export const TILE_GAP = 3;
export const WEEKS_TO_SHOW = 52;

// === Mock Data Generator ===
export function generateMockGlyphData(): GlyphDayData[] {
  const today = new Date();
  const startDate = subDays(today, 364); // 52 weeks
  const days = eachDayOfInterval({ start: startDate, end: today });
  
  const data: GlyphDayData[] = [];
  
  days.forEach((day, index) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayOfWeek = getDay(day);
    
    // Create realistic activity patterns
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseChance = isWeekend ? 0.4 : 0.6;
    
    // Add seasonal variation (more active in certain periods)
    const monthFactor = Math.sin((index / 30) * Math.PI) * 0.2 + 0.8;
    const hasActivity = Math.random() < baseChance * monthFactor;
    
    if (hasActivity) {
      const intensity = Math.random();
      const submissions = Math.floor(intensity * 12) + 1;
      const acceptanceRate = 0.3 + Math.random() * 0.6; // 30-90% acceptance
      const accepted = Math.floor(submissions * acceptanceRate);
      const wrong = submissions - accepted;
      const solved = Math.min(accepted, Math.floor(Math.random() * 5) + 1);
      const hardSolved = Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0;
      
      const problemNames = Array.from({ length: solved }, (_, i) => 
        `problem-${dateStr}-${i}`
      );
      
      data.push({
        date: dateStr,
        submissions,
        accepted,
        wrong,
        solved,
        hardSolved,
        timeSpentMin: Math.floor(Math.random() * 120) + 15,
        problems: problemNames,
      });
    } else {
      data.push({
        date: dateStr,
        submissions: 0,
        accepted: 0,
        wrong: 0,
        solved: 0,
        hardSolved: 0,
        timeSpentMin: 0,
        problems: [],
      });
    }
  });
  
  return data;
}

// === Data Processing ===
export function processGlyphData(
  rawData: GlyphDayData[],
  metric: GlyphMetric
): {
  weeks: ProcessedGlyphDay[][];
  streaks: StreakSegment[];
  p95Value: number;
} {
  const today = new Date();
  const startDate = subDays(today, 364);
  const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });
  
  // Create a map for quick lookup
  const dataMap = new Map(rawData.map(d => [d.date, d]));
  
  // Calculate P95 for the selected metric
  const metricValues = rawData
    .map(d => d[metric])
    .filter(v => v > 0)
    .sort((a, b) => a - b);
  
  const p95Index = Math.floor(metricValues.length * 0.95);
  const p95Value = metricValues[p95Index] || 1;
  
  // Build weeks array
  const weeks: ProcessedGlyphDay[][] = [];
  let currentDate = weekStart;
  let weekIndex = 0;
  
  while (currentDate <= today) {
    const week: ProcessedGlyphDay[] = [];
    
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayData = dataMap.get(dateStr);
      
      const metricValue = dayData?.[metric] ?? 0;
      const logValue = Math.log(1 + metricValue);
      const fillLevel = Math.min(logValue / Math.log(1 + p95Value), 1);
      
      // Calculate hue based on acceptance ratio
      const submissions = dayData?.submissions ?? 0;
      const accepted = dayData?.accepted ?? 0;
      const acceptanceRatio = submissions > 0 ? accepted / submissions : 0;
      const hue = acceptanceRatio * 120; // 0 (red) to 120 (green)
      
      week.push({
        date: dateStr,
        submissions: dayData?.submissions ?? 0,
        accepted: dayData?.accepted ?? 0,
        wrong: dayData?.wrong ?? 0,
        solved: dayData?.solved ?? 0,
        hardSolved: dayData?.hardSolved ?? 0,
        timeSpentMin: dayData?.timeSpentMin ?? 0,
        problems: dayData?.problems ?? [],
        weekIndex,
        dayOfWeek,
        fillLevel,
        hue,
        isActive: metricValue > 0,
        dateObj: new Date(currentDate),
      });
      
      currentDate = addDays(currentDate, 1);
    }
    
    weeks.push(week);
    weekIndex++;
  }
  
  // Find streaks (consecutive active days)
  const streaks = findStreaks(weeks);
  
  return { weeks, streaks, p95Value };
}

function findStreaks(weeks: ProcessedGlyphDay[][]): StreakSegment[] {
  const streaks: StreakSegment[] = [];
  let currentStreak: { start: ProcessedGlyphDay; end: ProcessedGlyphDay; length: number } | null = null;
  
  // Flatten and iterate in chronological order
  for (let w = 0; w < weeks.length; w++) {
    for (let d = 0; d < weeks[w].length; d++) {
      const day = weeks[w][d];
      
      if (day.isActive) {
        if (!currentStreak) {
          currentStreak = { start: day, end: day, length: 1 };
        } else {
          currentStreak.end = day;
          currentStreak.length++;
        }
      } else {
        if (currentStreak && currentStreak.length >= 2) {
          streaks.push({
            startWeek: currentStreak.start.weekIndex,
            startDay: currentStreak.start.dayOfWeek,
            endWeek: currentStreak.end.weekIndex,
            endDay: currentStreak.end.dayOfWeek,
            length: currentStreak.length,
          });
        }
        currentStreak = null;
      }
    }
  }
  
  // Don't forget the last streak
  if (currentStreak && currentStreak.length >= 2) {
    streaks.push({
      startWeek: currentStreak.start.weekIndex,
      startDay: currentStreak.start.dayOfWeek,
      endWeek: currentStreak.end.weekIndex,
      endDay: currentStreak.end.dayOfWeek,
      length: currentStreak.length,
    });
  }
  
  return streaks;
}

// === Story Insights Generation ===
export function generateStoryInsights(rawData: GlyphDayData[]): StoryInsight[] {
  const insights: StoryInsight[] = [];
  const activeDays = rawData.filter(d => d.submissions > 0);
  
  if (activeDays.length === 0) {
    return [{
      id: 'no-activity',
      icon: '📊',
      title: 'Getting Started',
      value: 'No activity yet',
      description: 'Start solving problems to see your insights here!',
    }];
  }
  
  // 1. Most consistent weekdays
  const dayCount = [0, 0, 0, 0, 0, 0, 0];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  activeDays.forEach(d => {
    const dayOfWeek = new Date(d.date).getDay();
    dayCount[dayOfWeek]++;
  });
  
  const maxDayCount = Math.max(...dayCount);
  const mostActiveDay = dayNames[dayCount.indexOf(maxDayCount)];
  
  insights.push({
    id: 'consistent-day',
    icon: '📅',
    title: 'Most Active Day',
    value: mostActiveDay,
    description: `You're most consistent on ${mostActiveDay}s with ${maxDayCount} active days`,
  });
  
  // 2. Best streak
  let currentStreak = 0;
  let bestStreak = 0;
  let streakEnd = '';
  
  const sortedDays = [...rawData].sort((a, b) => a.date.localeCompare(b.date));
  
  for (let i = 0; i < sortedDays.length; i++) {
    if (sortedDays[i].submissions > 0) {
      currentStreak++;
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
        streakEnd = sortedDays[i].date;
      }
    } else {
      currentStreak = 0;
    }
  }
  
  if (bestStreak >= 2) {
    insights.push({
      id: 'best-streak',
      icon: '🔥',
      title: 'Longest Streak',
      value: `${bestStreak} days`,
      description: `Your best consistency run ended on ${format(new Date(streakEnd), 'MMM d')}`,
    });
  }
  
  // 3. Peak activity day
  const peakDay = activeDays.reduce((prev, curr) => 
    curr.submissions > prev.submissions ? curr : prev
  );
  
  insights.push({
    id: 'peak-day',
    icon: '⚡',
    title: 'Peak Activity',
    value: `${peakDay.submissions} submissions`,
    description: `On ${format(new Date(peakDay.date), 'MMM d, yyyy')} you were unstoppable!`,
  });
  
  // 4. Hard problems champion
  const totalHard = activeDays.reduce((sum, d) => sum + d.hardSolved, 0);
  if (totalHard > 0) {
    const peakHardDay = activeDays.reduce((prev, curr) => 
      curr.hardSolved > prev.hardSolved ? curr : prev
    );
    
    if (peakHardDay.hardSolved > 0) {
      insights.push({
        id: 'hard-solved',
        icon: '💎',
        title: 'Hard Problem Peak',
        value: `${peakHardDay.hardSolved} hard solved`,
        description: `On ${format(new Date(peakHardDay.date), 'MMM d')} — total ${totalHard} hard problems this year`,
      });
    }
  }
  
  return insights.slice(0, 4);
}

// === Selection Summary ===
export interface SelectionSummary {
  daysCount: number;
  totalProblems: number;
  totalSubmissions: number;
  totalAccepted: number;
  acceptanceRate: number;
  hardSolved: number;
  totalTimeMin: number;
  dateRange: string;
}

export function calculateSelectionSummary(days: ProcessedGlyphDay[]): SelectionSummary | null {
  if (days.length === 0) return null;
  
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const totalSubmissions = days.reduce((sum, d) => sum + d.submissions, 0);
  const totalAccepted = days.reduce((sum, d) => sum + d.accepted, 0);
  
  return {
    daysCount: days.length,
    totalProblems: days.reduce((sum, d) => sum + d.solved, 0),
    totalSubmissions,
    totalAccepted,
    acceptanceRate: totalSubmissions > 0 ? (totalAccepted / totalSubmissions) * 100 : 0,
    hardSolved: days.reduce((sum, d) => sum + d.hardSolved, 0),
    totalTimeMin: days.reduce((sum, d) => sum + d.timeSpentMin, 0),
    dateRange: days.length === 1 
      ? format(new Date(sorted[0].date), 'MMM d, yyyy')
      : `${format(new Date(sorted[0].date), 'MMM d')} - ${format(new Date(sorted[sorted.length - 1].date), 'MMM d, yyyy')}`,
  };
}
