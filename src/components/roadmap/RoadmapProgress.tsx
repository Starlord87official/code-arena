import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import { TopicWithProgress, TopicState } from '@/hooks/useRoadmap';
import { TopicRevisionStatus } from '@/components/revision/TopicRevisionStatus';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RoadmapProgressProps {
  topics: TopicWithProgress[];
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
}

const stateConfig: Record<TopicState, { icon: React.ElementType; label: string; className: string }> = {
  not_started: {
    icon: Circle,
    label: 'Not Started',
    className: 'text-muted-foreground bg-muted',
  },
  in_progress: {
    icon: PlayCircle,
    label: 'In Progress',
    className: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    className: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  },
};

export function RoadmapProgress({ topics, completedCount, totalCount, progressPercentage }: RoadmapProgressProps) {
  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Overall Progress</span>
          <span className="text-muted-foreground">
            {completedCount} / {totalCount} topics ({progressPercentage}%)
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Topic List */}
      <div className="space-y-2">
        {topics.map((topic, index) => {
          const config = stateConfig[topic.state];
          const Icon = config.icon;

          return (
            <div
              key={topic.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-colors",
                topic.state === 'completed' && "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800",
                topic.state === 'in_progress' && "bg-yellow-50/50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800",
                topic.state === 'not_started' && "bg-card border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm font-mono w-6">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <Icon className={cn("h-5 w-5", config.className.split(' ')[0])} />
                <div>
                  <span className="font-medium">{topic.topic_name}</span>
                  {/* Show revision status for completed topics */}
                  {topic.state === 'completed' && (
                    <div className="mt-1">
                      <TopicRevisionStatus topicId={topic.id} compact />
                    </div>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className={cn("text-xs", config.className)}>
                {config.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
