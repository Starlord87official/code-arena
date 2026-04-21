import { Link } from 'react-router-dom';
import { BookOpen, Play, Lock, CheckCircle2, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useRoadmapWithProgress,
  TopicWithProgress,
} from '@/hooks/useRoadmap';

interface LearningPathCardProps {
  roadmapId?: string;
}

export function LearningPathCard({ roadmapId = 'dsa' }: LearningPathCardProps) {
  const { data, isLoading } = useRoadmapWithProgress(roadmapId);

  if (isLoading) {
    return (
      <div className="relative bl-glass p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neon" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="relative bl-glass p-8 text-center">
        <p className="text-text-dim text-sm">No roadmap available.</p>
      </div>
    );
  }

  const { roadmap, topics, completedCount, totalCount, progressPercentage } = data;

  return (
    <div className="relative bl-glass overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-line/50">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-neon" />
          <span className="font-display text-[10px] font-bold tracking-[0.28em] text-neon/80">
            YOUR LEARNING PATH
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold tracking-tight leading-tight text-text">
              {roadmap.name}
            </h3>
            {roadmap.description && (
              <p className="mt-1.5 text-[13px] text-text-dim">{roadmap.description}</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neon/10 border border-neon/40 text-neon">
              <Zap className="h-3.5 w-3.5" />
              <span className="font-display text-[11px] font-bold tracking-[0.2em] tabular-nums">
                {completedCount}/{totalCount} TOPICS
              </span>
            </div>
            <div className="mt-2 font-display text-[11px] font-bold tracking-[0.2em] text-text-dim">
              {progressPercentage}% COMPLETE
            </div>
          </div>
        </div>

        <div className="mt-4 h-1.5 bl-bar-track">
          <div
            className="h-full bg-gradient-to-r from-neon to-electric shadow-[0_0_14px_rgba(0,240,255,0.5)]"
            style={{ width: `${Math.max(progressPercentage, 2)}%` }}
          />
        </div>
      </div>

      {/* Currently learning tag */}
      <div className="relative px-5 pt-4 pb-2 flex items-center gap-2">
        <Play className="h-3.5 w-3.5 text-neon fill-neon" />
        <span className="font-display text-[10px] font-bold tracking-[0.28em] text-neon">
          CURRENTLY LEARNING
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-neon/30 to-transparent" />
      </div>

      {/* Topic grid */}
      <div className="p-5 pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        {topics.slice(0, 6).map((t, i) => (
          <TopicRow key={t.id} topic={t} order={i + 1} />
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-line/50 p-4 flex items-center justify-between">
        <span className="font-mono text-[11px] text-text-mute tabular-nums">
          {String(totalCount).padStart(2, '0')} TOPICS
        </span>
        <Link to={`/roadmap/${roadmapId}`}>
          <button className="bl-btn-ghost">VIEW FULL ROADMAP</button>
        </Link>
      </div>
    </div>
  );
}

function TopicRow({ topic, order }: { topic: TopicWithProgress; order: number }) {
  const locked = topic.lockStatus === 'locked';
  const complete = topic.lockStatus === 'completed';
  const inProgress = topic.lockStatus === 'in_progress';
  const orderLabel = String(order).padStart(2, '0');

  const content = (
    <div
      className={cn(
        'relative border border-line/60 bg-panel/40 p-3 flex items-center gap-3 transition-all',
        locked && 'opacity-55',
        !locked && 'hover:border-neon/50 hover:bg-neon/[0.03]',
      )}
    >
      <div
        className={cn(
          'shrink-0 flex h-10 w-10 items-center justify-center font-display text-[13px] font-bold border bl-clip-notch tabular-nums',
          complete
            ? 'bg-neon/15 border-neon/50 text-neon'
            : locked
              ? 'bg-panel-2 border-line text-text-mute'
              : 'bg-neon/10 border-neon/40 text-neon',
        )}
      >
        {orderLabel}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              'font-display text-[14px] font-bold tracking-tight truncate',
              locked ? 'text-text-mute' : 'text-text',
            )}
          >
            {topic.topic_name}
          </h4>
          {complete && <CheckCircle2 className="h-3.5 w-3.5 text-neon shrink-0" />}
        </div>

        {!locked ? (
          <div className="mt-1.5 h-1 bg-void/60">
            <div
              className="h-full bg-gradient-to-r from-neon to-electric"
              style={{
                width: complete ? '100%' : inProgress ? '50%' : '5%',
              }}
            />
          </div>
        ) : (
          <div className="mt-1.5 font-mono text-[10px] text-text-mute tracking-wider">
            LOCKED // COMPLETE PRIOR TO UNLOCK
          </div>
        )}
      </div>

      <div className="shrink-0">
        {locked ? (
          <Lock className="h-4 w-4 text-text-mute" />
        ) : (
          <span className="font-display text-[10px] font-bold tracking-[0.18em] text-neon">
            {complete ? 'DONE' : inProgress ? 'ACTIVE' : 'OPEN'}
          </span>
        )}
      </div>
    </div>
  );

  if (locked) return content;
  return <Link to={`/roadmap/${topic.roadmap_id}`}>{content}</Link>;
}
