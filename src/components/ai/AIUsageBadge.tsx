import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { useAIUsage } from '@/hooks/useAIInsights';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AIUsageBadgeProps {
  className?: string;
  showLabel?: boolean;
}

export function AIUsageBadge({ className, showLabel = true }: AIUsageBadgeProps) {
  const { data: usage, isLoading } = useAIUsage();

  if (isLoading || !usage) return null;

  const isLow = usage.remaining <= 3;
  const isExhausted = usage.remaining === 0;

  if (!usage.ai_enabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn("gap-1 bg-muted text-muted-foreground", className)}
            >
              <AlertTriangle className="h-3 w-3" />
              AI Offline
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>AI insights are temporarily disabled</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1",
              isExhausted && "bg-destructive/10 text-destructive border-destructive/30",
              isLow && !isExhausted && "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700",
              !isLow && "bg-primary/10 text-primary border-primary/30",
              className
            )}
          >
            <Sparkles className="h-3 w-3" />
            {showLabel && (
              <span>{usage.remaining}/{usage.limit}</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isExhausted 
              ? "Daily AI limit reached. Resets at midnight."
              : `${usage.remaining} AI insights remaining today`
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
