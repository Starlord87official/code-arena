import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval, getDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityDay {
  date: string;
  count: number;
}

interface Props {
  activity: ActivityDay[];
  currentStreak: number;
  activeDaysLast30: number;
  dailyTarget?: number;
  className?: string;
}

export function ProfileActivityHeatmap({ 
  activity, 
  currentStreak, 
  activeDaysLast30,
  dailyTarget = 3,
  className 
}: Props) {
  const heatmapData = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 182); // ~6 months
    const days = eachDayOfInterval({ start: startDate, end: today });
    
    // Create a map for quick lookup
    const activityMap = new Map(
      activity.map((a) => [a.date, a.count])
    );

    // Group by weeks
    const weeks: { date: Date; count: number }[][] = [];
    let currentWeek: { date: Date; count: number }[] = [];
    
    // Pad the first week
    const firstDayOfWeek = getDay(days[0]);
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: subDays(days[0], firstDayOfWeek - i), count: -1 }); // -1 means empty
    }

    days.forEach((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const count = activityMap.get(dateStr) ?? 0;
      
      if (getDay(day) === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push({ date: day, count });
    });
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [activity]);

  const getIntensityClass = (count: number): string => {
    if (count === -1) return 'bg-transparent';
    if (count === 0) return 'bg-secondary/30';
    
    const ratio = count / dailyTarget;
    
    if (ratio >= 1.5) return 'bg-primary shadow-[0_0_6px_hsl(var(--primary))]';
    if (ratio >= 1) return 'bg-primary/80';
    if (ratio >= 0.5) return 'bg-primary/50';
    return 'bg-primary/25';
  };

  const months = useMemo(() => {
    const result: { name: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    
    heatmapData.forEach((week, weekIndex) => {
      const firstDay = week.find(d => d.count !== -1);
      if (firstDay) {
        const month = firstDay.date.getMonth();
        if (month !== lastMonth) {
          result.push({ name: format(firstDay.date, 'MMM'), weekIndex });
          lastMonth = month;
        }
      }
    });
    
    return result;
  }, [heatmapData]);

  // Calculate total problems in visible period
  const totalProblems = activity.reduce((sum, a) => sum + a.count, 0);

  // Calculate best streak (consecutive days with activity)
  const bestConsecutiveRun = useMemo(() => {
    let maxRun = 0;
    let currentRun = 0;
    
    activity.forEach((a) => {
      if (a.count > 0) {
        currentRun++;
        maxRun = Math.max(maxRun, currentRun);
      } else {
        currentRun = 0;
      }
    });
    
    return maxRun;
  }, [activity]);

  return (
    <div className={cn("arena-card p-4 rounded-xl", className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Activity
        </h3>
        
        <div className="flex items-center gap-4">
          {/* Current Streak */}
          <div className="flex items-center gap-1.5">
            <Flame className={cn(
              "h-4 w-4",
              currentStreak > 0 ? "text-status-warning" : "text-muted-foreground"
            )} />
            <span className="text-sm font-bold">{currentStreak}</span>
            <span className="text-xs text-muted-foreground">day streak</span>
          </div>
          
          {/* Active Days */}
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-status-success" />
            <span className="text-sm font-bold">{activeDaysLast30}</span>
            <span className="text-xs text-muted-foreground">/30 days</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">
          {totalProblems} problems in the last 6 months
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-secondary/30" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/25" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/50" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/80" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Month labels */}
      <div className="flex mb-1 text-[10px] text-muted-foreground">
        {months.map((m, i) => (
          <span 
            key={i} 
            className="flex-shrink-0"
            style={{ 
              marginLeft: i === 0 ? 0 : `${(m.weekIndex - (months[i - 1]?.weekIndex || 0) - 1) * 12}px`,
              width: '24px'
            }}
          >
            {m.name}
          </span>
        ))}
      </div>

      {/* Heatmap Grid */}
      <TooltipProvider>
        <div className="overflow-x-auto">
          <div className="flex gap-0.5" style={{ minWidth: 'fit-content' }}>
            {heatmapData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {week.map((day, dayIndex) => (
                  <Tooltip key={dayIndex} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div 
                        className={cn(
                          "w-2.5 h-2.5 rounded-sm transition-all cursor-pointer hover:ring-1 hover:ring-primary/50",
                          getIntensityClass(day.count)
                        )}
                      />
                    </TooltipTrigger>
                    {day.count !== -1 && (
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">{day.count} problems</p>
                        <p className="text-muted-foreground">{format(day.date, 'MMM d, yyyy')}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>

      {/* Day labels */}
      <div className="flex mt-1 text-[9px] text-muted-foreground justify-between px-1">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Best run indicator */}
      {bestConsecutiveRun > 7 && (
        <div className="mt-3 pt-3 border-t border-border/50 text-center">
          <span className="text-xs text-muted-foreground">
            Best consistency run: <span className="font-bold text-primary">{bestConsecutiveRun} days</span>
          </span>
        </div>
      )}
    </div>
  );
}
