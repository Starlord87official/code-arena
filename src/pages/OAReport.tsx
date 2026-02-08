import { useParams, Link } from 'react-router-dom';
import { useOAAttempt, useOAAttemptAnswers } from '@/hooks/useOAAttempt';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, AlertTriangle, CheckCircle2, XCircle, Clock,
  BarChart3, Target, Trophy
} from 'lucide-react';

export default function OAReport() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { data: attempt, isLoading } = useOAAttempt(attemptId);
  const { data: answers } = useOAAttemptAnswers(attemptId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 max-w-4xl py-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Report not found</h1>
        <Link to="/oa"><Button variant="outline">Return to OA Arena</Button></Link>
      </div>
    );
  }

  const assessment = (attempt as any)?.oa_assessments;
  const pack = assessment?.oa_packs;
  const score = attempt.score || 0;
  const maxScore = attempt.max_score || 1;
  const percentage = Math.round((score / maxScore) * 100);
  const integrity = (attempt.integrity_json || {}) as Record<string, number>;

  const totalQuestions = answers?.length || 0;
  const attempted = answers?.filter((a: any) => a.status === 'attempted' || a.status === 'solved').length || 0;
  const correct = answers?.filter((a: any) => (a.score || 0) > 0).length || 0;

  const startedAt = new Date(attempt.started_at);
  const submittedAt = attempt.submitted_at ? new Date(attempt.submitted_at) : null;
  const timeTakenMin = submittedAt
    ? Math.round((submittedAt.getTime() - startedAt.getTime()) / 60000)
    : null;

  return (
    <div className="container mx-auto px-4 max-w-4xl py-6 space-y-6">
      <Link to="/oa" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to OA Arena
      </Link>

      {/* Header */}
      <div>
        <p className="text-xs font-heading uppercase tracking-widest text-primary mb-1">
          {pack?.title || 'OA Arena'}
        </p>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {assessment?.title || 'Assessment'} — Report
        </h1>
      </div>

      {/* Score Card */}
      <Card className="arena-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Score</p>
              <p className="font-display text-4xl font-bold text-foreground">
                {score}<span className="text-lg text-muted-foreground">/{maxScore}</span>
              </p>
            </div>
            <div className={`h-20 w-20 rounded-full border-4 flex items-center justify-center ${
              percentage >= 70 ? 'border-emerald-500 text-emerald-400'
              : percentage >= 40 ? 'border-yellow-500 text-yellow-400'
              : 'border-destructive text-destructive'
            }`}>
              <span className="text-xl font-bold">{percentage}%</span>
            </div>
          </div>
          <Progress value={percentage} className="mt-4 h-2" />
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatItem icon={Target} label="Attempted" value={`${attempted}/${totalQuestions}`} />
            <StatItem icon={CheckCircle2} label="Correct" value={String(correct)} color="text-emerald-400" />
            <StatItem icon={Clock} label="Time Taken" value={timeTakenMin ? `${timeTakenMin} min` : 'N/A'} />
            <StatItem icon={Trophy} label="Accuracy" value={attempted > 0 ? `${Math.round((correct / attempted) * 100)}%` : 'N/A'} />
          </div>
        </CardContent>
      </Card>

      {/* Integrity */}
      <Card className="arena-card">
        <CardContent className="p-6">
          <h2 className="font-heading text-sm uppercase tracking-widest text-muted-foreground mb-4">
            Integrity Report
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-secondary/30 border border-border">
              <p className="text-2xl font-bold text-foreground">{integrity.tabSwitches || 0}</p>
              <p className="text-xs text-muted-foreground">Tab Switches</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/30 border border-border">
              <p className="text-2xl font-bold text-foreground">{integrity.fullscreenExits || 0}</p>
              <p className="text-xs text-muted-foreground">Fullscreen Exits</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/30 border border-border">
              <p className="text-2xl font-bold text-foreground">{integrity.copyPasteCount || 0}</p>
              <p className="text-xs text-muted-foreground">Copy/Paste Events</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-question breakdown */}
      <Card className="arena-card">
        <CardContent className="p-6">
          <h2 className="font-heading text-sm uppercase tracking-widest text-muted-foreground mb-4">
            Question Breakdown
          </h2>
          <div className="space-y-2">
            {answers?.map((a: any, idx: number) => {
              const q = a.oa_questions;
              const scored = (a.score || 0) > 0;
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
                >
                  <div className="flex items-center gap-3">
                    {scored ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : a.status === 'attempted' ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-muted-foreground inline-block" />
                    )}
                    <span className="text-sm text-foreground">Q{idx + 1}</span>
                    <Badge variant="outline" className="text-[10px]">{q?.type?.toUpperCase() || 'N/A'}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{a.time_spent_sec || 0}s</span>
                    <span className="text-sm font-medium text-foreground">
                      {a.score || 0}/{q?.points || 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/oa/history">
          <Button variant="outline">View All History</Button>
        </Link>
        <Link to="/oa">
          <Button>Take Another OA</Button>
        </Link>
      </div>
    </div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="text-center">
      <Icon className={`h-5 w-5 mx-auto mb-1 ${color || 'text-muted-foreground'}`} />
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
