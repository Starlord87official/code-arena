import { useMemo } from 'react';
import { useTargets } from '@/hooks/useTargets';
import { format, subDays, eachDayOfInterval, startOfWeek, getDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ActivityHeatmap() {
  const { activity, targets, isLoading } = useTargets();

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
    
    const dailyTarget = targets?.daily || 3;
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

  if (isLoading) {
    return (
      <div className="arena-card p-4 rounded-xl animate-pulse">
        <div className="h-5 bg-muted rounded w-1/3 mb-3"></div>
        <div className="h-24 bg-muted rounded"></div>
      </div>
    );
  }

  // Check if user has any real activity
  const hasActivity = activity.length > 0;

  return (
    <div className="arena-card p-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-sm">Activity</h3>
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

      {!hasActivity ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No activity yet. Solve challenges to build your streak.
          </p>
        </div>
      ) : (
        <>
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
                            className={`w-2.5 h-2.5 rounded-sm transition-all cursor-pointer hover:ring-1 hover:ring-primary/50 ${getIntensityClass(day.count)}`}
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
        </>
      )}
    </div>
  );
}
