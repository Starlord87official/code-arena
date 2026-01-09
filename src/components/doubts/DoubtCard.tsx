import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Check, ChevronDown, ChevronUp, Code, User, Calendar, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Doubt, useMarkDoubtSolved, DoubtCategory, DoubtDifficulty } from '@/hooks/useDoubts';
import { useToast } from '@/hooks/use-toast';

const categoryColors: Record<DoubtCategory, string> = {
  study: 'bg-primary/20 text-primary border-primary/50',
  job: 'bg-status-success/20 text-status-success border-status-success/50',
  internship: 'bg-status-warning/20 text-status-warning border-status-warning/50',
  referral: 'bg-accent/20 text-accent border-accent/50',
};

const difficultyColors: Record<DoubtDifficulty, string> = {
  beginner: 'bg-status-success/20 text-status-success border-status-success/50',
  intermediate: 'bg-status-warning/20 text-status-warning border-status-warning/50',
  advanced: 'bg-destructive/20 text-destructive border-destructive/50',
};

interface DoubtCardProps {
  doubt: Doubt;
}

export function DoubtCard({ doubt }: DoubtCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { mutate: markSolved, isPending } = useMarkDoubtSolved();
  const { toast } = useToast();

  const handleMarkSolved = () => {
    markSolved(doubt.id, {
      onSuccess: () => {
        toast({
          title: 'Doubt cleared!',
          description: 'Your doubt has been marked as solved',
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to mark as solved',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className={`arena-card rounded-xl overflow-hidden ${doubt.is_own ? 'border-primary/30' : ''}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Tags Row */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge className={`${categoryColors[doubt.category]} border text-xs capitalize`}>
                {doubt.category}
              </Badge>
              <Badge className={`${difficultyColors[doubt.difficulty]} border text-xs capitalize`}>
                {doubt.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {doubt.topic_name}
              </Badge>
              {doubt.is_own && (
                <Badge className="bg-primary/20 text-primary border-primary/50 text-xs">
                  Your Doubt
                </Badge>
              )}
              {doubt.is_solved && (
                <Badge className="bg-status-success/20 text-status-success border-status-success/50 text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Solved
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-foreground text-lg mb-1">{doubt.title}</h3>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(parseISO(doubt.created_at), 'MMM d, yyyy')}
              </span>
              {doubt.is_solved && doubt.solved_at && (
                <span className="flex items-center gap-1 text-status-success">
                  <Check className="h-3 w-3" />
                  Solved {format(parseISO(doubt.solved_at), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>

          {/* Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Content Preview */}
        {!expanded && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {doubt.content}
          </p>
        )}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Full Content */}
          <div className="prose prose-sm prose-invert max-w-none">
            <p className="text-foreground whitespace-pre-wrap">{doubt.content}</p>
          </div>

          {/* Code Block */}
          {doubt.code_block && (
            <div className="bg-background rounded-lg border border-border overflow-hidden">
              <div className="px-3 py-2 bg-secondary/50 border-b border-border flex items-center gap-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Code</span>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm font-mono text-foreground">{doubt.code_block}</code>
              </pre>
            </div>
          )}

          {/* Mark as Solved Button (only for owner of unsolved doubts) */}
          {doubt.is_own && !doubt.is_solved && (
            <div className="pt-4 border-t border-border">
              <Button
                className="gap-2 bg-status-success hover:bg-status-success/80"
                onClick={handleMarkSolved}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Yes, my doubt is cleared
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
