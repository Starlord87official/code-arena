import { useTopicRevisions, RevisionState } from '@/hooks/useRevisions';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicRevisionStatusProps {
  topicId: string;
  compact?: boolean;
}

const stateConfig: Record<RevisionState, { icon: React.ElementType; label: string; className: string }> = {
  pending: {
    icon: Clock,
    label: 'Pending',
    className: 'text-muted-foreground',
  },
  done: {
    icon: CheckCircle2,
    label: 'Done',
    className: 'text-green-600 dark:text-green-400',
  },
  missed: {
    icon: AlertTriangle,
    label: 'Missed',
    className: 'text-destructive',
  },
};

export function TopicRevisionStatus({ topicId, compact = false }: TopicRevisionStatusProps) {
  const { data: revisions, isLoading } = useTopicRevisions(topicId);

  if (isLoading || !revisions || revisions.length === 0) {
    return null;
  }

  if (compact) {
    // Show compact view with just icons
    return (
      <div className="flex items-center gap-1">
        {revisions.map((rev) => {
          const config = stateConfig[rev.state as RevisionState];
          const Icon = config.icon;
          const today = new Date().toISOString().split('T')[0];
          const isDueToday = rev.state === 'pending' && rev.scheduled_date === today;
          
          return (
            <div 
              key={rev.id} 
              className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full",
                rev.state === 'done' && "bg-green-100 dark:bg-green-900/30",
                rev.state === 'missed' && "bg-destructive/10",
                rev.state === 'pending' && isDueToday && "bg-primary/10 animate-pulse",
                rev.state === 'pending' && !isDueToday && "bg-muted"
              )}
              title={`Revision ${rev.revision_number}: ${config.label} (${new Date(rev.scheduled_date).toLocaleDateString()})`}
            >
              <Icon className={cn("h-3 w-3", config.className)} />
            </div>
          );
        })}
      </div>
    );
  }

  // Full view with details
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Revisions</p>
      <div className="flex flex-wrap gap-2">
        {revisions.map((rev) => {
          const config = stateConfig[rev.state as RevisionState];
          const Icon = config.icon;
          const today = new Date().toISOString().split('T')[0];
          const isDueToday = rev.state === 'pending' && rev.scheduled_date === today;
          
          return (
            <Badge 
              key={rev.id} 
              variant="outline"
              className={cn(
                "flex items-center gap-1",
                rev.state === 'done' && "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
                rev.state === 'missed' && "border-destructive/50 bg-destructive/10",
                isDueToday && "border-primary bg-primary/10 animate-pulse"
              )}
            >
              <Icon className={cn("h-3 w-3", config.className)} />
              <span className="text-xs">
                R{rev.revision_number}
                {isDueToday && " (Today)"}
              </span>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
