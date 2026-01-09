import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRevisionSummary, useRevisionsDueToday, useMissedRevisions } from '@/hooks/useRevisions';
import { AlertTriangle, CalendarCheck, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function RevisionSummaryCard() {
  const { data: summary, isLoading: summaryLoading } = useRevisionSummary();
  const { data: dueToday, isLoading: dueTodayLoading } = useRevisionsDueToday();
  const { data: missed, isLoading: missedLoading } = useMissedRevisions();

  const isLoading = summaryLoading || dueTodayLoading || missedLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasDueToday = (summary?.due_today || 0) > 0;
  const hasMissed = (summary?.missed || 0) > 0;

  return (
    <Card className={cn(
      hasMissed && "border-destructive/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Spaced Repetition</CardTitle>
          </div>
          {hasMissed && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {summary?.missed} Missed
            </Badge>
          )}
        </div>
        <CardDescription>
          Keep your knowledge fresh with scheduled revisions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Due Today */}
        <div className={cn(
          "flex items-center justify-between p-3 rounded-lg border",
          hasDueToday 
            ? "bg-primary/10 border-primary/30" 
            : "bg-muted/50 border-border"
        )}>
          <div className="flex items-center gap-3">
            <CalendarCheck className={cn(
              "h-5 w-5",
              hasDueToday ? "text-primary" : "text-muted-foreground"
            )} />
            <div>
              <p className="font-medium text-sm">Due Today</p>
              {hasDueToday && dueToday && dueToday.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {dueToday.slice(0, 2).map(r => r.topic_name).join(', ')}
                  {dueToday.length > 2 && ` +${dueToday.length - 2} more`}
                </p>
              )}
            </div>
          </div>
          <Badge variant={hasDueToday ? "default" : "secondary"}>
            {summary?.due_today || 0}
          </Badge>
        </div>

        {/* Upcoming */}
        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 border-border">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <p className="font-medium text-sm">Upcoming</p>
          </div>
          <Badge variant="secondary">
            {summary?.upcoming || 0}
          </Badge>
        </div>

        {/* Missed List (if any) */}
        {hasMissed && missed && missed.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-destructive mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Missed Revisions
            </p>
            <div className="space-y-1">
              {missed.slice(0, 3).map((rev) => (
                <div 
                  key={rev.id} 
                  className="text-xs text-muted-foreground flex items-center justify-between"
                >
                  <span>{rev.topic_name}</span>
                  <span className="text-destructive/70">
                    Rev {rev.revision_number} • {new Date(rev.scheduled_date).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {missed.length > 3 && (
                <p className="text-xs text-destructive/70">
                  +{missed.length - 3} more missed
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
