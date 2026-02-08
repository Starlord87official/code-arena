import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useRoadmapWithProgress, useUserActiveRoadmaps } from '@/hooks/useRoadmap';
import { useTopicProblems } from '@/hooks/useTopicProblems';
import { useTargets } from '@/hooks/useTargets';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MissionMapHero } from '@/components/roadmap/MissionMapHero';
import { SkillTreeTimeline } from '@/components/roadmap/SkillTreeTimeline';
import { TodaysPlanCard } from '@/components/roadmap/TodaysPlanCard';

export default function Roadmap() {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, error } = useRoadmapWithProgress(roadmapId);
  const { data: activeRoadmaps, isLoading: activeLoading } = useUserActiveRoadmaps();

  // Use topic stats from the data - must call unconditionally
  const { topicStats } = useTopicProblems(data?.topics ?? []);

  const isStarted = activeRoadmaps?.some(r => r.roadmap_id === roadmapId);

  if (authLoading || isLoading || activeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isStarted) {
    return <Navigate to="/dashboard" replace />;
  }

  if (error || !data) {
    return (
      <div className="container max-w-5xl py-8">
        <div className="rounded-xl border border-border/40 bg-card/50 p-8 text-center">
          <p className="text-muted-foreground">Roadmap not found</p>
        </div>
      </div>
    );
  }

  const { targets, progress, streak } = useTargets();

  const currentTopic = data.topics.find(t => t.isCurrentTopic);
  const currentTopicStats = currentTopic ? topicStats[currentTopic.id] || null : null;

  const problemsTarget = targets?.daily || 2;
  const problemsSolved = Math.min(progress.today, problemsTarget);

  const handleTopicClick = (topicId: string) => {
    // Navigate to topic detail or challenges filtered by topic
    // For now, just scroll or show toast
    navigate(`/challenges?topic=${topicId}`);
  };

  const handleResume = () => {
    if (currentTopic) {
      handleTopicClick(currentTopic.id);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Subtle space background overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse 1200px 600px at 60% 0%, hsl(var(--primary) / 0.06), transparent 70%)',
        }}
      />

      <div className="relative container max-w-6xl py-8 px-4 md:px-6">
        {/* Hero Section */}
        <MissionMapHero
          roadmapName={data.roadmap.name}
          roadmapDescription={data.roadmap.description}
          currentTopic={currentTopic || null}
          currentTopicStats={currentTopicStats}
          onResume={handleResume}
        />

        {/* Main Layout: Skill Tree (left) + Sidebar (right) */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Skill Tree - 70% */}
          <div className="flex-1 min-w-0">
            <div
              className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-6 md:p-8"
              style={{
                boxShadow: '0 16px 50px hsl(var(--background) / 0.5)',
              }}
            >
              <SkillTreeTimeline
                topics={data.topics}
                topicStats={topicStats}
                onTopicClick={handleTopicClick}
              />
            </div>

            {/* Practice note */}
            <p className="text-xs text-muted-foreground text-center mt-4 opacity-70">
              💡 You can practice any challenge freely, but roadmap progress only counts for your active topic.
            </p>
          </div>

          {/* Right Sidebar - 30% */}
          <div className="w-full lg:w-[320px] flex-shrink-0 space-y-6">
            <TodaysPlanCard
              problemsSolved={problemsSolved}
              problemsTarget={problemsTarget}
              conceptsRead={0}
              conceptsTarget={1}
              streak={streak}
            />

            {/* Overall mastery card */}
            <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-5 space-y-3">
              <h3 className="text-sm font-heading font-bold text-muted-foreground uppercase tracking-wider">
                Overall Mastery
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-foreground">
                  {data.progressPercentage}%
                </span>
                <span className="text-sm text-muted-foreground">
                  {data.completedCount}/{data.totalCount} topics
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-neon-cyan transition-all duration-700"
                  style={{ width: `${Math.max(2, data.progressPercentage)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
