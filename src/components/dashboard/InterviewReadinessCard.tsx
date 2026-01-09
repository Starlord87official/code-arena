import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useInterviewReadiness, getBandConfig, ScoreTrend, ScoreBreakdown } from '@/hooks/useInterviewReadiness';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const trendConfig: Record<ScoreTrend, { icon: React.ElementType; label: string; className: string }> = {
  up: { icon: TrendingUp, label: 'Improving', className: 'text-green-500' },
  down: { icon: TrendingDown, label: 'Declining', className: 'text-destructive' },
  stable: { icon: Minus, label: 'Stable', className: 'text-muted-foreground' },
};

function BreakdownItem({ item }: { item: ScoreBreakdown }) {
  const percentage = Math.round((item.score / 100) * 100);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{item.category}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{item.weight}% weight</span>
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs",
              percentage >= 80 && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
              percentage >= 50 && percentage < 80 && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
              percentage < 50 && "bg-destructive/10 text-destructive"
            )}
          >
            {percentage}%
          </Badge>
        </div>
      </div>
      <Progress value={percentage} className="h-1.5" />
      <ul className="text-xs text-muted-foreground space-y-0.5 ml-2">
        {item.reasons.map((reason, i) => (
          <li key={i} className="flex items-start gap-1">
            <span className="text-muted-foreground/50">•</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function InterviewReadinessCard() {
  const { score, band, label, trend, breakdown, isLoading } = useInterviewReadiness();
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const bandConfig = getBandConfig(band);
  const TrendIcon = trendConfig[trend].icon;

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Interview Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Gradient accent based on score */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 h-1",
          band === 'strong_candidate' && "bg-gradient-to-r from-primary via-accent to-primary",
          band === 'interview_ready' && "bg-gradient-to-r from-green-500 to-emerald-500",
          band === 'partially_ready' && "bg-gradient-to-r from-yellow-500 to-orange-500",
          band === 'weak_foundation' && "bg-gradient-to-r from-orange-500 to-red-500",
          band === 'not_ready' && "bg-destructive"
        )}
      />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Interview Readiness
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <TrendIcon className={cn("h-4 w-4", trendConfig[trend].className)} />
            <span className={cn("text-xs", trendConfig[trend].className)}>
              {trendConfig[trend].label}
            </span>
          </div>
        </div>
        <CardDescription>
          Your preparation score based on learning patterns
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className={cn("font-display text-5xl font-bold", bandConfig.color)}>
              {score}
            </span>
            <span className="text-muted-foreground text-lg">/100</span>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-sm px-3 py-1",
              band === 'strong_candidate' && "bg-primary/10 text-primary border-primary/30",
              band === 'interview_ready' && "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400",
              band === 'partially_ready' && "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
              band === 'weak_foundation' && "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
              band === 'not_ready' && "bg-destructive/10 text-destructive border-destructive/30"
            )}
          >
            {band === 'strong_candidate' && <Sparkles className="h-3 w-3 mr-1" />}
            {label}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <Progress value={score} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Not Ready</span>
            <span>Strong Candidate</span>
          </div>
        </div>

        {/* Breakdown Toggle */}
        <Collapsible open={showBreakdown} onOpenChange={setShowBreakdown}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
              {showBreakdown ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide Breakdown
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  View Score Breakdown
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-4 space-y-4 border-t mt-2">
              {breakdown.map((item) => (
                <BreakdownItem key={item.category} item={item} />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// Compact version for profiles
export function InterviewReadinessScore({ score, band }: { score: number; band: string }) {
  const bandConfig = getBandConfig(band as any);
  
  return (
    <div className="flex items-center gap-2">
      <span className={cn("font-display text-2xl font-bold", bandConfig.color)}>
        {score}
      </span>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Readiness</span>
        <span className={cn("text-xs font-medium", bandConfig.color)}>{bandConfig.label}</span>
      </div>
    </div>
  );
}
