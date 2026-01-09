import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Eye, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useWeaknessDetection, SeverityLevel, TopicWeakness } from '@/hooks/useWeaknessDetection';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

const severityConfig: Record<SeverityLevel, { 
  icon: React.ElementType; 
  label: string; 
  className: string;
  badgeClassName: string;
}> = {
  critical: {
    icon: AlertTriangle,
    label: 'Critical',
    className: 'text-destructive',
    badgeClassName: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  at_risk: {
    icon: AlertCircle,
    label: 'At Risk',
    className: 'text-yellow-600 dark:text-yellow-400',
    badgeClassName: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  },
  watch: {
    icon: Eye,
    label: 'Watch',
    className: 'text-blue-600 dark:text-blue-400',
    badgeClassName: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  },
};

function WeaknessItem({ weakness }: { weakness: TopicWeakness }) {
  const [isOpen, setIsOpen] = useState(false);
  const config = severityConfig[weakness.severity];
  const Icon = config.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer">
          <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.className)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate">{weakness.topicName}</span>
              <Badge variant="outline" className={cn("text-xs shrink-0", config.badgeClassName)}>
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {weakness.primaryReason}
            </p>
          </div>
          <ChevronRight className={cn(
            "h-4 w-4 text-muted-foreground transition-transform shrink-0",
            isOpen && "rotate-90"
          )} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-8 mt-2 p-3 rounded-lg bg-muted/30 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Issues Detected ({weakness.triggeredRules.length})
            </p>
            <div className="space-y-2">
              {weakness.triggeredRules.map((rule) => (
                <div key={rule.rule} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{rule.label}</p>
                    <p className="text-xs text-muted-foreground">{rule.guidance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AreasToImproveCard() {
  const { weaknesses, isLoading, hasWeaknesses, criticalCount, atRiskCount, watchCount } = useWeaknessDetection();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            Areas to Improve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            Areas to Improve
          </CardTitle>
          {hasWeaknesses && (
            <TooltipProvider>
              <div className="flex items-center gap-1.5">
                {criticalCount > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className={severityConfig.critical.badgeClassName}>
                        {criticalCount}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Critical issues</TooltipContent>
                  </Tooltip>
                )}
                {atRiskCount > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className={severityConfig.at_risk.badgeClassName}>
                        {atRiskCount}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>At risk topics</TooltipContent>
                  </Tooltip>
                )}
                {watchCount > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className={severityConfig.watch.badgeClassName}>
                        {watchCount}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Topics to watch</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
          )}
        </div>
        <CardDescription>
          Rule-based analysis of your learning patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasWeaknesses ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="font-medium text-green-700 dark:text-green-400">
              You're doing great!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              No weaknesses detected. Keep up the momentum!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {weaknesses.slice(0, 3).map((weakness) => (
                <WeaknessItem key={weakness.topicId} weakness={weakness} />
              ))}
            </div>
            {weaknesses.length > 3 && (
              <Link to="/roadmap/dsa">
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                  View all {weaknesses.length} areas
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
