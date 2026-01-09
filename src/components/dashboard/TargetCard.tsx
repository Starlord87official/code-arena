import { useState } from 'react';
import { Target, Edit2, Check, X, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useTargets } from '@/hooks/useTargets';

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

  const handleCancel = () => {
    setIsEditing(false);
  };

  const getProgressPercent = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (current: number, target: number) => {
    if (target === 0) return 'bg-muted';
    const percent = (current / target) * 100;
    if (percent >= 100) return 'bg-status-success';
    if (percent >= 50) return 'bg-primary';
    return 'bg-status-warning';
  };

  const dailyProgress = getProgressPercent(progress.today, targets?.daily ?? 0);
  const weeklyProgress = getProgressPercent(progress.week, targets?.weekly ?? 0);
  const monthlyProgress = getProgressPercent(progress.month, targets?.monthly ?? 0);

  const dailyMet = targets?.daily ? progress.today >= targets.daily : false;

  if (isLoading) {
    return (
      <div className="arena-card p-4 rounded-xl animate-pulse">
        <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="arena-card p-4 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-display font-bold text-sm">Targets</h3>
        </div>
        {!isEditing ? (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEdit}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-status-success" 
              onClick={handleSave}
              disabled={isUpdating}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={handleCancel}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Streak Display */}
      <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-secondary/50">
        <Flame className={`h-5 w-5 ${streak > 0 ? 'text-status-warning streak-flame' : 'text-muted-foreground'}`} />
        <div>
          <p className="font-display font-bold text-lg text-status-warning">{streak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
        {dailyMet && (
          <div className="ml-auto">
            <span className="text-xs text-status-success font-medium">✓ Today complete</span>
          </div>
        )}
      </div>

      {/* Target Progress */}
      <div className="space-y-3">
        {/* Daily */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Daily</span>
            {isEditing ? (
              <Input
                type="number"
                min={0}
                value={editValues.daily}
                onChange={(e) => setEditValues({ ...editValues, daily: parseInt(e.target.value) || 0 })}
                className="h-6 w-16 text-xs text-right"
              />
            ) : (
              <span className={dailyMet ? 'text-status-success font-medium' : ''}>
                {progress.today}/{targets?.daily || '—'}
              </span>
            )}
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress.today, targets?.daily ?? 0)}`}
              style={{ width: `${dailyProgress}%` }}
            />
          </div>
        </div>

        {/* Weekly */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Weekly</span>
            {isEditing ? (
              <Input
                type="number"
                min={0}
                value={editValues.weekly}
                onChange={(e) => setEditValues({ ...editValues, weekly: parseInt(e.target.value) || 0 })}
                className="h-6 w-16 text-xs text-right"
              />
            ) : (
              <span className={targets?.weekly && progress.week >= targets.weekly ? 'text-status-success font-medium' : ''}>
                {progress.week}/{targets?.weekly || '—'}
              </span>
            )}
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress.week, targets?.weekly ?? 0)}`}
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
        </div>

        {/* Monthly */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Monthly</span>
            {isEditing ? (
              <Input
                type="number"
                min={0}
                value={editValues.monthly}
                onChange={(e) => setEditValues({ ...editValues, monthly: parseInt(e.target.value) || 0 })}
                className="h-6 w-16 text-xs text-right"
              />
            ) : (
              <span className={targets?.monthly && progress.month >= targets.monthly ? 'text-status-success font-medium' : ''}>
                {progress.month}/{targets?.monthly || '—'}
              </span>
            )}
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress.month, targets?.monthly ?? 0)}`}
              style={{ width: `${monthlyProgress}%` }}
            />
          </div>
        </div>
      </div>

      {!targets?.daily && !targets?.weekly && !targets?.monthly && !isEditing && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Click edit to set your targets
        </p>
      )}
    </div>
  );
}
