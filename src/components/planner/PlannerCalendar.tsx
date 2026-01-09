import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday 
} from 'date-fns';
import { PlannerEvent, getCategoryColor, EventCategory } from '@/hooks/usePlannerEvents';
import { cn } from '@/lib/utils';

interface PlannerCalendarProps {
  events: PlannerEvent[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
  visibleCategories: EventCategory[];
}

export function PlannerCalendar({ 
  events, 
  onDateSelect, 
  selectedDate,
  visibleCategories 
}: PlannerCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the beginning with empty days to start on Sunday
  const startPadding = monthStart.getDay();
  const paddedDays = [...Array(startPadding).fill(null), ...days];

  // Filter events by visible categories
  const filteredEvents = useMemo(() => 
    events.filter(e => visibleCategories.includes(e.category)),
    [events, visibleCategories]
  );

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.event_date);
      if (event.end_date) {
        const endDate = new Date(event.end_date);
        return date >= eventDate && date <= endDate;
      }
      return isSameDay(eventDate, date);
    });
  };

  return (
    <div className="arena-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display font-bold text-xl">{format(currentMonth, 'MMMM yyyy')}</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCurrentMonth(new Date())}
            className="px-3"
          >
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-px bg-border">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-secondary p-3 text-center text-sm font-heading uppercase text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-border">
        {paddedDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="bg-card p-2 min-h-[100px]" />;
          }

          const dayEvents = getEventsForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                "bg-card p-2 min-h-[100px] text-left transition-all hover:bg-secondary/50",
                isSelected && "ring-2 ring-primary ring-inset bg-primary/5"
              )}
            >
              <span className={cn(
                "inline-flex items-center justify-center h-7 w-7 rounded-full text-sm",
                isTodayDate && "bg-primary text-primary-foreground font-bold"
              )}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={cn(
                      "h-1.5 w-full rounded-full",
                      getCategoryColor(event.category)
                    )}
                    title={event.title}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
