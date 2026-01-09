import { format, isSameDay } from 'date-fns';
import { X, Trash2, Edit2, Calendar, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlannerEvent, 
  getCategoryColor, 
  getCategoryLabel, 
  useDeletePlannerEvent,
  EventCategory 
} from '@/hooks/usePlannerEvents';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AddEventDialog } from './AddEventDialog';

interface DayEventsPanelProps {
  date: Date;
  events: PlannerEvent[];
  visibleCategories: EventCategory[];
  onClose: () => void;
}

export function DayEventsPanel({ date, events, visibleCategories, onClose }: DayEventsPanelProps) {
  const deleteEvent = useDeletePlannerEvent();

  const dayEvents = events.filter(event => {
    if (!visibleCategories.includes(event.category)) return false;
    
    const eventDate = new Date(event.event_date);
    if (event.end_date) {
      const endDate = new Date(event.end_date);
      return date >= eventDate && date <= endDate;
    }
    return isSameDay(eventDate, date);
  });

  const handleDelete = async (event: PlannerEvent) => {
    if (event.is_system_event) {
      toast.error('System events cannot be deleted');
      return;
    }

    try {
      await deleteEvent.mutateAsync(event.id);
      toast.success('Event deleted');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  return (
    <div className="arena-card rounded-xl p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-lg">
            {format(date, 'EEEE')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {format(date, 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddEventDialog defaultDate={date} />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {dayEvents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No events scheduled</p>
          <p className="text-sm mt-1">Click "Add Event" to create one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayEvents.map(event => (
            <div
              key={event.id}
              className={cn(
                "p-4 rounded-lg border transition-all",
                event.is_system_event 
                  ? "bg-muted/30 border-muted" 
                  : "bg-card border-border hover:border-primary/30"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "h-3 w-3 rounded-full mt-1.5 flex-shrink-0",
                    getCategoryColor(event.category)
                  )} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-heading font-semibold">{event.title}</p>
                      {event.is_system_event && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryLabel(event.category)}
                      </Badge>
                      {event.end_date && event.end_date !== event.event_date && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(event.event_date), 'MMM d')} - {format(new Date(event.end_date), 'MMM d')}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {!event.is_system_event && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(event)}
                    disabled={deleteEvent.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
