import { Badge } from '@/components/ui/badge';
import { Check, Clock, AlertTriangle, Eye } from 'lucide-react';

interface RevisionDisciplineCardProps {
  revisionTargets?: { easy: boolean; medium: string; hard: string };
  scheduled?: number;
  dueToday?: number;
  dueTomorrow?: number;
  dueThisWeek?: number;
  pendingRevisions?: { dueDays: number; days31_60: number; over60: number };
  questionDebt?: number;
  revisionStreak?: number;
  preferredTime?: string;
}

export function RevisionDisciplineCard({
  revisionTargets = { easy: true, medium: 'On Time', hard: 'Accelerated' },
  scheduled = 1,
  dueToday = 1,
  dueTomorrow = 3,
  dueThisWeek = 7,
  pendingRevisions = { dueDays: 6, days31_60: 5, over60: 4 },
  questionDebt = 15,
  revisionStreak = 17,
  preferredTime = '9 PM – 11 PM (IST)',
}: RevisionDisciplineCardProps) {
  return (
    <div className="arena-card p-4">
      <h3 className="font-display font-bold text-lg text-foreground mb-4">Revision & Discipline</h3>

      {/* Revision Targets */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Revision Targets</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-status-success/20 text-status-success border-status-success/30">
            Easy <Check className="h-3 w-3 ml-1" />
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            Slow <Check className="h-3 w-3 ml-1" />
          </Badge>
          <Badge className="bg-status-success/20 text-status-success border-status-success/30">
            On Time <Check className="h-3 w-3 ml-1" />
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="text-muted-foreground">
            Medium
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            On Time
          </Badge>
          <Badge className="bg-status-success/20 text-status-success border-status-success/30">
            Accelerated <Check className="h-3 w-3 ml-1" />
          </Badge>
        </div>
      </div>

      {/* Scheduled */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-status-success" />
            <span className="text-sm text-muted-foreground">Scheduled</span>
          </div>
          <span className="font-bold text-foreground">{scheduled}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground pl-6">Due Today</span>
          <span className="text-foreground">{dueToday}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground pl-6">Due Tomorrow</span>
          <span className="text-foreground">{dueTomorrow}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground pl-6">Due This Week</span>
          <span className="text-foreground">{dueThisWeek}</span>
        </div>
      </div>

      {/* Pending Revisions */}
      <div className="border-t border-border pt-4 mb-6">
        <h4 className="font-display font-bold text-sm text-foreground mb-3">Pending Revisions</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Due Days</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-primary rounded-full" />
              <span className="font-bold text-foreground">{pendingRevisions.dueDays}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">31-60 days</span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-2 bg-status-warning rounded-full" />
              <span className="font-bold text-foreground">{pendingRevisions.days31_60}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Over 60 days</span>
            <div className="flex items-center gap-2">
              <div className="w-10 h-2 bg-destructive/50 rounded-full" />
              <span className="font-bold text-foreground">{pendingRevisions.over60}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Question Debt */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-muted-foreground">Question Debt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-2 bg-destructive rounded-full" />
          <span className="font-bold text-foreground">{questionDebt}</span>
        </div>
      </div>

      {/* Revision Streak */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-status-success" />
          <span className="text-sm text-muted-foreground">Revision Streak</span>
        </div>
        <Badge className="bg-status-success/20 text-status-success border-status-success/30">
          {revisionStreak} Days
        </Badge>
      </div>

      {/* Preferred Time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Preferred Revision Time</span>
        </div>
        <span className="text-sm text-foreground">{preferredTime}</span>
      </div>
    </div>
  );
}
