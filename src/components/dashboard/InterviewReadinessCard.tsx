import { useState } from 'react';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import {
  useInterviewReadiness,
  getBandConfig,
  ScoreTrend,
  ScoreBreakdown,
} from '@/hooks/useInterviewReadiness';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScoreExplainButton } from '@/components/ai/ScoreExplainButton';
import { AIUsageBadge } from '@/components/ai/AIUsageBadge';

const trendConfig: Record<
  ScoreTrend,
  { icon: React.ElementType; label: string; tone: 'neon' | 'ember' | 'mute' }
> = {
  up: { icon: TrendingUp, label: 'IMPROVING', tone: 'neon' },
  down: { icon: TrendingDown, label: 'DECLINING', tone: 'ember' },
  stable: { icon: Minus, label: 'STABLE', tone: 'mute' },
};

function BreakdownItem({ item }: { item: ScoreBreakdown }) {
  const percentage = Math.round(item.score);
  const tone =
    percentage >= 80 ? 'neon' : percentage >= 50 ? 'electric' : 'ember';
  const barClass =
    tone === 'neon'
      ? 'from-neon to-electric'
      : tone === 'electric'
        ? 'from-electric to-blue-mid'
        : 'from-ember to-ember-soft';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-display text-[11px] font-bold tracking-[0.18em] text-text">
          {item.category.toUpperCase()}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-text-mute">{item.weight}% W</span>
          <span
            className={cn(
              'font-display text-[11px] font-bold tabular-nums',
              tone === 'neon' && 'text-neon',
              tone === 'electric' && 'text-neon-soft',
              tone === 'ember' && 'text-ember',
            )}
          >
            {percentage}%
          </span>
        </div>
      </div>
      <div className="h-1 bl-bar-track">
        <div
          className={cn('h-full bg-gradient-to-r', barClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <ul className="text-[11px] text-text-dim space-y-0.5 ml-1">
        {item.reasons.map((reason, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="text-text-mute">·</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function InterviewReadinessCard() {
  const { score, band, label, trend, breakdown, isLoading } = useInterviewReadiness();
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (isLoading) {
    return (
      <div className="relative bl-glass p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neon" />
      </div>
    );
  }

  const t = trendConfig[trend];
  const TrendIcon = t.icon;
  const isStrong = score >= 65;
  const accent: 'neon' | 'ember' = isStrong ? 'neon' : 'ember';
  const accentClasses = {
    neon: {
      score: 'text-neon text-glow',
      bar: 'from-neon to-electric shadow-[0_0_14px_rgba(0,240,255,0.5)]',
      pill: 'border-neon/40 bg-neon/10 text-neon',
      stripe: 'via-neon',
    },
    ember: {
      score: 'text-ember text-glow-ember',
      bar: 'from-ember to-ember-soft shadow-[0_0_14px_rgba(255,107,26,0.5)]',
      pill: 'border-ember/40 bg-ember/5 text-ember',
      stripe: 'via-ember',
    },
  }[accent];

  return (
    <div className="relative bl-glass overflow-hidden">
      <div
        className={cn(
          'absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent to-transparent',
          accentClasses.stripe,
        )}
      />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className={cn('h-4 w-4', accent === 'neon' ? 'text-neon' : 'text-ember')} />
              <h3 className="font-display text-[15px] font-bold tracking-tight text-text">
                Interview Readiness
              </h3>
            </div>
            <p className="mt-1.5 text-[12px] text-text-dim leading-snug max-w-[240px]">
              Your preparation score based on learning patterns.
            </p>
          </div>

          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 border font-display text-[10px] font-bold tracking-[0.18em]',
              t.tone === 'neon' && 'border-neon/40 bg-neon/10 text-neon',
              t.tone === 'ember' && 'border-ember/40 bg-ember/10 text-ember',
              t.tone === 'mute' && 'border-line bg-panel/60 text-text-mute',
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {t.label}
          </span>
        </div>

        <div className="mt-5 flex items-end gap-3">
          <div
            className={cn(
              'font-display text-[72px] font-bold leading-none tabular-nums',
              accentClasses.score,
            )}
          >
            {score}
          </div>
          <div className="pb-2">
            <div className="font-display text-[18px] font-bold text-text-dim leading-none">
              /100
            </div>
            <div
              className={cn(
                'mt-1 inline-flex items-center px-2 py-0.5 border font-display text-[9px] font-bold tracking-[0.22em]',
                accentClasses.pill,
              )}
            >
              {label.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-2 bl-bar-track">
            <div
              className={cn('h-full bg-gradient-to-r', accentClasses.bar)}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between font-display text-[10px] font-bold tracking-[0.2em] text-text-mute">
            <span>NOT READY</span>
            <span>STRONG CANDIDATE</span>
          </div>
        </div>

        <Collapsible open={showBreakdown} onOpenChange={setShowBreakdown}>
          <div className="mt-5 border-t border-line/60 pt-3">
            <CollapsibleTrigger asChild>
              <button className="inline-flex items-center gap-2 font-display text-[11px] font-bold tracking-[0.2em] text-text-dim hover:text-neon transition-colors">
                {showBreakdown ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    HIDE BREAKDOWN
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    VIEW SCORE BREAKDOWN
                  </>
                )}
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="pt-4 space-y-4">
              {breakdown.map((item) => (
                <BreakdownItem key={item.category} item={item} />
              ))}
              <div className="pt-2 border-t border-line/60">
                <ScoreExplainButton score={score} breakdown={breakdown} />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex justify-end pt-3">
          <AIUsageBadge />
        </div>
      </div>
    </div>
  );
}

// Compact version for profiles
export function InterviewReadinessScore({ score, band }: { score: number; band: string }) {
  const bandConfig = getBandConfig(band as any);
  return (
    <div className="flex items-center gap-2">
      <span className={cn('font-display text-2xl font-bold', bandConfig.color)}>{score}</span>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Readiness</span>
        <span className={cn('text-xs font-medium', bandConfig.color)}>{bandConfig.label}</span>
      </div>
    </div>
  );
}
