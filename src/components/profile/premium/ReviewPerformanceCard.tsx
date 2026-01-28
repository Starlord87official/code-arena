import { Badge } from '@/components/ui/badge';
import { Check, Clock, Flame } from 'lucide-react';

interface ReviewPerformanceCardProps {
  dueFinished?: { current: number; total: number };
  oldestFinished?: string;
  reteminBatt?: string;
  revisionStreak?: number;
  revisionDucs?: number;
}

export function ReviewPerformanceCard({
  dueFinished = { current: 71, total: 82 },
  oldestFinished = '10 VRED',
  reteminBatt = '7/1Ateh',
  revisionStreak = 17,
  revisionDucs = 92,
}: ReviewPerformanceCardProps) {
  return (
    <div className="arena-card p-4">
      <h4 className="font-display font-bold text-sm text-foreground mb-4">Review Performance</h4>

      <div className="space-y-3">
        {/* Due Finished */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-status-success" />
            <span className="text-sm text-muted-foreground">Due Finished</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-foreground">{dueFinished.current}</span>
            <span className="text-muted-foreground">/{dueFinished.total}</span>
          </div>
        </div>

        {/* Oldest Finished */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Oldest Finished</span>
          </div>
          <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">
            RUVISC0 {oldestFinished}
          </Badge>
        </div>

        {/* Retemin sact batt */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Retemin sact batt:</span>
          </div>
          <span className="text-sm text-foreground">{reteminBatt}</span>
        </div>

        {/* Revision Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-status-success" />
            <span className="text-sm text-muted-foreground">Revision Streak</span>
          </div>
          <span className="text-sm text-foreground">{revisionStreak} Days</span>
        </div>

        {/* Revion Ducs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">⊟</span>
            <span className="text-sm text-muted-foreground">Revion</span>
            <span className="text-primary">••</span>
            <span className="text-sm text-muted-foreground">Ducs:</span>
          </div>
          <span className="text-sm text-foreground">{revisionDucs} %</span>
        </div>
      </div>
    </div>
  );
}
