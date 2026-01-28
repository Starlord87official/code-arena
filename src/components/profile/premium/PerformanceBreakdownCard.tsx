import { cn } from '@/lib/utils';
import { Check, Clock, AlertTriangle, Flame, BarChart3, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PerformanceBreakdownProps {
  problemsSolved?: { easy: number; medium: number; hard: number; extreme: number };
  medianSolveTime?: string;
  accuracyRates?: { easy: number; medium: number; hard: number };
  dailyStreak?: { current: number; target: number };
  revisionStreak?: { current: number; target: number };
  peakConsistency?: number;
}

export function PerformanceBreakdownCard({
  problemsSolved = { easy: 145, medium: 317, hard: 62, extreme: 62 },
  medianSolveTime = '8 min',
  accuracyRates = { easy: 99, medium: 89, hard: 77 },
  dailyStreak = { current: 21, target: 40 },
  revisionStreak = { current: 17, target: 10 },
  peakConsistency = 35,
}: PerformanceBreakdownProps) {
  return (
    <div className="space-y-6">
      {/* Problems Solved */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Problems Solved</h4>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-status-success/10 text-status-success border-status-success/30">
            {problemsSolved.easy}
          </Badge>
          <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning/30">
            {problemsSolved.medium}
          </Badge>
          <span className="font-bold text-foreground">{problemsSolved.hard}</span>
          <span className="text-muted-foreground">{problemsSolved.extreme}</span>
        </div>
      </div>

      {/* Median Solve Time */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Median Solve Times</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">{medianSolveTime}</span>
          <div className="w-16 h-2 bg-status-success rounded-full" />
          <span className="text-xs text-status-success">99%</span>
        </div>
      </div>

      {/* Accuracy Rates */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Accuracy Rates</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{accuracyRates.easy}%</span>
            <div className="w-16 h-2 bg-status-success rounded-full" />
            <span className="text-xs text-status-success">{accuracyRates.medium}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Accuracy Rates</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{accuracyRates.hard}%</span>
            <div className="w-16 h-2 bg-destructive/50 rounded-full" />
            <span className="text-xs text-destructive">{accuracyRates.hard}%</span>
          </div>
        </div>
      </div>

      {/* Consistency Section */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Consistency</h4>
        
        <div className="space-y-3">
          {/* Daily Streak */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-status-warning" />
              <span className="text-sm text-muted-foreground">Daily Streak</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${(dailyStreak.current / dailyStreak.target) * 100}%` }}
                />
              </div>
              <span className="font-bold text-foreground">{dailyStreak.current}</span>
              <span className="text-muted-foreground">/{dailyStreak.target}D</span>
              <Badge className="bg-status-success/20 text-status-success border-0 text-xs">▼</Badge>
            </div>
          </div>

          {/* Revision Streak */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neon-purple" />
              <span className="text-sm text-muted-foreground">Revision Streak</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-neon-purple rounded-full" 
                  style={{ width: `${Math.min((revisionStreak.current / revisionStreak.target) * 100, 100)}%` }}
                />
              </div>
              <span className="font-bold text-foreground">{revisionStreak.current}</span>
              <span className="text-muted-foreground">/{revisionStreak.target}O</span>
              <Badge className="bg-status-success/20 text-status-success border-0 text-xs">▼</Badge>
            </div>
          </div>

          {/* Peak Consistency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Peak Consistency: 14-day block</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">{peakConsistency}</span>
              <span className="text-muted-foreground">days</span>
              <Badge className="bg-status-success/20 text-status-success border-0 text-xs">▼</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
