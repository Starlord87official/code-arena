import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  AlertCircle,
  Eye,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  useWeaknessDetection,
  SeverityLevel,
  TopicWeakness,
} from '@/hooks/useWeaknessDetection';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const severityConfig: Record<
  SeverityLevel,
  {
    icon: React.ElementType;
    label: string;
    tagClass: string;
    iconClass: string;
    hoverClass: string;
    borderHover: string;
  }
> = {
  critical: {
    icon: AlertTriangle,
    label: 'CRITICAL',
    tagClass: 'bg-blood/10 border-blood/40 text-blood',
    iconClass: 'text-blood',
    hoverClass: 'hover:bg-blood/[0.04]',
    borderHover: 'hover:border-blood/40',
  },
  at_risk: {
    icon: AlertCircle,
    label: 'AT RISK',
    tagClass: 'bg-ember/10 border-ember/40 text-ember',
    iconClass: 'text-ember',
    hoverClass: 'hover:bg-ember/[0.04]',
    borderHover: 'hover:border-ember/40',
  },
  watch: {
    icon: Eye,
    label: 'WATCH',
    tagClass: 'bg-neon/10 border-neon/30 text-neon',
    iconClass: 'text-neon',
    hoverClass: 'hover:bg-neon/[0.03]',
    borderHover: 'hover:border-neon/40',
  },
};

function WeaknessItem({ weakness }: { weakness: TopicWeakness }) {
  const [isOpen, setIsOpen] = useState(false);
  const config = severityConfig[weakness.severity];
  const Icon = config.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div
          className={cn(
            'group relative border border-line/60 bg-void/40 p-3 cursor-pointer transition-colors',
            config.borderHover,
            config.hoverClass,
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center border border-line bg-panel/60 transition-colors',
                'group-hover:bg-void/60',
              )}
            >
              <Icon className={cn('h-4 w-4', config.iconClass)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-[14px] font-bold text-text truncate">
                  {weakness.topicName}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center px-1.5 py-0.5 border font-display text-[9px] font-bold tracking-[0.18em] shrink-0',
                    config.tagClass,
                  )}
                >
                  {config.label}
                </span>
              </div>
              <p className="text-[11.5px] text-text-dim truncate mt-0.5">
                {weakness.primaryReason}
              </p>
            </div>
            <ChevronRight
              className={cn(
                'h-4 w-4 text-text-mute transition-transform shrink-0',
                isOpen && 'rotate-90',
              )}
            />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-2 mt-2 p-3 bg-void/40 border border-line/40 space-y-2">
          <p className="font-display text-[10px] font-bold tracking-[0.22em] text-text-mute mb-2">
            ISSUES DETECTED ({weakness.triggeredRules.length})
          </p>
          {weakness.triggeredRules.map((rule) => (
            <div key={rule.rule} className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ember mt-1.5 shrink-0" />
              <div>
                <p className="text-[12px] font-semibold text-text">{rule.label}</p>
                <p className="text-[11px] text-text-dim">{rule.guidance}</p>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AreasToImproveCard() {
  const { weaknesses, isLoading, hasWeaknesses } = useWeaknessDetection();

  if (isLoading) {
    return (
      <div className="relative bl-glass p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ember" />
      </div>
    );
  }

  return (
    <div className="relative bl-glass overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-ember" />
            <h3 className="font-display text-[14px] font-bold tracking-tight text-text">
              Areas to Improve
            </h3>
          </div>
          {hasWeaknesses && (
            <span className="flex h-6 w-6 items-center justify-center bg-ember/15 border border-ember/40 text-ember font-display text-[11px] font-bold">
              {weaknesses.length}
            </span>
          )}
        </div>
        <p className="text-[12px] text-text-dim leading-snug">
          Rule-based analysis of your learning patterns.
        </p>

        {!hasWeaknesses ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-neon/30 blur-xl" />
              <div className="relative flex h-12 w-12 items-center justify-center bg-neon/10 border-2 border-neon/40 bl-clip-notch bl-pulse">
                <CheckCircle2 className="h-5 w-5 text-neon" />
              </div>
            </div>
            <p className="font-display text-[13px] font-bold text-neon tracking-tight">
              YOU'RE DOMINATING
            </p>
            <p className="text-[11px] text-text-dim mt-1">
              No weaknesses detected. Keep the momentum.
            </p>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {weaknesses.slice(0, 3).map((weakness) => (
              <li key={weakness.topicId}>
                <WeaknessItem weakness={weakness} />
              </li>
            ))}
            {weaknesses.length > 3 && (
              <Link
                to="/roadmap/dsa"
                className="mt-1 flex items-center justify-center gap-1 font-display text-[11px] font-bold tracking-[0.2em] text-text-dim hover:text-ember transition-colors py-2"
              >
                VIEW ALL {weaknesses.length} AREAS
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
