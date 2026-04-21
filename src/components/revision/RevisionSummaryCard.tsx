import { RotateCw, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { useRevisionSummary, useRevisionsDueToday, useMissedRevisions } from '@/hooks/useRevisions';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function RevisionSummaryCard() {
  const { data: summary, isLoading: summaryLoading } = useRevisionSummary();
  const { isLoading: dueTodayLoading } = useRevisionsDueToday();
  const { data: missed, isLoading: missedLoading } = useMissedRevisions();

  const isLoading = summaryLoading || dueTodayLoading || missedLoading;

  if (isLoading) {
    return (
      <div className="relative bl-glass p-5">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-48 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  const hasMissed = (summary?.missed || 0) > 0;

  return (
    <div className="relative bl-glass">
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <RotateCw className="h-4 w-4 text-neon" />
            <h3 className="font-display text-[14px] font-bold tracking-tight text-text">
              Spaced Repetition
            </h3>
          </div>
          {hasMissed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-blood/40 bg-blood/10 text-blood font-display text-[9px] font-bold tracking-[0.2em] bl-pulse-ember">
              <AlertTriangle className="h-3 w-3" />
              {summary?.missed} MISSED
            </span>
          )}
        </div>
        <p className="text-[12px] text-text-dim leading-snug">
          Keep your knowledge fresh with scheduled revisions.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <SummaryCard
            icon={Calendar}
            label="DUE TODAY"
            value={summary?.due_today || 0}
            accent="neon"
          />
          <SummaryCard
            icon={Clock}
            label="UPCOMING"
            value={summary?.upcoming || 0}
            accent="electric"
          />
        </div>

        {hasMissed && missed && missed.length > 0 && (
          <div className="mt-4 pt-3 border-t border-line/60">
            <p className="font-display text-[10px] font-bold tracking-[0.22em] text-blood mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              MISSED REVISIONS
            </p>
            <div className="space-y-1.5">
              {missed.slice(0, 3).map((rev) => (
                <div
                  key={rev.id}
                  className="flex items-center justify-between text-[11px] border border-line/50 bg-void/40 px-2 py-1.5"
                >
                  <span className="text-text-dim truncate">{rev.topic_name}</span>
                  <span className="font-mono text-[10px] text-blood/80 shrink-0">
                    REV {rev.revision_number}
                  </span>
                </div>
              ))}
              {missed.length > 3 && (
                <p className="font-mono text-[10px] text-blood/70 text-center pt-1">
                  +{missed.length - 3} MORE
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent: 'neon' | 'electric';
}) {
  return (
    <div className="relative border border-line/60 bg-void/40 p-3 hover:border-neon/40 transition-colors">
      <div className="flex items-center justify-between">
        <Icon
          className={cn(
            'h-4 w-4',
            accent === 'neon' ? 'text-neon' : 'text-neon-soft',
          )}
        />
        <span
          className={cn(
            'font-display text-[9px] font-bold tracking-[0.2em]',
            accent === 'neon' ? 'text-neon/80' : 'text-neon-soft/80',
          )}
        >
          {label}
        </span>
      </div>
      <div className="mt-2 font-display text-[28px] font-bold leading-none tabular-nums text-text">
        {value}
      </div>
    </div>
  );
}
