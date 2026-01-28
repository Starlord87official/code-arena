import { Target, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScoreBand, ScoreTrend, ScoreBreakdown, getBandConfig } from '@/hooks/useInterviewReadiness';

interface Props {
  score: number;
  band: ScoreBand;
  label: string;
  trend: ScoreTrend;
  breakdown: ScoreBreakdown[];
  isLoading?: boolean;
  className?: string;
}

export function InterviewReadinessCard({
  score,
  band,
  label,
  trend,
  breakdown,
  isLoading,
  className,
}: Props) {
  const bandConfig = getBandConfig(band);
  
  // Calculate stroke dasharray for circular progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-status-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  if (isLoading) {
    return (
      <div className={cn("arena-card p-6", className)}>
        <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Interview Readiness
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("arena-card p-6", className)}>
      <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        Interview Readiness
      </h2>

      <div className="flex items-start gap-6">
        {/* Circular Progress */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" className="-rotate-90">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
              style={{
                filter: score >= 70 ? 'drop-shadow(0 0 6px hsl(var(--primary)))' : undefined,
              }}
            />
          </svg>
          {/* Score in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("font-display text-3xl font-bold", bandConfig.color)}>
              {score}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Right side info */}
        <div className="flex-1 space-y-3">
          {/* Status badge and trend */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                band === 'strong_candidate' && "bg-primary/10 text-primary border-primary/30",
                band === 'interview_ready' && "bg-status-success/10 text-status-success border-status-success/30",
                band === 'partially_ready' && "bg-status-warning/10 text-status-warning border-status-warning/30",
                band === 'weak_foundation' && "bg-destructive/10 text-destructive/80 border-destructive/30",
                band === 'not_ready' && "bg-muted text-muted-foreground border-border"
              )}
            >
              {label}
            </Badge>
            <TrendIcon className={cn("h-4 w-4", trendColor)} />
          </div>

          {/* Breakdown items */}
          <div className="space-y-2">
            {breakdown.slice(0, 4).map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.category}</span>
                  <span className="font-medium text-foreground">{Math.round(item.score)}%</span>
                </div>
                <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      item.score >= 80 ? "bg-status-success" :
                      item.score >= 60 ? "bg-primary" :
                      item.score >= 40 ? "bg-status-warning" :
                      "bg-destructive/70"
                    )}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
