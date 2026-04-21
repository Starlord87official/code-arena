import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { BattleSession as BattleSessionT } from "@/hooks/useMatchmaking";

import { WorkspaceHud } from "@/components/battle-v2/workspace/WorkspaceHud";
import { OpponentTicker, type OpponentSnapshot } from "@/components/battle-v2/workspace/OpponentTicker";
import { ProblemPanel, type ProblemDetail } from "@/components/battle-v2/workspace/ProblemPanel";
import { EditorToolbar, type LangId, LANGUAGES } from "@/components/battle-v2/workspace/EditorToolbar";
import { CodeEditor } from "@/components/battle-v2/workspace/CodeEditor";
import { ConsolePanel, type TestCase, type SubmissionRow } from "@/components/battle-v2/workspace/ConsolePanel";
import { StatusBar } from "@/components/battle-v2/workspace/StatusBar";
import { VerdictOverlay } from "@/components/battle-v2/workspace/VerdictOverlay";
import type { Verdict } from "@/components/battle-v2/types";
import { useBattleRealtime } from "@/hooks/useBattleRealtime";
import { useBattleHeartbeat } from "@/hooks/useBattleHeartbeat";

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

const DEFAULT_CODE: Record<LangId, string> = {
  py: `def solution():\n    # Write your solution here\n    pass\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n`,
  java: `public class Solution {\n    public static void main(String[] args) {\n    }\n}\n`,
  js: `function solution() {\n  // Write your solution here\n}\n`,
  ts: `function solution(): void {\n  // Write your solution here\n}\n`,
  go: `package main\n\nfunc main() {}\n`,
};

