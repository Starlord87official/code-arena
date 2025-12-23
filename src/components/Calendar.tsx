import { useState } from 'react';
import { CalendarEvent, mockCalendarEvents } from '@/lib/mockData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface CalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export function Calendar({ events = mockCalendarEvents, onEventClick }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the beginning with empty days to start on Sunday
  const startPadding = monthStart.getDay();
  const paddedDays = [...Array(startPadding).fill(null), ...days];

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'contest': return 'bg-primary';
      case 'reminder': return 'bg-status-success';
      case 'deadline': return 'bg-destructive';
      case 'streak': return 'bg-status-warning';
    }
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="arena-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display font-bold text-lg">{format(currentMonth, 'MMMM yyyy')}</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-px bg-border">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-secondary p-2 text-center text-xs font-heading uppercase text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-border">
        {paddedDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="bg-card p-2 min-h-[60px]" />;
          }

          const dayEvents = getEventsForDate(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`bg-card p-2 min-h-[60px] text-left transition-all hover:bg-secondary/50 ${
                !isSameMonth(day, currentMonth) ? 'text-muted-foreground/50' : ''
              } ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}`}
            >
              <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-sm ${
                isToday ? 'bg-primary text-primary-foreground font-bold' : ''
              }`}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className={`h-1.5 w-full rounded-full ${getEventTypeColor(event.type)}`}
                    title={event.title}
                  />
                ))}
                {dayEvents.length > 2 && (
                  <p className="text-[10px] text-muted-foreground">+{dayEvents.length - 2}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="p-4 border-t border-border">
          <h4 className="font-heading font-semibold mb-3">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h4>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events scheduled</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map(event => (
                <button
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
                >
                  <div className={`h-3 w-3 rounded-full mt-1 flex-shrink-0 ${getEventTypeColor(event.type)}`} />
                  <div>
                    <p className="font-heading font-semibold text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="p-4 border-t border-border flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Contest</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-status-success" />
          <span className="text-xs text-muted-foreground">Reminder</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-destructive" />
          <span className="text-xs text-muted-foreground">Deadline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-status-warning" />
          <span className="text-xs text-muted-foreground">Streak</span>
        </div>
      </div>
    </div>
  );
}
