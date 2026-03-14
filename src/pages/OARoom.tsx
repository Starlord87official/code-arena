import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOAAttempt, useOAAttemptAnswers } from '@/hooks/useOAAttempt';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Timer, ChevronLeft, ChevronRight, Flag, Send,
  Eye, EyeOff, AlertTriangle, CheckCircle2, Circle, Minus
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

type QuestionStatus = 'unseen' | 'seen' | 'attempted' | 'solved' | 'marked';

interface QuestionData {
  id: string;
  statement: string;
  type: string;
  difficulty: string;
  points: number;
  section_index: number;
  question_order: number;
  config_json: Record<string, unknown>;
  tags: string[] | null;
}

export default function OARoom() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { data: attempt, isLoading: attemptLoading, error: attemptError } = useOAAttempt(attemptId);
  const { data: existingAnswers } = useOAAttemptAnswers(attemptId);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, QuestionStatus>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [integrityData, setIntegrityData] = useState({ tabSwitches: 0, fullscreenExits: 0, copyPasteCount: 0 });
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch questions for the assessment
  useEffect(() => {
    if (!attempt) return;
    const assessmentId = attempt.assessment_id;

    supabase
      .from('oa_questions')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('section_index', { ascending: true })
      .order('question_order', { ascending: true })
      .then(({ data }) => {
        if (data) setQuestions(data as QuestionData[]);
      });
  }, [attempt]);

  // Initialize answers from existing attempt answers
  useEffect(() => {
    if (!existingAnswers || existingAnswers.length === 0) return;
    const ans: Record<string, string> = {};
    const sts: Record<string, QuestionStatus> = {};
    existingAnswers.forEach((a: any) => {
      ans[a.question_id] = a.answer || '';
      sts[a.question_id] = a.status || 'unseen';
    });
    setAnswers(ans);
    setStatuses(sts);
  }, [existingAnswers]);

  // Timer
  useEffect(() => {
    if (!attempt) return;
    const assessment = (attempt as any).oa_assessments;
    if (!assessment) return;

    const startedAt = new Date(attempt.started_at).getTime();
    const durationMs = assessment.duration_minutes * 60 * 1000;
    const endTime = startedAt + durationMs;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        handleAutoSubmit();
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [attempt]);

  // Integrity monitoring
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIntegrityData(prev => ({ ...prev, tabSwitches: prev.tabSwitches + 1 }));
      }
    };
    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        setIntegrityData(prev => ({ ...prev, fullscreenExits: prev.fullscreenExits + 1 }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreen);
    };
  }, []);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!attemptId || questions.length === 0) return;

    autoSaveRef.current = setInterval(() => {
      saveAllAnswers();
    }, 5000);

    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [attemptId, questions, answers, statuses]);

  const saveAllAnswers = useCallback(async () => {
    if (!attemptId) return;

    for (const q of questions) {
      const answer = answers[q.id] || '';
      const status = statuses[q.id] || 'unseen';

      await supabase
        .from('oa_attempt_answers')
        .upsert({
          attempt_id: attemptId,
          question_id: q.id,
          answer,
          status,
          time_spent_sec: 0,
        }, { onConflict: 'attempt_id,question_id' });
    }

    // Update integrity data
    await supabase
      .from('oa_attempts')
      .update({ integrity_json: integrityData })
      .eq('id', attemptId);
  }, [attemptId, questions, answers, statuses, integrityData]);

  const handleAutoSubmit = async () => {
    await saveAllAnswers();
    if (attemptId) {
      navigate(`/oa/submit/${attemptId}`);
    }
  };

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setStatuses(prev => ({
      ...prev,
      [questionId]: value.trim() ? 'attempted' : 'seen',
    }));
  };

  const toggleMark = (questionId: string) => {
    setStatuses(prev => ({
      ...prev,
      [questionId]: prev[questionId] === 'marked' ? (answers[questionId]?.trim() ? 'attempted' : 'seen') : 'marked',
    }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: QuestionStatus) => {
    switch (status) {
      case 'attempted': return <CheckCircle2 className="h-3 w-3 text-emerald-400" />;
      case 'marked': return <Flag className="h-3 w-3 text-yellow-400" />;
      case 'seen': return <Eye className="h-3 w-3 text-blue-400" />;
      default: return <Circle className="h-3 w-3 text-muted-foreground" />;
    }
  };

  // Error / not found state
  if (attemptError || (!attemptLoading && !attempt)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Attempt not found or already submitted
        </h1>
        <p className="text-muted-foreground mb-6">This attempt may have expired or doesn't exist.</p>
        <Link to="/oa">
          <Button variant="outline">Return to OA Arena</Button>
        </Link>
      </div>
    );
  }

  if (attemptLoading || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full max-w-4xl" />
      </div>
    );
  }

  // Check if attempt is already submitted
  if (attempt?.status === 'submitted') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <CheckCircle2 className="h-16 w-16 text-emerald-400 mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Assessment Already Submitted
        </h1>
        <p className="text-muted-foreground mb-6">You've already completed this assessment.</p>
        <div className="flex gap-3">
          <Link to={`/oa/report/${attemptId}`}>
            <Button variant="default">View Report</Button>
          </Link>
          <Link to="/oa">
            <Button variant="outline">Back to OA Arena</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const assessment = (attempt as any)?.oa_assessments;
  const isTimeCritical = timeLeft !== null && timeLeft < 300;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <span className="font-heading text-sm text-muted-foreground uppercase tracking-widest">
            {assessment?.title || 'OA'}
          </span>
          <Badge variant="outline" className="text-xs">
            {currentIdx + 1} / {questions.length}
          </Badge>
        </div>

        <div className={`flex items-center gap-2 font-mono text-lg font-bold ${isTimeCritical ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <Timer className="h-5 w-5" />
          {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => navigate(`/oa/submit/${attemptId}`)}
        >
          <Send className="h-4 w-4 mr-2" />
          Submit OA
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question Navigator */}
        <div className="w-56 border-r border-border bg-card/50 p-4 overflow-y-auto hidden md:block">
          <h3 className="font-heading text-xs uppercase tracking-widest text-muted-foreground mb-3">Questions</h3>
          <div className="grid grid-cols-4 gap-2">
            {questions.map((q, idx) => {
              const status = statuses[q.id] || 'unseen';
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`relative w-10 h-10 rounded-lg border text-xs font-bold flex items-center justify-center transition-all ${
                    idx === currentIdx
                      ? 'border-primary bg-primary/20 text-primary'
                      : status === 'attempted' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                      : status === 'marked' ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
                      : status === 'seen' ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                      : 'border-border bg-secondary/30 text-muted-foreground'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><Circle className="h-3 w-3" /> Unseen</div>
            <div className="flex items-center gap-2"><Eye className="h-3 w-3 text-blue-400" /> Seen</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Attempted</div>
            <div className="flex items-center gap-2"><Flag className="h-3 w-3 text-yellow-400" /> Marked</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentQuestion && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{currentQuestion.type.toUpperCase()}</Badge>
                  <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
                  <span className="text-xs text-muted-foreground">{currentQuestion.points} pts</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleMark(currentQuestion.id)}
                  className={statuses[currentQuestion.id] === 'marked' ? 'text-yellow-400' : ''}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  {statuses[currentQuestion.id] === 'marked' ? 'Unmark' : 'Mark for Review'}
                </Button>
              </div>

              {/* Question Statement */}
              <Card className="arena-card">
                <CardContent className="p-6">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {currentQuestion.statement}
                  </p>
                </CardContent>
              </Card>

              {/* Answer Area */}
              <Card className="arena-card">
                <CardContent className="p-6">
                  {currentQuestion.type === 'mcq' ? (
                    <MCQPanel
                      config={currentQuestion.config_json}
                      value={answers[currentQuestion.id] || ''}
                      onChange={(v) => updateAnswer(currentQuestion.id, v)}
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        {currentQuestion.type === 'coding' ? 'Your Code' : currentQuestion.type === 'sql' ? 'Your SQL Query' : 'Your Fix'}
                      </label>
                      <textarea
                        className="w-full min-h-[300px] bg-secondary/50 border border-border rounded-lg p-4 font-mono text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                        placeholder={
                          currentQuestion.type === 'coding' ? 'Write your solution here...'
                          : currentQuestion.type === 'sql' ? 'Write your SQL query here...'
                          : 'Fix the code here...'
                        }
                        spellCheck={false}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(prev => prev - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentIdx + 1} of {questions.length}
                </span>
                <Button
                  variant="outline"
                  disabled={currentIdx === questions.length - 1}
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* MCQ sub-component */
function MCQPanel({
  config,
  value,
  onChange,
}: {
  config: Record<string, unknown>;
  value: string;
  onChange: (v: string) => void;
}) {
  const options = (config?.options as string[]) || [];
  const multiSelect = config?.multiSelect === true;
  const selected = value ? value.split(',') : [];

  const toggle = (idx: string) => {
    if (multiSelect) {
      const next = selected.includes(idx)
        ? selected.filter(s => s !== idx)
        : [...selected, idx];
      onChange(next.join(','));
    } else {
      onChange(idx);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-2">
        {multiSelect ? 'Select all that apply' : 'Select one answer'}
      </p>
      {options.map((option, idx) => {
        const idxStr = String(idx);
        const isSelected = selected.includes(idxStr);
        return (
          <button
            key={idx}
            onClick={() => toggle(idxStr)}
            className={`w-full text-left p-4 rounded-lg border transition-all ${
              isSelected
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50'
            }`}
          >
            <span className="font-mono text-xs mr-3 opacity-60">{String.fromCharCode(65 + idx)}.</span>
            {option}
          </button>
        );
      })}
    </div>
  );
}
