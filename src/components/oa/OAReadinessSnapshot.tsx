import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { useOAReadiness } from '@/hooks/useOAReadiness';

export function OAReadinessSnapshot() {
  const { data: readiness, isLoading } = useOAReadiness();

  const score = readiness?.readiness_score ?? 0;
  const streak = readiness?.oa_streak ?? 0;
  const totalAttempts = readiness?.total_attempts ?? 0;
  const bestScore = readiness?.best_score ?? 0;
  const weakTopics = readiness?.weak_topics ?? [];

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-400';
    if (s >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="arena-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Your OA Readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="h-24 animate-pulse bg-secondary rounded-lg" />
        ) : totalAttempts === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm mb-2">No OA attempts yet</p>
            <p className="text-xs text-muted-foreground">
              Complete your first mock OA to see your readiness score
            </p>
          </div>
        ) : (
          <>
            {/* Readiness Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Readiness Score</span>
                <span className={`font-display text-2xl font-bold ${getScoreColor(score)}`}>
                  {score}%
                </span>
              </div>
              <Progress value={score} className="h-2" />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                </div>
                <p className="font-display text-lg font-bold text-foreground">{streak}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Streak</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="font-display text-lg font-bold text-foreground">{totalAttempts}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Attempts</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <p className="font-display text-lg font-bold text-foreground">{bestScore}%</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Best</p>
              </div>
            </div>

            {/* Weak Topics */}
            {weakTopics.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-xs font-heading uppercase tracking-wider text-muted-foreground">
                    Weak Areas
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {weakTopics.map(topic => (
                    <Badge key={topic} variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
