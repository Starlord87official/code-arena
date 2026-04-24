import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useRoadmapWithProgress, useUserActiveRoadmaps } from '@/hooks/useRoadmap';
import { useTopicProblems } from '@/hooks/useTopicProblems';
import { useTargets } from '@/hooks/useTargets';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MissionMapHero } from '@/components/roadmap/MissionMapHero';
import { SkillTreeTimeline } from '@/components/roadmap/SkillTreeTimeline';
import { TodaysPlanCard } from '@/components/roadmap/TodaysPlanCard';
import { PageHeader } from '@/components/bl/PageHeader';
import { GlassPanel } from '@/components/bl/GlassPanel';

export default function Roadmap() {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, error } = useRoadmapWithProgress(roadmapId);
  const { data: activeRoadmaps, isLoading: activeLoading } = useUserActiveRoadmaps();

  const { topicStats } = useTopicProblems(data?.topics ?? []);
  const { targets, progress, streak } = useTargets();

  const isStarted = activeRoadmaps?.some(r => r.roadmap_id === roadmapId);

  if (authLoading || isLoading || activeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!isStarted) return <Navigate to="/dashboard" replace />;

  if (error || !data) {
    return (
      <div className="container max-w-5xl py-8">
        <GlassPanel padding="lg" className="text-center">
          <p className="text-text-dim">Roadmap not found</p>
        </GlassPanel>
      </div>
    );
  }


  const currentTopic = data.topics.find(t => t.isCurrentTopic);
  const currentTopicStats = currentTopic ? topicStats[currentTopic.id] || null : null;
  const problemsTarget = targets?.daily || 2;
  const problemsSolved = Math.min(progress.today, problemsTarget);

  const handleTopicClick = (topicId: string) => navigate(`/challenges?topic=${topicId}`);
  const handleResume = () => { if (currentTopic) handleTopicClick(currentTopic.id); };

  return (
    <div className="relative min-h-screen">
      <div className="relative container max-w-6xl py-6 px-4 md:px-6">
        <PageHeader
          sector="004"
          tag="ROADMAP"
          title={data.roadmap.name}
          subtitle={data.roadmap.description || 'Master the fundamentals — track every topic, conquer every pattern.'}
        />

        <MissionMapHero
          roadmapName={data.roadmap.name}
          roadmapDescription={data.roadmap.description}
          currentTopic={currentTopic || null}
          currentTopicStats={currentTopicStats}
          onResume={handleResume}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <GlassPanel corners padding="lg">
              <SkillTreeTimeline
                topics={data.topics}
                topicStats={topicStats}
                onTopicClick={handleTopicClick}
              />
            </GlassPanel>
            <p className="text-xs text-text-mute text-center mt-4 opacity-70 font-mono">
              // Practice freely, but roadmap progress only counts for your active topic.
            </p>
          </div>

          <div className="w-full lg:w-[320px] flex-shrink-0 space-y-6">
            <TodaysPlanCard
              problemsSolved={problemsSolved}
              problemsTarget={problemsTarget}
              conceptsRead={0}
              conceptsTarget={1}
              streak={streak}
            />

            <GlassPanel corners sideStripe padding="md" className="space-y-3">
              <h3 className="font-display text-[10px] font-bold tracking-[0.28em] text-neon">
                OVERALL MASTERY
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-text text-glow tabular-nums">
                  {data.progressPercentage}%
                </span>
                <span className="text-sm text-text-dim">
                  {data.completedCount}/{data.totalCount} topics
                </span>
              </div>
              <div className="h-2 rounded-full bg-panel overflow-hidden border border-line">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neon to-electric transition-all duration-700"
                  style={{ width: `${Math.max(2, data.progressPercentage)}%` }}
                />
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
