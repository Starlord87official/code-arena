import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCategory, getCategoryColor } from '@/hooks/usePlannerEvents';
import { cn } from '@/lib/utils';

interface CategoryFiltersProps {
  visibleCategories: EventCategory[];
  onToggle: (category: EventCategory) => void;
}

const FILTER_OPTIONS: { value: EventCategory; label: string; icon: string }[] = [
  { value: 'internship', label: 'Internship', icon: '💼' },
  { value: 'revision', label: 'Revision', icon: '🔄' },
  { value: 'contest', label: 'Contest', icon: '🏆' },
  { value: 'study', label: 'Study', icon: '📚' },
  { value: 'career', label: 'Career', icon: '🎯' },
  { value: 'personal', label: 'Personal', icon: '📌' },
];

export function CategoryFilters({ visibleCategories, onToggle }: CategoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_OPTIONS.map(option => {
        const isActive = visibleCategories.includes(option.value);
        return (
          <Button
            key={option.value}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onToggle(option.value)}
            className={cn(
              "gap-2",
              isActive && "bg-primary/90"
            )}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
            {isActive && <Check className="h-3 w-3" />}
          </Button>
        );
      })}
    </div>
  );
}

// Legend component for the calendar
export function CategoryLegend() {
  return (
    <div className="flex flex-wrap gap-4 p-4 border-t border-border">
      {FILTER_OPTIONS.map(option => (
        <div key={option.value} className="flex items-center gap-2">
          <div className={cn("h-2.5 w-2.5 rounded-full", getCategoryColor(option.value))} />
          <span className="text-xs text-muted-foreground">{option.label}</span>
        </div>
      ))}
    </div>
  );
}
