import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOAAttempt, useOAAttemptAnswers } from '@/hooks/useOAAttempt';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle, CheckCircle2, Circle, Flag, Eye, Send, ArrowLeft
} from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function OASubmit() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { data: attempt, isLoading } = useOAAttempt(attemptId);
  const { data: answers } = useOAAttemptAnswers(attemptId);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!attemptId) return;
    setIsSubmitting(true);

    try {
      // Calculate score (simple: sum of answer scores where status is attempted/solved)
      const totalScore = answers?.reduce((sum: number, a: any) => {
        if (a.status === 'attempted' || a.status === 'solved') {
          return sum + (a.score || 0);
        }
        return sum;
      }, 0) || 0;

      const { error } = await supabase
        .from('oa_attempts')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          score: totalScore,
        })
        .eq('id', attemptId);

      if (error) throw error;

      // Exit fullscreen
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch { /* ignore */ }

      toast({
        title: 'Assessment Submitted!',
        description: 'Your OA has been recorded. View your report below.',
      });

      navigate(`/oa/report/${attemptId}`);
    } catch {
      toast({
        title: 'Submission failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Skeleton className="h-96 w-full max-w-lg" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Attempt not found</h1>
        <Link to="/oa"><Button variant="outline">Return to OA Arena</Button></Link>
      </div>
    );
  }

  const totalQuestions = answers?.length || 0;
  const attempted = answers?.filter((a: any) => a.status === 'attempted' || a.status === 'solved').length || 0;
  const marked = answers?.filter((a: any) => a.status === 'marked').length || 0;
  const unseen = answers?.filter((a: any) => a.status === 'unseen').length || 0;
  const unanswered = totalQuestions - attempted;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-6">
      <Card className="arena-card max-w-lg w-full">
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <Send className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Submit Assessment</h1>
            <p className="text-sm text-muted-foreground">
              Review your progress before final submission. You cannot re-enter after submitting.
            </p>
          </div>

          {/* Summary */}
          <div className="space-y-3 p-4 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Attempted
              </span>
              <span className="text-sm font-medium text-foreground">{attempted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flag className="h-4 w-4 text-yellow-400" /> Marked for Review
              </span>
              <span className="text-sm font-medium text-foreground">{marked}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Circle className="h-4 w-4" /> Unanswered
              </span>
              <span className="text-sm font-medium text-foreground">{unanswered}</span>
            </div>
          </div>

          {/* Warning */}
          {unanswered > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                You have <strong className="text-foreground">{unanswered}</strong> unanswered question{unanswered !== 1 ? 's' : ''}. 
                Once submitted, you cannot go back.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(`/oa/attempt/${attemptId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
