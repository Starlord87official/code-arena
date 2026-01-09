import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, PlayCircle, Lock, Sparkles } from 'lucide-react';
import { TopicWithProgress, TopicLockStatus, useUpdateTopicState } from '@/hooks/useRoadmap';
import { TopicRevisionStatus } from '@/components/revision/TopicRevisionStatus';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RoadmapProgressProps {
  topics: TopicWithProgress[];
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
}

const lockStatusConfig: Record<TopicLockStatus, { icon: React.ElementType; label: string; className: string; bgClassName: string }> = {
  locked: {
    icon: Lock,
    label: 'Locked',
    className: 'text-muted-foreground',
    bgClassName: 'bg-muted/50 border-border opacity-60',
  },
  available: {
    icon: Sparkles,
    label: 'Start Topic',
    className: 'text-primary',
    bgClassName: 'bg-primary/5 border-primary/30 ring-2 ring-primary/20',
  },
  in_progress: {
    icon: PlayCircle,
    label: 'In Progress',
    className: 'text-yellow-600 dark:text-yellow-400',
    bgClassName: 'bg-yellow-50/50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    className: 'text-green-600 dark:text-green-400',
    bgClassName: 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800',
  },
};

export function RoadmapProgress({ topics, completedCount, totalCount, progressPercentage }: RoadmapProgressProps) {
  const updateTopicState = useUpdateTopicState();
  
  const currentTopic = topics.find(t => t.isCurrentTopic);

  const handleStartTopic = async (topicId: string) => {
    try {
      await updateTopicState.mutateAsync({ topicId, state: 'in_progress' });
      toast.success('Topic started! Good luck on your learning journey.');
    } catch (error) {
      toast.error('Failed to start topic');
    }
  };

  const handleCompleteTopic = async (topicId: string) => {
    try {
      await updateTopicState.mutateAsync({ topicId, state: 'completed' });
      toast.success('🎉 Topic completed! The next topic is now unlocked.');
    } catch (error) {
      toast.error('Failed to complete topic');
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Current Topic Highlight */}
        {currentTopic && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {currentTopic.lockStatus === 'in_progress' ? 'Currently Learning' : 'Up Next'}
                </p>
                <p className="font-display font-bold text-lg">{currentTopic.topic_name}</p>
              </div>
              {currentTopic.lockStatus === 'available' ? (
                <Button 
                  onClick={() => handleStartTopic(currentTopic.id)}
                  disabled={updateTopicState.isPending}
                  size="sm"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Start Topic
                </Button>
              ) : currentTopic.lockStatus === 'in_progress' ? (
                <Button 
                  onClick={() => handleCompleteTopic(currentTopic.id)}
                  disabled={updateTopicState.isPending}
                  variant="outline"
                  size="sm"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Mastery</span>
            <span className="text-muted-foreground">
              {completedCount} / {totalCount} topics ({progressPercentage}%)
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Topic List */}
        <div className="space-y-2">
          {topics.map((topic, index) => {
            const config = lockStatusConfig[topic.lockStatus];
            const Icon = config.icon;
            const isLocked = topic.lockStatus === 'locked';

            return (
              <Tooltip key={topic.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all",
                      config.bgClassName,
                      isLocked && "cursor-not-allowed",
                      topic.isCurrentTopic && "shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-sm font-mono w-6",
                        isLocked ? "text-muted-foreground/50" : "text-muted-foreground"
                      )}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <Icon className={cn("h-5 w-5", config.className)} />
                      <div>
                        <span className={cn(
                          "font-medium",
                          isLocked && "text-muted-foreground"
                        )}>
                          {topic.topic_name}
                        </span>
                        {/* Show revision status for completed topics */}
                        {topic.lockStatus === 'completed' && (
                          <div className="mt-1">
                            <TopicRevisionStatus topicId={topic.id} compact />
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs",
                        topic.lockStatus === 'completed' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                        topic.lockStatus === 'in_progress' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                        topic.lockStatus === 'available' && "bg-primary/10 text-primary",
                        topic.lockStatus === 'locked' && "bg-muted text-muted-foreground"
                      )}
                    >
                      {config.label}
                    </Badge>
                  </div>
                </TooltipTrigger>
                {isLocked && (
                  <TooltipContent>
                    <p>Complete previous topics to unlock this one</p>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>

        {/* Practice Freely Note */}
        <p className="text-xs text-muted-foreground text-center">
          💡 You can practice any challenge freely, but roadmap progress only counts for your active topic.
        </p>
      </div>
    </TooltipProvider>
  );
}
