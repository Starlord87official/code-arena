import { BookOpen, RotateCcw, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TopicProblemStats } from '@/hooks/useTopicProblems';

interface TopicProgressIndicatorProps {
  stats: TopicProblemStats;
  compact?: boolean;
}

export function TopicProgressIndicator({ stats, compact = false }: TopicProgressIndicatorProps) {
  const { totalProblems, solvedProblems, revisionCount, needsMorePractice } = stats;
  
  if (totalProblems === 0) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          {solvedProblems}/{totalProblems}
        </span>
        {revisionCount > 0 && (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <RotateCcw className="h-3 w-3" />
            {revisionCount}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 mt-1">
      {/* Problem Progress */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" />
        <span>
          {solvedProblems} / {totalProblems} problems solved
        </span>
      </div>

      {/* Revision Count (if any) */}
      {revisionCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <RotateCcw className="h-3.5 w-3.5" />
          <span>
            {revisionCount} problem{revisionCount !== 1 ? 's' : ''} marked for revision
          </span>
        </div>
      )}

      {/* Soft Practice Hint (non-blocking) */}
      {needsMorePractice && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 italic">
          <Lightbulb className="h-3.5 w-3.5" />
          <span>May need more practice</span>
        </div>
      )}
    </div>
  );
}
