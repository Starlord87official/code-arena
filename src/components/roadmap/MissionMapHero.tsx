import { Sparkles, ArrowRight, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopicWithProgress } from '@/hooks/useRoadmap';
import { TopicProblemStats } from '@/hooks/useTopicProblems';
import { cn } from '@/lib/utils';

interface MissionMapHeroProps {
  roadmapName: string;
  roadmapDescription: string | null;
  currentTopic: TopicWithProgress | null;
  currentTopicStats: TopicProblemStats | null;
  onResume: () => void;
}

export function MissionMapHero({
  roadmapName,
  roadmapDescription,
  currentTopic,
  currentTopicStats,
  onResume,
}: MissionMapHeroProps) {
  const xpReward = 40;
  const estimatedMins = 7;

  return (
    <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-10">
      {/* Left: Title & Subtitle */}
      <div className="flex-1 space-y-3">
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">
          {roadmapName}
        </h1>
        <p className="text-muted-foreground text-base max-w-xl leading-relaxed">
          {roadmapDescription || 'Master the fundamentals of DSA for coding interviews and competitive programming'}
        </p>
      </div>

      {/* Right: Continue Hero Card */}
      {currentTopic && (
        <div
          className={cn(
            "relative group w-full lg:w-[420px] flex-shrink-0",
            "rounded-2xl p-[1px] overflow-hidden",
            "bg-gradient-to-r from-primary/60 via-neon-cyan/40 to-primary/60",
            "animate-pulse-glow"
          )}
        >
          {/* Inner card */}
          <div className="relative rounded-2xl bg-card/95 backdrop-blur-xl p-5 flex items-center gap-5">
            {/* Sparkle icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-lg font-heading font-bold text-foreground truncate">
                Continue: {currentTopic.topic_name}
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 text-primary font-semibold">
                  <Zap className="h-3.5 w-3.5" />
                  +{xpReward} XP
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {estimatedMins} mins
                </span>
                {currentTopicStats && (
                  <span>
                    {currentTopicStats.solvedProblems}/{currentTopicStats.totalProblems} solved
                  </span>
                )}
              </div>
              {/* Progress bar */}
              {currentTopicStats && currentTopicStats.totalProblems > 0 && (
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-neon-cyan transition-all duration-500"
                    style={{
                      width: `${Math.max(5, (currentTopicStats.solvedProblems / currentTopicStats.totalProblems) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* CTA */}
            <Button
              onClick={onResume}
              size="lg"
              className="flex-shrink-0 font-heading font-bold tracking-wider shadow-neon hover:shadow-neon-strong"
            >
              Resume
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
