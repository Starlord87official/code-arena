import { useMemo } from 'react';
import { CheckCircle2, Lock, Sparkles, PlayCircle, ChevronRight, Zap, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TopicWithProgress, TopicLockStatus, useUpdateTopicState } from '@/hooks/useRoadmap';
import { TopicProblemStats } from '@/hooks/useTopicProblems';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SkillTreeTimelineProps {
  topics: TopicWithProgress[];
  topicStats: Record<string, TopicProblemStats>;
  onTopicClick: (topicId: string) => void;
}

// XP and time estimates per topic (could come from DB later)
const TOPIC_META: Record<string, { xp: number; mins: number }> = {
  'Arrays': { xp: 70, mins: 20 },
  'Strings': { xp: 40, mins: 7 },
  'Linked List': { xp: 90, mins: 15 },
  'Stack & Queue': { xp: 90, mins: 15 },
  'Recursion': { xp: 90, mins: 15 },
  'Trees': { xp: 100, mins: 15 },
  'Binary Search': { xp: 80, mins: 12 },
  'Hashing': { xp: 70, mins: 10 },
  'Heaps': { xp: 85, mins: 14 },
  'Graphs': { xp: 120, mins: 25 },
  'Greedy': { xp: 80, mins: 12 },
  'Dynamic Programming': { xp: 150, mins: 30 },
  'Advanced Topics': { xp: 120, mins: 20 },
};

function getTopicMeta(name: string) {
  return TOPIC_META[name] || { xp: 90, mins: 15 };
}

export function SkillTreeTimeline({ topics, topicStats, onTopicClick }: SkillTreeTimelineProps) {
  const updateTopicState = useUpdateTopicState();

  const handleStartTopic = async (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateTopicState.mutateAsync({ topicId, state: 'in_progress' });
      toast.success('Topic started! Good luck on your learning journey.');
    } catch {
      toast.error('Failed to start topic');
    }
  };

  const handleCompleteTopic = async (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateTopicState.mutateAsync({ topicId, state: 'completed' });
      toast.success('🎉 Topic completed! The next topic is now unlocked.');
    } catch {
      toast.error('Failed to complete topic');
    }
  };

  // Find previous topic name for lock requirement text
  const getPreviousTopicName = (index: number) => {
    if (index <= 0) return null;
    return topics[index - 1]?.topic_name;
  };

  return (
    <TooltipProvider>
      <div className="relative">
        {/* Vertical Glowing Line */}
        <div
          className="absolute left-[28px] top-0 bottom-0 w-[2px]"
          style={{
            background: 'linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--neon-cyan)) 40%, hsl(var(--primary) / 0.3) 100%)',
            boxShadow: '0 0 12px hsl(var(--primary) / 0.4), 0 0 24px hsl(var(--primary) / 0.2)',
          }}
        />

        <div className="space-y-2">
          {topics.map((topic, index) => {
            const lockStatus = topic.lockStatus || 'locked';
            const isLocked = lockStatus === 'locked';
            const isCurrent = topic.isCurrentTopic;
            const isCompleted = lockStatus === 'completed';
            const isInProgress = lockStatus === 'in_progress';
            const stats = topicStats[topic.id];
            const meta = getTopicMeta(topic.topic_name);
            const prevName = getPreviousTopicName(index);

            return (
              <div key={topic.id} className="relative flex items-start gap-5 group">
                {/* Node */}
                <div className="relative z-10 flex-shrink-0 mt-5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                          isCompleted && "border-status-success/60 bg-status-success/10 shadow-[0_0_16px_hsl(var(--success)/0.4)]",
                          isCurrent && !isInProgress && "border-primary/80 bg-primary/15 shadow-[0_0_20px_hsl(var(--primary)/0.5)] animate-pulse-glow",
                          isInProgress && "border-primary/80 bg-primary/15 shadow-[0_0_20px_hsl(var(--primary)/0.5)] animate-pulse-glow",
                          isLocked && "border-border/40 bg-muted/20",
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-status-success" />
                        ) : isCurrent || isInProgress ? (
                          <Sparkles className="h-6 w-6 text-primary" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground/50" />
                        )}
                      </div>
                    </TooltipTrigger>
                    {isLocked && (
                      <TooltipContent side="right">
                        <p>Complete the previous topic to unlock this.</p>
                        <p className="text-xs text-muted-foreground mt-1">Master one topic at a time for stronger foundations.</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>

                {/* Topic Card */}
                <div
                  className={cn(
                    "flex-1 rounded-xl border p-4 transition-all duration-300 cursor-pointer",
                    // Completed
                    isCompleted && "border-status-success/20 bg-card/60 hover:bg-card/80 hover:border-status-success/40 hover:-translate-y-0.5",
                    // Current / In Progress - highlighted
                    (isCurrent || isInProgress) && [
                      "border-primary/40 bg-card/80",
                      "shadow-[0_0_30px_hsl(var(--primary)/0.12)]",
                      "hover:-translate-y-1 hover:shadow-[0_0_40px_hsl(var(--primary)/0.2)]",
                    ],
                    // Locked
                    isLocked && "border-border/20 bg-card/30 opacity-50 cursor-not-allowed",
                  )}
                  onClick={() => !isLocked && onTopicClick(topic.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Topic Name */}
                      <div className="flex items-center gap-3">
                        <h3
                          className={cn(
                            "text-lg font-heading font-bold",
                            isLocked && "text-muted-foreground",
                            isCurrent && "text-foreground",
                          )}
                        >
                          {topic.topic_name}
                        </h3>
                        {isCompleted && (
                          <Badge className="bg-status-success/15 text-status-success border-status-success/30 text-xs">
                            Completed
                          </Badge>
                        )}
                        {isLocked && (
                          <Badge variant="secondary" className="text-xs opacity-70">
                            locked
                          </Badge>
                        )}
                      </div>

                      {/* Meta: XP + Time + Progress */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 text-primary/80 font-medium">
                          <Zap className="h-3.5 w-3.5" />
                          +{meta.xp} XP
                        </span>
                        {stats && stats.totalProblems > 0 && (
                          <span>
                            {stats.solvedProblems}/{stats.totalProblems} solved
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {meta.mins} mins
                        </span>
                      </div>

                      {/* Progress bar for current topic */}
                      {(isCurrent || isInProgress) && stats && stats.totalProblems > 0 && (
                        <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden max-w-[200px]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-neon-cyan transition-all duration-700"
                            style={{
                              width: `${Math.max(5, (stats.solvedProblems / stats.totalProblems) * 100)}%`,
                            }}
                          />
                        </div>
                      )}

                      {/* Lock requirement chip */}
                      {isLocked && prevName && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground/70">
                          <Info className="h-3.5 w-3.5" />
                          <span>
                            Complete <strong>{prevName}</strong> (70%) to unlock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <div className="flex-shrink-0 mt-1">
                      {(isCurrent && !isInProgress) && (
                        <Button
                          size="sm"
                          onClick={(e) => handleStartTopic(topic.id, e)}
                          disabled={updateTopicState.isPending}
                          className="font-heading font-semibold"
                        >
                          Start Topic
                        </Button>
                      )}
                      {isInProgress && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTopicClick(topic.id);
                          }}
                          className="font-heading font-semibold"
                        >
                          Continue
                          <ChevronRight className="h-4 w-4 ml-0.5" />
                        </Button>
                      )}
                      {isCompleted && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTopicClick(topic.id);
                          }}
                          className="text-muted-foreground"
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
