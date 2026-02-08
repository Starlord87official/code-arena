import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOAAssessmentDetail } from '@/hooks/useOAPacks';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, Monitor, Eye, Timer, Navigation, CheckCircle2,
  Wifi, Keyboard, AlertTriangle, Play
} from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function OAInstructions() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { data: assessment, isLoading } = useOAAssessmentDetail(assessmentId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    if (!user?.id || !assessmentId) return;

    setIsStarting(true);
    try {
      // Calculate max score
      const { data: questions } = await supabase
        .from('oa_questions')
        .select('points')
        .eq('assessment_id', assessmentId);

      const maxScore = questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;

      // Create attempt
      const { data: attempt, error } = await supabase
        .from('oa_attempts')
        .insert({
          user_id: user.id,
          assessment_id: assessmentId,
          max_score: maxScore,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Try fullscreen
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen is optional
      }

      navigate(`/oa/attempt/${attempt.id}`);
    } catch (err) {
      toast({
        title: 'Failed to start OA',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 max-w-3xl py-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="container mx-auto px-4 max-w-3xl py-6 text-center">
        <p className="text-muted-foreground">Assessment not found.</p>
      </div>
    );
  }

  const rules = (assessment.rules_json || {}) as Record<string, boolean>;
  const sections = (assessment.sections_json || []) as Array<{ name: string; questionCount: number }>;
  const packData = (assessment as any).oa_packs;

  return (
    <div className="container mx-auto px-4 max-w-3xl py-6 space-y-6">
      <Link to={packData ? `/oa/pack/${packData.id}` : '/oa'} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="arena-card overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border p-6">
            <p className="text-xs font-heading uppercase tracking-widest text-primary mb-2">
              {packData?.title || 'OA Arena'}
            </p>
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              {assessment.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Read the rules carefully before starting.
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Rules */}
            <div className="space-y-3">
              <h2 className="font-heading text-sm uppercase tracking-widest text-muted-foreground">
                Assessment Rules
              </h2>
              <div className="grid gap-3">
                <RuleItem
                  icon={Monitor}
                  label="Fullscreen Recommended"
                  description="This assessment is best taken in fullscreen mode. Exits will be logged."
                  active={rules.fullscreenRecommended}
                />
                <RuleItem
                  icon={Eye}
                  label="Tab Switch Logging"
                  description="Switching tabs or windows will be recorded in your integrity report."
                  active={rules.tabSwitchLogged}
                />
                <RuleItem
                  icon={Timer}
                  label={`Duration: ${assessment.duration_minutes} minutes`}
                  description="The timer starts when you begin and cannot be paused."
                  active={true}
                />
                <RuleItem
                  icon={Navigation}
                  label="Free Navigation"
                  description="You can move between questions freely within sections."
                  active={rules.navigationFree}
                />
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-3">
              <h2 className="font-heading text-sm uppercase tracking-widest text-muted-foreground">
                Sections
              </h2>
              <div className="grid gap-2">
                {sections.map((section, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
                  >
                    <span className="text-sm text-foreground">{section.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {section.questionCount} question{section.questionCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Checklist */}
            <div className="space-y-3">
              <h2 className="font-heading text-sm uppercase tracking-widest text-muted-foreground">
                System Checklist
              </h2>
              <div className="grid gap-2">
                <ChecklistItem icon={Wifi} label="Stable internet connection" />
                <ChecklistItem icon={Keyboard} label="Keyboard shortcuts available" />
                <ChecklistItem icon={Monitor} label="Single monitor recommended" />
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Important</p>
                <p className="text-xs text-muted-foreground">
                  Once you begin, the timer cannot be paused. Make sure you have enough uninterrupted time.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Link to={packData ? `/oa/pack/${packData.id}` : '/oa'} className="flex-1">
                <Button variant="outline" className="w-full">Cancel</Button>
              </Link>
              <Button
                variant="arena"
                className="flex-1"
                onClick={handleStart}
                disabled={isStarting}
              >
                <Play className="h-4 w-4 mr-2" />
                {isStarting ? 'Starting...' : 'Enter Fullscreen & Begin'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function RuleItem({
  icon: Icon,
  label,
  description,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ChecklistItem({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 p-2">
      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
