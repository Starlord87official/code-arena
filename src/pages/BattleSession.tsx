import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Swords, Clock, Loader2, X, Crown, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BattleSession } from '@/hooks/useMatchmaking';
import { BattleProblemsPanel, BattleProblemItem, ProblemStatus } from '@/components/battle/BattleProblemsPanel';
import { BattleProblemStatement } from '@/components/battle/BattleProblemStatement';
import { BattleCodeEditor } from '@/components/battle/BattleCodeEditor';
import { BattleScoreboard } from '@/components/battle/BattleScoreboard';
import { toast } from 'sonner';

interface MatchProblem {
  id: string;
  challenge_id: string;
  order_index: number;
  points: number;
  challenge: {
    id: string;
    title: string;
    difficulty: string;
    problem_statement: string;
    constraints: string[];
    examples: Array<{ input: string; output: string; explanation?: string }>;
    tags: string[];
    xp_reward: number;
  };
}

interface BattleEvent {
  id: string;
  message: string;
  type: 'solve' | 'wrong' | 'info';
  timestamp: Date;
}

export default function BattleSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedProblemIdx, setSelectedProblemIdx] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [myProblemsSolved, setMyProblemsSolved] = useState(0);
  const [myWrongSubmissions, setMyWrongSubmissions] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentSolved, setOpponentSolved] = useState(0);
  const [opponentWrong, setOpponentWrong] = useState(0);
  const [problemStatuses, setProblemStatuses] = useState<Record<string, ProblemStatus>>({});
  const [events, setEvents] = useState<BattleEvent[]>([]);
  const [isEnding, setIsEnding] = useState(false);
  const endingRef = useRef(false);

  // Fetch battle session (legacy system)
  const { data: session, isLoading: sessionLoading, error: sessionError } = useQuery({
    queryKey: ['battle-session', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('No session ID');
      const { data, error } = await supabase
        .from('battle_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      if (error) throw error;
      return data as BattleSession;
    },
    enabled: !!sessionId && !!user,
    refetchInterval: (query) => {
      const data = query.state.data as BattleSession | undefined;
      if (data?.status === 'completed') return false;
      return 5000;
    },
  });

  // Side effect: navigate to results when session is completed
  useEffect(() => {
    if (session?.status === 'completed' && sessionId) {
      navigate(`/battle/results/${sessionId}`, { replace: true });
    }
  }, [session?.status, sessionId, navigate]);

  // Fetch opponent profile
  const opponentId = session?.player_a_id === user?.id ? session?.player_b_id : session?.player_a_id;
  const { data: opponentProfile } = useQuery({
    queryKey: ['profile', opponentId],
    queryFn: async () => {
      if (!opponentId) return null;
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, division, xp')
        .eq('id', opponentId)
        .single();
      return data;
    },
    enabled: !!opponentId,
  });

  // Load real problems from challenges table
  // For now, load 2 random active challenges for the battle
  const { data: matchProblems, isLoading: problemsLoading } = useQuery({
    queryKey: ['battle-problems', sessionId],
    queryFn: async () => {
      // Try to get problems from battle_match_problems first (V2 system)
      const { data: v2Problems } = await supabase
        .from('battle_match_problems')
        .select('id, challenge_id, order_index, points, challenges(id, title, difficulty, problem_statement, constraints, examples, tags, xp_reward)')
        .eq('match_id', sessionId || '')
        .order('order_index');

      if (v2Problems && v2Problems.length > 0) {
        return v2Problems.map((p: any) => ({
          id: p.id,
          challenge_id: p.challenge_id,
          order_index: p.order_index,
          points: p.points,
          challenge: p.challenges,
        })) as MatchProblem[];
      }

      // Fallback: load 2 challenges from the pool based on session mode
      const difficulties = session?.mode === 'ranked'
        ? ['easy', 'medium', 'hard']
        : ['easy', 'medium'];

      const { data: challenges, error } = await supabase
        .from('challenges')
        .select('id, title, difficulty, problem_statement, constraints, examples, tags, xp_reward')
        .in('difficulty', difficulties)
        .eq('is_active', true)
        .limit(session?.mode === 'ranked' ? 3 : 2);

      if (error || !challenges || challenges.length === 0) {
        return [];
      }

      return challenges.map((c: any, idx: number) => ({
        id: c.id,
        challenge_id: c.id,
        order_index: idx,
        points: c.difficulty === 'easy' ? 100 : c.difficulty === 'medium' ? 200 : 350,
        challenge: c,
      })) as MatchProblem[];
    },
    enabled: !!sessionId && !!session,
  });

  // Timer logic
  useEffect(() => {
    if (!session || session.status !== 'active') return;
    const startTime = new Date(session.start_time).getTime();
    const durationMs = session.duration_minutes * 60 * 1000;
    const endTime = startTime + durationMs;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeRemaining(remaining);
      if (remaining === 0 && !endingRef.current) {
        handleEndBattle();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session]);

  // Realtime subscription for opponent actions
  useEffect(() => {
    if (!sessionId || !user) return;

    const channel = supabase
      .channel(`battle-${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'battle_match_submissions',
        filter: `match_id=eq.${sessionId}`,
      }, (payload: any) => {
        const sub = payload.new;
        if (!sub || sub.user_id === user.id) return;

        if (sub.status === 'accepted') {
          setOpponentScore(prev => prev + (sub.score || 0));
          setOpponentSolved(prev => prev + 1);
          addEvent(`Opponent solved a problem! +${sub.score} pts`, 'solve');
        } else if (sub.status === 'wrong_answer' || sub.status === 'rejected') {
          setOpponentWrong(prev => prev + 1);
          addEvent('Opponent made a wrong submission', 'wrong');
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, user]);

  const addEvent = (message: string, type: 'solve' | 'wrong' | 'info') => {
    setEvents(prev => [{
      id: crypto.randomUUID(),
      message,
      type,
      timestamp: new Date(),
    }, ...prev].slice(0, 20));
  };

  // Handle code submission
  const handleSubmit = useCallback(async (code: string, language: string) => {
    if (!session || !user || !matchProblems) return;

    const problem = matchProblems[selectedProblemIdx];
    if (!problem) return;

    // Try to insert into V2 submissions (will fail silently if no V2 match)
    const { error } = await supabase
      .from('battle_match_submissions')
      .insert({
        match_id: session.id,
        problem_id: problem.id,
        user_id: user.id,
        code,
        language,
        status: 'pending',
        score: 0,
        testcases_passed: 0,
        testcases_total: 0,
      });

    if (error) {
      // V2 insert failed (likely no V2 match context), fall back to local scoring
      console.log('V2 submission skipped, using local scoring');
    }

    // Update local state
    const timeBonus = Math.floor(timeRemaining / 60) * 2;
    const totalPoints = problem.points + timeBonus;

    setMyScore(prev => prev + totalPoints);
    setMyProblemsSolved(prev => prev + 1);
    setProblemStatuses(prev => ({ ...prev, [problem.id]: 'solved' }));
    addEvent(`You solved ${problem.challenge.title}! +${totalPoints} pts (${timeBonus} time bonus)`, 'solve');
    toast.success(`+${totalPoints} points! (${problem.points} + ${timeBonus} time bonus)`);

    // Check if all problems solved
    const newSolvedCount = myProblemsSolved + 1;
    if (newSolvedCount >= matchProblems.length) {
      addEvent('All problems solved! Ending battle…', 'info');
      setTimeout(() => handleEndBattle(), 1500);
    }
  }, [session, user, matchProblems, selectedProblemIdx, timeRemaining, myProblemsSolved]);

  // Handle wrong submission
  const handleWrongSubmission = useCallback(() => {
    setMyWrongSubmissions(prev => prev + 1);
    setMyScore(prev => Math.max(0, prev - 10));
    const problem = matchProblems?.[selectedProblemIdx];
    if (problem) {
      setProblemStatuses(prev => {
        if (prev[problem.id] === 'solved') return prev;
        return { ...prev, [problem.id]: 'wrong' };
      });
    }
    addEvent('Wrong submission -10 pts', 'wrong');
  }, [matchProblems, selectedProblemIdx]);

  // End battle
  const handleEndBattle = useCallback(async () => {
    if (!session || !user || endingRef.current) return;
    endingRef.current = true;
    setIsEnding(true);

    try {
      const { data, error } = await supabase.rpc('complete_duo_battle', {
        p_session_id: session.id,
      });

      if (error) throw error;

      const result = data as unknown as {
        success: boolean; winner_id?: string; is_draw: boolean;
        elo_change: number; xp_awarded: number; error?: string;
      };

      if (result.success) {
        queryClient.removeQueries({ queryKey: ['battle-session', sessionId] });
        queryClient.removeQueries({ queryKey: ['battle-problems', sessionId] });
        queryClient.removeQueries({ queryKey: ['active-battle-session'] });
        queryClient.invalidateQueries({ queryKey: ['user-battle-stats'] });
        if (result.is_draw) {
          toast.info(`Draw! +${result.xp_awarded} XP`);
        } else if (result.winner_id === user.id) {
          toast.success(`Victory! +${result.xp_awarded} XP`);
        } else {
          toast.error(`Defeat. +${result.xp_awarded} XP`);
        }
        // Navigate to the dedicated results page
        navigate(`/battle/results/${session.id}`, { replace: true });
      } else {
        toast.error(result.error || 'Failed to end battle');
        endingRef.current = false;
        setIsEnding(false);
      }
    } catch (err) {
      console.error('Error ending battle:', err);
      toast.error('Failed to end battle');
      endingRef.current = false;
      setIsEnding(false);
    }
  }, [session, user, queryClient, navigate]);

  // Format time
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Build problem items for panel
  const problemItems: BattleProblemItem[] = (matchProblems || []).map(p => ({
    id: p.id,
    matchProblemId: p.id,
    title: p.challenge.title,
    difficulty: p.challenge.difficulty,
    points: p.points,
    status: problemStatuses[p.id] || 'unseen',
  }));

  const selectedProblem = matchProblems?.[selectedProblemIdx];

  // ─── Loading ───
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  // ─── Error / Not found ───
  if (sessionError || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Battle Not Found</h2>
          <p className="text-muted-foreground mb-4">This battle session doesn't exist or has ended.</p>
          <Button variant="default" onClick={() => navigate('/battle')}>Return to Battle Lobby</Button>
        </div>
      </div>
    );
  }

  // ─── Completed → redirect to results route (side effect, not in render) ───
  if (session.status === 'completed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  // ─── Active Battle: 3-Column Arena ───
  const isTimeCritical = timeRemaining < 60;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Swords className="h-5 w-5 text-destructive" />
          <span className="font-display text-sm font-bold text-foreground tracking-wide">
            BATTLE <span className="text-destructive">ACTIVE</span>
          </span>
          <Badge variant="outline" className="text-[10px] uppercase">
            {session.mode} match
          </Badge>
        </div>

        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg ${
          isTimeCritical ? 'bg-destructive/20 border border-destructive/50' : 'bg-secondary/50 border border-border'
        }`}>
          <Clock className={`h-4 w-4 ${isTimeCritical ? 'text-destructive animate-pulse' : 'text-primary'}`} />
          <span className={`font-mono text-lg font-bold ${isTimeCritical ? 'text-destructive' : 'text-foreground'}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            vs <span className="text-accent font-semibold">{opponentProfile?.username || 'Opponent'}</span>
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="h-7 text-xs"
            onClick={handleEndBattle}
            disabled={isEnding}
          >
            {isEnding ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <X className="h-3 w-3 mr-1" />}
            End Battle
          </Button>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT: Problem List */}
        <div className="w-52 border-r border-border bg-card/50 shrink-0">
          <BattleProblemsPanel
            problems={problemItems}
            selectedIndex={selectedProblemIdx}
            onSelect={setSelectedProblemIdx}
            isLoading={problemsLoading}
          />
        </div>

        {/* CENTER: Problem Statement */}
        <div className="w-[380px] border-r border-border bg-card/30 shrink-0">
          <BattleProblemStatement
            title={selectedProblem?.challenge.title || ''}
            difficulty={selectedProblem?.challenge.difficulty || ''}
            problemStatement={selectedProblem?.challenge.problem_statement || ''}
            constraints={selectedProblem?.challenge.constraints || []}
            examples={(selectedProblem?.challenge.examples as any[]) || []}
            tags={selectedProblem?.challenge.tags || []}
            points={selectedProblem?.points || 0}
            isLoading={problemsLoading}
          />
        </div>

        {/* RIGHT: Code Editor + Scoreboard */}
        <div className="flex-1 flex min-w-0">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col border-r border-border min-w-0">
            <BattleCodeEditor
              problemExamples={(selectedProblem?.challenge.examples as any[]) || []}
              onSubmit={handleSubmit}
              isSubmitting={isEnding}
              disabled={isEnding || problemStatuses[selectedProblem?.id || ''] === 'solved'}
            />
          </div>

          {/* Scoreboard */}
          <div className="w-56 bg-card/50 shrink-0">
            <BattleScoreboard
              matchId={session.id}
              myUserId={user?.id || ''}
              myScore={{
                userId: user?.id || '',
                username: 'You',
                score: myScore,
                problemsSolved: myProblemsSolved,
                wrongSubmissions: myWrongSubmissions,
                lastSolveTime: null,
              }}
              opponentScore={{
                userId: opponentId || '',
                username: opponentProfile?.username || 'Opponent',
                score: opponentScore,
                problemsSolved: opponentSolved,
                wrongSubmissions: opponentWrong,
                lastSolveTime: null,
              }}
              events={events}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
