import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlannerEvents, EventCategory } from '@/hooks/usePlannerEvents';
import { PlannerCalendar } from '@/components/planner/PlannerCalendar';
import { DayEventsPanel } from '@/components/planner/DayEventsPanel';
import { CategoryFilters, CategoryLegend } from '@/components/planner/CategoryFilters';
import { AddEventDialog } from '@/components/planner/AddEventDialog';

const ALL_CATEGORIES: EventCategory[] = ['internship', 'revision', 'contest', 'study', 'career', 'personal'];

export default function Planner() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<EventCategory[]>(ALL_CATEGORIES);

  const { data: events = [], isLoading: eventsLoading } = usePlannerEvents();

  const toggleCategory = (category: EventCategory) => {
    setVisibleCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">Planner</h1>
                <p className="text-muted-foreground">Organize your study goals and deadlines</p>
              </div>
            </div>
            <AddEventDialog />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">Filter by category:</p>
          <CategoryFilters 
            visibleCategories={visibleCategories} 
            onToggle={toggleCategory} 
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            {eventsLoading ? (
              <div className="arena-card rounded-xl p-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <PlannerCalendar
                  events={events}
                  onDateSelect={setSelectedDate}
                  selectedDate={selectedDate}
                  visibleCategories={visibleCategories}
                />
                <CategoryLegend />
              </>
            )}
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1">
            {selectedDate ? (
              <DayEventsPanel
                date={selectedDate}
                events={events}
                visibleCategories={visibleCategories}
                onClose={() => setSelectedDate(null)}
              />
            ) : (
              <div className="arena-card rounded-xl p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-display font-semibold mb-2">Select a Date</h3>
                <p className="text-sm text-muted-foreground">
                  Click on any date in the calendar to view or add events
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
