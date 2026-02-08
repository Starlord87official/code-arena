import { Link } from 'react-router-dom';
import { useOAHistory } from '@/hooks/useOAHistory';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ClipboardCheck, Clock, Trophy, FileBarChart } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'In Progress', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  submitted: { label: 'Submitted', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  abandoned: { label: 'Abandoned', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

export default function OAHistory() {
  const { data: attempts, isLoading } = useOAHistory();

  return (
    <div className="container mx-auto px-4 max-w-4xl py-6 space-y-6">
      <Link to="/oa" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to OA Arena
      </Link>

      <div className="flex items-center gap-3">
        <FileBarChart className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">OA History</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : attempts && attempts.length > 0 ? (
        <div className="space-y-3">
          {attempts.map((attempt: any) => {
            const status = statusConfig[attempt.status] || statusConfig.active;
            const scorePercent = attempt.max_score > 0
              ? Math.round((attempt.score / attempt.max_score) * 100)
              : 0;
            const assessmentTitle = attempt.oa_assessments?.title || 'Unknown Assessment';
            const packTitle = attempt.oa_assessments?.oa_packs?.title || '';

            return (
              <Card key={attempt.id} className="arena-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading text-base font-semibold text-foreground">
                          {assessmentTitle}
                        </h3>
                        <Badge variant="outline" className={status.className + " text-[10px]"}>
                          {status.label}
                        </Badge>
                      </div>
                      {packTitle && (
                        <p className="text-xs text-muted-foreground mb-2">{packTitle}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(attempt.started_at), 'MMM d, yyyy · h:mm a')}
                        </span>
                        {attempt.status === 'submitted' && (
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3.5 w-3.5 text-primary" />
                            {attempt.score}/{attempt.max_score} ({scorePercent}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {attempt.status === 'active' && (
                        <Link to={`/oa/attempt/${attempt.id}`}>
                          <Button variant="arena" size="sm">Resume</Button>
                        </Link>
                      )}
                      {attempt.status === 'submitted' && (
                        <Link to={`/oa/report/${attempt.id}`}>
                          <Button variant="outline" size="sm">View Report</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <ClipboardCheck className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">No OA attempts yet</p>
          <p className="text-xs text-muted-foreground mb-4">Start your first mock OA to begin tracking your performance</p>
          <Link to="/oa/packs">
            <Button variant="arena">Browse Packs</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
