import { useState } from 'react';
import { Target, Edit2, Check, X, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTargets } from '@/hooks/useTargets';
import { cn } from '@/lib/utils';

type Accent = 'neon' | 'electric' | 'ember';

const accentMap: Record<Accent, { bar: string; text: string }> = {
  neon: { bar: 'from-neon to-electric', text: 'text-neon' },
  electric: { bar: 'from-electric to-blue-mid', text: 'text-neon-soft' },
  ember: { bar: 'from-ember to-ember-soft', text: 'text-ember' },
};

export function TargetCard() {
  const { targets, progress, streak, isLoading, updateTargets, isUpdating } = useTargets();
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    daily: targets?.daily ?? 0,
    weekly: targets?.weekly ?? 0,
    monthly: targets?.monthly ?? 0,
  });

  const handleEdit = () => {
    setEditValues({
      daily: targets?.daily ?? 0,
      weekly: targets?.weekly ?? 0,
      monthly: targets?.monthly ?? 0,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateTargets(editValues);
    setIsEditing(false);
  };

  const dailyMet = targets?.daily ? progress.today >= targets.daily : false;

  if (isLoading) {
    return (
      <div className="relative bl-glass p-5 animate-pulse">
        <div className="h-4 bg-panel rounded w-1/2 mb-4" />
        <div className="space-y-3">
          <div className="h-3 bg-panel rounded" />
          <div className="h-3 bg-panel rounded" />
          <div className="h-3 bg-panel rounded" />
        </div>
      </div>
    );
  }

  const goals: { label: string; value: number; total: number; accent: Accent }[] = [
    { label: 'DAILY', value: progress.today, total: targets?.daily ?? 0, accent: 'neon' },
    { label: 'WEEKLY', value: progress.week, total: targets?.weekly ?? 0, accent: 'electric' },
    { label: 'MONTHLY', value: progress.month, total: targets?.monthly ?? 0, accent: 'ember' },
  ];

  return (
    <div className="relative bl-glass">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-neon" />
          <h3 className="font-display text-[13px] font-bold tracking-[0.22em] text-text">
            KILL COUNT
          </h3>
          <span className="h-px flex-1 bg-line/60" />
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="font-mono text-[10px] text-text-mute hover:text-neon flex items-center gap-1 transition-colors"
            >
              <Edit2 className="h-3 w-3" /> EDIT
            </button>
          ) : (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-neon"
                onClick={handleSave}
                disabled={isUpdating}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-ember"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Streak */}
        <div className="mb-4 flex items-center gap-3 border border-ember/30 bg-ember/[0.04] p-3">
          <Flame
            className={cn(
              'h-5 w-5',
              streak > 0 ? 'text-ember' : 'text-text-mute',
            )}
          />
          <div className="flex-1">
            <div className="font-display text-[20px] font-bold tabular-nums text-ember leading-none text-glow-ember">
              {streak}
            </div>
            <div className="font-display text-[9px] font-bold tracking-[0.22em] text-text-mute mt-1">
              DAY STREAK
            </div>
          </div>
          {dailyMet && (
            <span className="font-display text-[10px] font-bold tracking-[0.18em] text-neon">
              ✓ TODAY
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {goals.map((g, i) => {
            const a = accentMap[g.accent];
            const total = isEditing
              ? (editValues[g.label.toLowerCase() as 'daily' | 'weekly' | 'monthly'] || 0)
              : g.total;
            const pct = total > 0 ? Math.min((g.value / total) * 100, 100) : 0;

            return (
              <div key={g.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-display text-[10px] font-bold tracking-[0.22em] text-text-dim">
                    {g.label}
                  </span>
                  {isEditing ? (
                    <Input
                      type="number"
                      min={0}
                      value={editValues[g.label.toLowerCase() as 'daily' | 'weekly' | 'monthly']}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          [g.label.toLowerCase()]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="h-6 w-16 text-xs text-right font-mono bg-void/60 border-line"
                    />
                  ) : (
                    <span className={cn('font-display text-[13px] font-bold tabular-nums', a.text)}>
                      {g.value}
                      <span className="text-text-mute">/{g.total || '—'}</span>
                    </span>
                  )}
                </div>
                <div className="h-1.5 bl-bar-track">
                  <div
                    className={cn('h-full bg-gradient-to-r transition-all duration-500', a.bar)}
                    style={{ width: `${Math.max(pct, total > 0 ? 2 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {!targets?.daily && !targets?.weekly && !targets?.monthly && !isEditing && (
          <p className="text-[11px] text-text-mute mt-3 text-center font-mono">
            // CLICK EDIT TO SET TARGETS
          </p>
        )}
      </div>
    </div>
  );
}
