import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, X, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIInsightDisplayProps {
  insight: string | null;
  isLoading: boolean;
  error?: string | null;
  onClose: () => void;
  title?: string;
  className?: string;
}

export function AIInsightDisplay({
  insight,
  isLoading,
  error,
  onClose,
  title = 'AI Insight',
  className,
}: AIInsightDisplayProps) {
  if (!insight && !isLoading && !error) return null;

  return (
    <Card className={cn(
      "border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5",
      className
    )}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Analyzing...</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-start gap-2 text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {insight && !isLoading && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {insight}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
