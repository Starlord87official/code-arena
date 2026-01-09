import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Check, ChevronRight, Clock, AlertTriangle, Loader2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRevisionQueue, useCompleteRevisionItem, RevisionQueueItem } from '@/hooks/useRevisionQueue';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { getCompaniesForChallenge } from '@/lib/companyData';

function getStatusStyle(status: RevisionQueueItem['status']) {
  switch (status) {
    case 'overdue':
      return {
        badge: 'bg-destructive/20 text-destructive border-destructive/50',
        icon: AlertTriangle,
        label: 'Overdue',
      };
    case 'due':
      return {
        badge: 'bg-status-warning/20 text-status-warning border-status-warning/50',
        icon: Clock,
        label: 'Due Today',
      };
    case 'upcoming':
    default:
      return {
        badge: 'bg-primary/20 text-primary border-primary/50',
        icon: Calendar,
        label: 'Upcoming',
      };
  }
}

export function RevisionQueueCard() {
  const { data: items = [], isLoading } = useRevisionQueue();
  const { mutate: completeItem, isPending: isCompleting } = useCompleteRevisionItem();
  const { toast } = useToast();

  const handleComplete = (id: string, title: string) => {
    completeItem(id, {
      onSuccess: () => {
        toast({
          title: 'Revision Completed',
          description: `"${title}" marked as revised`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to complete',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  // Group items by status priority
  const overdueItems = items.filter(i => i.status === 'overdue');
  const dueItems = items.filter(i => i.status === 'due');
  const upcomingItems = items.filter(i => i.status === 'upcoming');
  const totalActive = items.length;

  return (
    <div className="arena-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border bg-gradient-to-r from-accent/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" />
            <h3 className="font-display font-bold">Revision Queue</h3>
          </div>
          {totalActive > 0 && (
            <Badge variant="outline" className="text-xs">
              {totalActive} active
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : totalActive === 0 ? (
          <div className="text-center py-6">
            <BookOpen className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No revisions scheduled</p>
            <p className="text-xs text-muted-foreground mt-1">
              Mark problems for revision from challenges
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overdue & Due summary */}
            {(overdueItems.length > 0 || dueItems.length > 0) && (
              <div className="flex gap-3 text-sm">
                {overdueItems.length > 0 && (
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="font-semibold">{overdueItems.length} overdue</span>
                  </div>
                )}
                {dueItems.length > 0 && (
                  <div className="flex items-center gap-1 text-status-warning">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-semibold">{dueItems.length} due today</span>
                  </div>
                )}
              </div>
            )}

            {/* Items list (show first 5) */}
            <div className="space-y-2">
              {[...overdueItems, ...dueItems, ...upcomingItems].slice(0, 5).map((item) => {
                const style = getStatusStyle(item.status);
                const StatusIcon = style.icon;
                const companies = getCompaniesForChallenge(item.problem_id);

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      item.status === 'overdue'
                        ? 'bg-destructive/5 border-destructive/20'
                        : item.status === 'due'
                        ? 'bg-status-warning/5 border-status-warning/20'
                        : 'bg-secondary/50 border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon className={`h-3.5 w-3.5 flex-shrink-0 ${
                            item.status === 'overdue' ? 'text-destructive' :
                            item.status === 'due' ? 'text-status-warning' : 'text-primary'
                          }`} />
                          <span className="font-medium text-sm truncate">
                            {item.problem_title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          {item.topic && (
                            <>
                              <span className="truncate">{item.topic}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{format(parseISO(item.scheduled_date), 'MMM d')}</span>
                          {companies.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Building2 className="h-2.5 w-2.5" />
                                {companies[0].name}
                                {companies.length > 1 && ` +${companies.length - 1}`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link to={`/solve/${item.problem_id}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            Revise
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleComplete(item.id, item.problem_title)}
                          disabled={isCompleting}
                        >
                          <Check className="h-3.5 w-3.5 text-status-success" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalActive > 5 && (
              <div className="text-center">
                <span className="text-xs text-muted-foreground">
                  +{totalActive - 5} more items
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