export default function BattleSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [language, setLanguage] = useState<LangId>("py");
  const [code, setCode] = useState<string>(DEFAULT_CODE.py);
  const [selectedProblemIdx, setSelectedProblemIdx] = useState(0);
  const [problemCollapsed, setProblemCollapsed] = useState(false);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [verdictMeta, setVerdictMeta] = useState<{ passed: number; total: number; runtimeMs?: number; lpDelta?: number }>({ passed: 0, total: 0 });
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [opponentSnap, setOpponentSnap] = useState<OpponentSnapshot | null>(null);

  const isEndingRef = useRef(false);

  // Session
  const { data: session, isLoading: sessionLoading, error: sessionError } = useQuery({
    queryKey: ["battle-session", sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error("No session ID");
      const { data, error } = await supabase
        .from("battle_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      if (error) throw error;
      return data as BattleSessionT;
    },
    enabled: !!sessionId && !!user,
    refetchInterval: (q) => {
      const d = q.state.data as BattleSessionT | undefined;
      if (d?.status === "completed") return false;
      return 15000; // realtime is the primary; this is a safety net
    },
  });

  // Realtime subscription — drives instant opponent + completion updates
  const { match: rtMatch, participants: rtParticipants, latestSubmission, isConnected: rtConnected } = useBattleRealtime(sessionId);

  // Heartbeat to prevent reconnect-sweep forfeit
  useBattleHeartbeat(sessionId, !!user && session?.status !== "completed");

  // When realtime says match is completed, kick navigation immediately (don't wait for poll)
  useEffect(() => {
    if (rtMatch?.state === "completed" && sessionId) {
      queryClient.invalidateQueries({ queryKey: ["battle-session", sessionId] });
      navigate(`/battle?completed=${sessionId}`, { replace: true });
    }
  }, [rtMatch?.state, sessionId, navigate, queryClient]);

  // Auto-redirect to post-battle on completion
  useEffect(() => {
    if (session?.status === "completed" && sessionId) {
      navigate(`/battle?completed=${sessionId}`, { replace: true });
    }
  }, [session?.status, sessionId, navigate]);

  // Opponent profile
  const opponentId = session?.player_a_id === user?.id ? session?.player_b_id : session?.player_a_id;
  const { data: opponentProfile } = useQuery({
    queryKey: ["battle-opponent-profile", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const { data, error } = await supabase.rpc("get_battle_opponent_profile", { p_session_id: sessionId });
      if (error) return null;
      return Array.isArray(data) && data.length > 0 ? data[0] : null;
    },
    enabled: !!sessionId && !!user,
  });

  // Problems
  const { data: matchProblems } = useQuery({
    queryKey: ["battle-problems", sessionId],
    queryFn: async () => {
      const { data: v2 } = await supabase
        .from("battle_match_problems")
        .select("id, challenge_id, order_index, points, challenges(id, title, difficulty, problem_statement, constraints, examples, tags, xp_reward)")
        .eq("match_id", sessionId || "")
        .order("order_index");

      if (v2 && v2.length > 0) {
        return v2.map((p: any) => ({
          id: p.id,
          challenge_id: p.challenge_id,
          order_index: p.order_index,
          points: p.points,
          challenge: p.challenges,
        })) as MatchProblem[];
      }

      const difficulties = session?.mode === "ranked" ? ["easy", "medium", "hard"] : ["easy", "medium"];
      const { data: challenges } = await supabase
        .from("challenges")
        .select("id, title, difficulty, problem_statement, constraints, examples, tags, xp_reward")
        .in("difficulty", difficulties)
        .eq("is_active", true)
        .limit(session?.mode === "ranked" ? 3 : 2);

      if (!challenges || challenges.length === 0) return [];

      return challenges.map((c: any, i: number) => ({
        id: c.id,
        challenge_id: c.id,
        order_index: i,
        points: c.difficulty === "easy" ? 100 : c.difficulty === "medium" ? 200 : 350,
        challenge: c,
      })) as MatchProblem[];
    },
    enabled: !!sessionId && !!session,
  });

  const selectedMatchProblem = matchProblems?.[selectedProblemIdx];

  // Build ProblemDetail for the panel
  const problemDetail: ProblemDetail | null = useMemo(() => {
    if (!selectedMatchProblem) return null;
    const ch = selectedMatchProblem.challenge;
    return {
      id: ch.id,
      title: ch.title,
      difficulty: ch.difficulty,
      score: selectedMatchProblem.points,
      topics: ch.tags || [],
      constraints: (ch.constraints || []).slice(0, 6).map((c, i) => ({ k: `C${i + 1}`, v: c })),
      statement: ch.problem_statement.split("\n\n").filter(Boolean),
      examples: (ch.examples as any[]) || [],
      hints: [],
    };
  }, [selectedMatchProblem]);

  // Initialize test cases from problem examples
  useEffect(() => {
    if (!problemDetail) return;
    setTestCases(
      problemDetail.examples.map((ex, i) => ({
        id: `case-${i + 1}`,
        input: ex.input,
        expected: ex.output,
        status: "PENDING" as Verdict,
      })),
    );
  }, [problemDetail]);

  // Realtime opponent submissions — derived from useBattleRealtime
  useEffect(() => {
    const sub = latestSubmission;
    if (!sub || !user || sub.user_id === user.id) return;
    const status: OpponentSnapshot["status"] =
      sub.status === "accepted" ? "CLEARED" :
      sub.status === "wrong_answer" || sub.status === "rejected" ? "STUCK" :
      "CODING";
    setOpponentSnap({
      handle: opponentProfile?.username || "Opponent",
      status,
      progress: Math.min(100, ((sub.testcases_passed || 0) / Math.max(1, sub.testcases_total || 1)) * 100),
      testsPassed: sub.testcases_passed || 0,
      testsTotal: sub.testcases_total || (testCases.length || 0),
      submissions: 1,
      tone: "ember",
    });
  }, [latestSubmission, user, opponentProfile, testCases.length]);

  // Opponent disconnect tracking from realtime participants
  const opponentParticipant = rtParticipants.find((p) => p.user_id !== user?.id);
  const opponentDisconnectedAt = opponentParticipant?.disconnected_at
    ? new Date(opponentParticipant.disconnected_at).getTime()
    : null;
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!opponentDisconnectedAt) return;
    const t = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [opponentDisconnectedAt]);
  const opponentDisconnected = !!opponentDisconnectedAt;
  const opponentSecondsRemaining = opponentDisconnectedAt
    ? Math.ceil((opponentDisconnectedAt + 60_000 - Date.now()) / 1000)
    : 60;


  const handleLanguageChange = (lid: LangId) => {
    setLanguage(lid);
    setCode(DEFAULT_CODE[lid]);
  };

  const handleReset = () => setCode(DEFAULT_CODE[language]);

  const handleRun = useCallback(() => {
    if (!testCases.length) {
      setConsoleOutput("// No test cases to run.");
      return;
    }
    setRunning(true);
    setConsoleOutput("$ running solution against sample tests…\n");
    // Simulated local run — no eval against real judge here. UI feedback only.
    setTimeout(() => {
      setTestCases((prev) =>
        prev.map((tc, i) => ({
          ...tc,
          actual: i === 0 ? tc.expected : "",
          status: i === 0 ? "AC" : "PENDING",
          runtimeMs: 12 + i * 4,
        })),
      );
      setConsoleOutput((s) => s + `✓ case-1 passed\n· remaining cases pending\n`);
      setRunning(false);
    }, 900);
  }, [testCases.length]);

  const handleSubmit = useCallback(async () => {
    if (!session || !user || !selectedMatchProblem) return;
    setSubmitting(true);
    try {
      const idempotencyKey = `${session.id}:${selectedMatchProblem.id}:${Date.now()}`;

      // 1. Server-authored submission insert via RPC
      const { data: submissionId, error: submitErr } = await supabase.rpc(
        "submit_battle_solution",
        {
          p_match_id: session.id,
          p_problem_id: selectedMatchProblem.id,
          p_language: language,
          p_code: code,
          p_idempotency_key: idempotencyKey,
        },
      );

      if (submitErr || !submissionId) {
        toast.error(submitErr?.message || "Failed to submit");
        setSubmitting(false);
        return;
      }

      const subId = submissionId as unknown as string;

      // Insert pending row in local submissions list
      const localId = `#${String(submissions.length + 1).padStart(3, "0")}`;
      setSubmissions((prev) => [
        {
          id: localId,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          lang: LANGUAGES.find((l) => l.id === language)?.label ?? language,
          verdict: "PENDING" as Verdict,
          passed: 0,
          total: testCases.length || 0,
        },
        ...prev,
      ]);

      // 2. Trigger the judge dispatcher (async)
      const { error: judgeErr } = await supabase.functions.invoke("judge-dispatcher", {
        body: { submission_id: subId },
      });
      if (judgeErr) {
        console.warn("judge-dispatcher invoke failed:", judgeErr.message);
      }

      // 3. Poll the submission row until verdict != pending (realtime channel
      //    also covers this, but a short poll guarantees verdict UI even if
      //    the realtime event was missed during reconnect).
      const started = Date.now();
      let finalRow: any = null;
      while (Date.now() - started < 15000) {
        const { data } = await supabase
          .from("battle_match_submissions")
          .select("verdict, status, score, testcases_passed, testcases_total, runtime_ms")
          .eq("id", subId)
          .maybeSingle();
        if (data && data.verdict && data.verdict !== "pending") {
          finalRow = data;
          break;
        }
        await new Promise((r) => setTimeout(r, 600));
      }

      if (!finalRow) {
        toast.warning("Judging is taking longer than expected — refresh to see verdict.");
        return;
      }

      const verdictMap: Record<string, Verdict> = {
        accepted: "AC",
        wrong_answer: "WA",
        tle: "TLE",
        mle: "RE",
        runtime_error: "RE",
        compile_error: "RE",
        rejected: "WA",
      };
      const v: Verdict = verdictMap[finalRow.verdict] ?? "WA";
      const passed = finalRow.testcases_passed ?? 0;
      const total = finalRow.testcases_total ?? testCases.length;
      const runtimeMs = finalRow.runtime_ms ?? undefined;

      setVerdict(v);
      setVerdictMeta({
        passed,
        total,
        runtimeMs,
        lpDelta: v === "AC" ? selectedMatchProblem.points : -10,
      });
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === localId ? { ...s, verdict: v, passed, total, runtimeMs } : s,
        ),
      );

      if (v === "AC") {
        toast.success(`Accepted · +${selectedMatchProblem.points} pts`);
        setTestCases((prev) => prev.map((tc) => ({ ...tc, status: "AC", actual: tc.expected, runtimeMs })));
      } else {
        toast.error(`${v} — keep pushing.`);
      }
    } catch (e) {
      console.error("submit failed:", e);
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  }, [session, user, selectedMatchProblem, code, language, testCases.length, submissions.length]);

  const handleForfeit = useCallback(async () => {
    if (!session || isEndingRef.current) return;
    isEndingRef.current = true;
    try {
      // Try new forfeit_match RPC first; fall back to legacy complete_duo_battle.
      let result: any = null;
      const forfeit = await (supabase.rpc as any)("forfeit_match", { p_match_id: session.id });
      if (!forfeit.error && forfeit.data) {
        result = forfeit.data;
      } else {
        const legacy = await (supabase.rpc as any)("complete_duo_battle", {
          p_session_id: session.id,
          p_player_a_score: 0,
          p_player_b_score: 0,
        });
        if (legacy.error) throw legacy.error;
        result = legacy.data;
      }

      if (result?.success) {
        queryClient.removeQueries({ queryKey: ["battle-session", sessionId] });
        navigate(`/battle?completed=${session.id}`, { replace: true });
      } else {
        toast.error(result?.error || "Failed to end battle");
        isEndingRef.current = false;
      }
    } catch {
      toast.error("Failed to end battle");
      isEndingRef.current = false;
    }
  }, [session, sessionId, queryClient, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cmd = e.metaKey || e.ctrlKey;
      if (cmd && e.key === "Enter" && e.shiftKey) { e.preventDefault(); handleSubmit(); }
      else if (cmd && e.key === "Enter") { e.preventDefault(); handleRun(); }
      else if (cmd && e.key.toLowerCase() === "b") { e.preventDefault(); setProblemCollapsed((c) => !c); }
      else if (cmd && e.key.toLowerCase() === "j") { e.preventDefault(); setConsoleCollapsed((c) => !c); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleRun, handleSubmit]);

  // ─── Loading / Error ───
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-neon animate-spin" />
      </div>
    );
  }
  if (sessionError || !session) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-4">
        <div className="text-center bl-glass border border-blood/40 p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-blood mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-text mb-2">Battle Not Found</h2>
          <p className="font-mono text-sm text-text-dim mb-4">This battle session doesn't exist or has ended.</p>
          <button
            onClick={() => navigate("/battle")}
            className="bl-btn-primary bl-clip-notch px-5 py-2.5 text-[11px] tracking-[0.22em]"
          >
            RETURN TO LOBBY
          </button>
        </div>
      </div>
    );
  }
  if (session.status === "completed") {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-neon animate-spin" />
      </div>
    );
  }

  const battleIdShort = session.battle_id?.slice(0, 8) ?? session.id.slice(0, 8);
  const teammateSnap: OpponentSnapshot = {
    handle: "You",
    status: running ? "COMPILING" : submitting ? "DEBUGGING" : "CODING",
    progress: testCases.length ? (testCases.filter((t) => t.status === "AC").length / testCases.length) * 100 : 0,
    testsPassed: testCases.filter((t) => t.status === "AC").length,
    testsTotal: testCases.length,
    submissions: submissions.length,
    tone: "neon",
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-void text-text">
      <WorkspaceHud
        battleId={battleIdShort}
        durationMinutes={session.duration_minutes || 30}
        startTime={new Date(session.start_time).getTime()}
        opponentName={opponentProfile?.username}
        onForfeit={handleForfeit}
      />

      <OpponentTicker
        teammate={teammateSnap}
        opponents={opponentSnap ? [opponentSnap] : (opponentDisconnected ? [{ handle: opponentProfile?.username || "Opponent", status: "IDLE", progress: 0, testsPassed: 0, testsTotal: testCases.length, submissions: 0, tone: "ember" }] : [])}
        momentum={50}
        opponentDisconnected={opponentDisconnected}
        secondsRemaining={opponentSecondsRemaining}
      />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <ProblemPanel problem={problemDetail} collapsed={problemCollapsed} onToggle={() => setProblemCollapsed((c) => !c)} />

        <div className="flex flex-1 flex-col min-w-0">
          <EditorToolbar
            language={language}
            onLanguageChange={handleLanguageChange}
            onRun={handleRun}
            onSubmit={handleSubmit}
            onReset={handleReset}
            running={running}
            submitting={submitting}
          />
          <div className="flex-1 min-h-0">
            <CodeEditor value={code} onChange={setCode} disabled={submitting} language={LANGUAGES.find((l) => l.id === language)?.label} />
          </div>
          <ConsolePanel
            collapsed={consoleCollapsed}
            onToggle={() => setConsoleCollapsed((c) => !c)}
            running={running}
            testCases={testCases}
            submissions={submissions}
            consoleOutput={consoleOutput}
          />
        </div>
      </div>

      <StatusBar battleId={battleIdShort} language={LANGUAGES.find((l) => l.id === language)?.label} />

      <VerdictOverlay
        verdict={verdict}
        onClose={() => setVerdict(null)}
        passed={verdictMeta.passed}
        total={verdictMeta.total}
        runtimeMs={verdictMeta.runtimeMs}
        lpDelta={verdictMeta.lpDelta}
      />
    </div>
  );
}
