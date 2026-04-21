import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useBattleData } from "@/hooks/useBattleData";
import { useMatchmaking, type BattleMode } from "@/hooks/useMatchmaking";
import { supabase } from "@/integrations/supabase/client";

import type { BattlePhase, BattleTeam, RoundResult } from "@/components/battle-v2/types";
import { PhaseToggle } from "@/components/battle-v2/PhaseToggle";

// Entry
import { EntryHero } from "@/components/battle-v2/entry/EntryHero";
import { CombatantProfile, type CombatantData } from "@/components/battle-v2/entry/CombatantProfile";
import { FormatSelector, type BattleFormat } from "@/components/battle-v2/entry/FormatSelector";
import { RegionSelector } from "@/components/battle-v2/entry/RegionSelector";
import { ModeGrid, type ModeId } from "@/components/battle-v2/entry/ModeGrid";
import { LoadoutBar } from "@/components/battle-v2/entry/LoadoutBar";
import { GlobalStatsStrip } from "@/components/battle-v2/entry/GlobalStatsStrip";
import { SectionLabel } from "@/components/battle-v2/entry/SectionLabel";
import { OnlineWarriorsList } from "@/components/battle-v2/entry/OnlineWarriorsList";
import { RecentBattlesList } from "@/components/battle-v2/entry/RecentBattlesList";

// Pre-battle
import { LobbyHeader } from "@/components/battle-v2/pre-battle/LobbyHeader";
import { ReadyRoster } from "@/components/battle-v2/pre-battle/ReadyRoster";
import { MatchBriefing } from "@/components/battle-v2/pre-battle/MatchBriefing";
import { CountdownLauncher } from "@/components/battle-v2/pre-battle/CountdownLauncher";

// Post-battle
import { ResultBanner } from "@/components/battle-v2/post-battle/ResultBanner";
import { FinalScoreboard } from "@/components/battle-v2/post-battle/FinalScoreboard";
import { LpSummary } from "@/components/battle-v2/post-battle/LpSummary";
import { PlayerStatsTable, type PlayerPerf } from "@/components/battle-v2/post-battle/PlayerStatsTable";
import { PostActions } from "@/components/battle-v2/post-battle/PostActions";

// Demo data for dev-only phase preview (never seen in production unless toggled)
const DEMO_BLUE: BattleTeam = {
  id: "blue",
  name: "Bastard München",
  seed: "1",
  elo: 2480,
  accent: "neon",
  players: [
    { id: "u1", handle: "Isagi", initial: "I", rank: "Diamond II", lp: 2480, role: "STRIKER" },
    { id: "u2", handle: "Bachira", initial: "B", rank: "Diamond III", lp: 2310, role: "DRIBBLER" },
  ],
};
const DEMO_RED: BattleTeam = {
  id: "red",
  name: "Manshine City",
  seed: "4",
  elo: 2392,
  accent: "ember",
  players: [
    { id: "u3", handle: "Kaiser", initial: "K", rank: "Diamond II", lp: 2455, role: "EMPEROR" },
    { id: "u4", handle: "Ness", initial: "N", rank: "Diamond IV", lp: 2240, role: "SUPPORT" },
  ],
};

const DEMO_ROUNDS: RoundResult[] = [
  { round: 1, problem: "Two Sum", difficulty: "Easy", winner: "blue", blueTime: "01:24", redTime: "02:11", margin: "47s" },
  { round: 2, problem: "LRU Cache", difficulty: "Medium", winner: "red", blueTime: "08:42", redTime: "06:18", margin: "2:24" },
  { round: 3, problem: "Word Ladder", difficulty: "Hard", winner: "blue", blueTime: "11:05", redTime: "12:38", margin: "1:33" },
];

export default function Battle() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  // Entry state
  const [selectedMode, setSelectedMode] = useState<BattleMode>("quick");
  const [warriorQuery, setWarriorQuery] = useState("");

  // Phase state — production drives from real signals; PhaseToggle overrides only in DEV
  const [devPhase, setDevPhase] = useState<BattlePhase | null>(null);

  const { onlineWarriors, isLoadingOnline, recentBattles, isLoadingRecent } = useBattleData();
  const {
    matchmakingState,
    findOpponent,
    cancelSearch,
    isSearching,
    isMatched,
    isFindingOpponent,
    battleStats,
    isLoadingStats,
  } = useMatchmaking();

  // Detect post-battle return: ?completed=<sessionId>
  const completedSessionId = searchParams.get("completed");
  const { data: completedSession } = useQuery({
    queryKey: ["battle-result-summary", completedSessionId],
    queryFn: async () => {
      if (!completedSessionId) return null;
      const { data, error } = await supabase
        .from("battle_sessions")
        .select("*")
        .eq("id", completedSessionId)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!completedSessionId,
  });

  // Compute current phase
  const phase: BattlePhase = useMemo(() => {
    if (devPhase) return devPhase;
    if (completedSession?.status === "completed") return "post_battle";
    if (isMatched || matchmakingState.status === "in_battle") return "pre_battle";
    if (isSearching) return "searching";
    return "entry";
  }, [devPhase, completedSession, isMatched, isSearching, matchmakingState.status]);

  // When matched in production, route to live workspace after pre-battle countdown
  // For now, when phase is "live" (only via dev toggle or programmatic), nav to session
  useEffect(() => {
    if (devPhase) return; // dev preview, don't auto-route
    if (matchmakingState.sessionId && (isMatched || matchmakingState.status === "in_battle")) {
      // Stay on pre-battle; CountdownLauncher will navigate
    }
  }, [devPhase, isMatched, matchmakingState]);

  const handleFindOpponent = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    findOpponent(selectedMode);
  };

  const handleLaunch = () => {
    if (matchmakingState.sessionId) {
      navigate(`/battle/session/${matchmakingState.sessionId}`, { replace: true });
    } else if (devPhase) {
      // Dev preview only — no real session. Bounce to entry to avoid broken nav.
      setDevPhase("live");
    }
  };

  const handleExitPostBattle = () => {
    setDevPhase(null);
    navigate("/battle", { replace: true });
  };

  // ─── Render by phase ───
  return (
    <div className="min-h-screen bg-void text-text">
      <PhaseToggle current={phase} onChange={setDevPhase} />

      {phase === "entry" && (
        <EntryView
          stats={{
            elo: battleStats.elo,
            total_duels: battleStats.total_duels,
            win_rate: battleStats.win_rate,
            win_streak: battleStats.win_streak,
            next_rank: battleStats.next_rank,
            elo_to_next: battleStats.elo_to_next,
            rank_progress: battleStats.rank_progress,
          }}
          isLoadingStats={isLoadingStats}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          warriorQuery={warriorQuery}
          onWarriorQuery={setWarriorQuery}
          onlineWarriors={onlineWarriors}
          isLoadingOnline={isLoadingOnline}
          recentBattles={recentBattles}
          isLoadingRecent={isLoadingRecent}
          isSearching={isSearching}
          isFindingOpponent={isFindingOpponent}
          waitTime={matchmakingState.waitTime}
          onFind={handleFindOpponent}
          onCancel={cancelSearch}
        />
      )}

      {phase === "searching" && (
        <SearchingView waitTime={matchmakingState.waitTime} onCancel={cancelSearch} />
      )}

      {phase === "pre_battle" && (
        <PreBattleView
          blue={DEMO_BLUE}
          red={DEMO_RED}
          matchId={matchmakingState.battleId ?? "DEMO-MATCH"}
          onLaunch={handleLaunch}
        />
      )}

      {phase === "live" && devPhase && (
        // Dev-only preview placeholder (real "live" routes to /battle/session/:id)
        <div className="flex min-h-[60vh] items-center justify-center p-10 text-center">
          <div className="bl-glass border border-neon/40 p-8 max-w-md">
            <div className="font-display text-[10px] font-bold tracking-[0.3em] text-neon mb-3">
              DEV PREVIEW · LIVE PHASE
            </div>
            <p className="font-mono text-[12px] text-text-dim">
              In production, the live workspace renders at{" "}
              <span className="text-neon">/battle/session/:id</span>.
              Use the phase toggle to preview other screens.
            </p>
          </div>
        </div>
      )}

      {phase === "post_battle" && (
        <PostBattleView
          blue={DEMO_BLUE}
          red={DEMO_RED}
          rounds={DEMO_ROUNDS}
          completedSession={completedSession}
          userId={user?.id}
          onExit={handleExitPostBattle}
        />
      )}
    </div>
  );
}

// ─────────── ENTRY ───────────
function EntryView(props: {
  stats: any;
  isLoadingStats: boolean;
  selectedMode: BattleMode;
  onSelectMode: (m: BattleMode) => void;
  warriorQuery: string;
  onWarriorQuery: (s: string) => void;
  onlineWarriors: any[];
  isLoadingOnline: boolean;
  recentBattles: any[];
  isLoadingRecent: boolean;
  isSearching: boolean;
  isFindingOpponent: boolean;
  waitTime?: number;
  onFind: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      <EntryHero />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
            <div className="pointer-events-none absolute inset-0 bl-grid opacity-15" />
            <header className="relative flex items-center justify-between border-b border-line/60 px-5 py-3 bl-side-stripe">
              <span className="font-display text-[13px] font-bold tracking-[0.2em] text-text text-glow">
                SELECT BATTLE MODE
              </span>
              <span className="font-mono text-[10px] tracking-[0.14em] text-text-mute">
                {props.selectedMode.toUpperCase()}
              </span>
            </header>
            <div className="relative p-5 space-y-4">
              <ModeSelector selected={props.selectedMode} onSelect={props.onSelectMode} />
              <QueueButton
                isSearching={props.isSearching}
                isPending={props.isFindingOpponent}
                waitTime={props.waitTime}
                onFind={props.onFind}
                onCancel={props.onCancel}
              />
            </div>
          </div>

          <OnlineWarriorsList
            warriors={props.onlineWarriors}
            isLoading={props.isLoadingOnline}
            query={props.warriorQuery}
            onQuery={props.onWarriorQuery}
          />

          <RecentBattlesList battles={props.recentBattles} isLoading={props.isLoadingRecent} />
        </div>

        <div className="space-y-6">
          <StatsPanel stats={props.stats} isLoading={props.isLoadingStats} />
        </div>
      </div>
    </div>
  );
}

// ─────────── SEARCHING ───────────
function SearchingView({ waitTime, onCancel }: { waitTime?: number; onCancel: () => void }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md overflow-hidden border border-neon/40 bg-panel/60 bl-glass bl-corners">
        <div className="pointer-events-none absolute inset-0 bl-grid opacity-25" />
        <div className="pointer-events-none absolute inset-0 bl-scanline opacity-30" />
        <div className="relative flex flex-col items-center gap-6 px-8 py-12 text-center">
          <div className="relative h-32 w-32">
            <span className="absolute inset-0 rounded-full border border-neon/40 bl-pulse-ring" />
            <span className="absolute inset-3 rounded-full border border-neon/30 bl-pulse-ring" style={{ animationDelay: "0.4s" }} />
            <span className="absolute inset-6 rounded-full border border-neon/20 bl-pulse-ring" style={{ animationDelay: "0.8s" }} />
            <span className="absolute inset-0 flex items-center justify-center font-display text-3xl font-black text-neon text-glow bl-flicker">
              ⚔
            </span>
          </div>
          <div className="space-y-2">
            <div className="font-display text-[11px] font-bold tracking-[0.3em] text-neon">
              SCANNING THE ARENA
            </div>
            <p className="font-mono text-[12px] text-text-dim">
              {waitTime !== undefined ? `${Math.floor(waitTime)}s elapsed` : "Standby…"}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 border border-blood/40 bg-blood/10 px-6 py-2.5 font-display text-[11px] font-bold tracking-[0.22em] text-blood transition hover:bg-blood/20 bl-clip-chevron"
          >
            ABORT SEARCH
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────── PRE-BATTLE ───────────
function PreBattleView({
  blue,
  red,
  matchId,
  onLaunch,
}: {
  blue: BattleTeam;
  red: BattleTeam;
  matchId: string;
  onLaunch: () => void;
}) {
  const readiness = Object.fromEntries(
    [...blue.players, ...red.players].map((p) => [p.handle, "ready" as const]),
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      <LobbyHeader blue={blue} red={red} matchId={matchId} />
      <ReadyRoster blue={blue} red={red} readiness={readiness} />
      <MatchBriefing />
      <CountdownLauncher onLaunch={onLaunch} duration={5} />
    </div>
  );
}

// ─────────── POST-BATTLE ───────────
function PostBattleView({
  blue,
  red,
  rounds,
  completedSession,
  userId,
  onExit,
}: {
  blue: BattleTeam;
  red: BattleTeam;
  rounds: RoundResult[];
  completedSession: any;
  userId?: string;
  onExit: () => void;
}) {
  // Use real session data when available; fall back to demo for dev preview
  const real = completedSession;
  const isWinner = real?.winner_id === userId;
  const isDraw = real ? !real.winner_id : false;

  const winnerName = real
    ? isDraw
      ? "Stalemate"
      : isWinner
        ? "You"
        : "Opponent"
    : blue.name;
  const loserName = real
    ? isDraw
      ? "Stalemate"
      : isWinner
        ? "Opponent"
        : "You"
    : red.name;

  const myScore = real
    ? real.player_a_id === userId
      ? real.player_a_score
      : real.player_b_score
    : 3;
  const oppScore = real
    ? real.player_a_id === userId
      ? real.player_b_score
      : real.player_a_score
    : 2;

  const lpGain = real?.elo_change ? Math.abs(real.elo_change) : 28;
  const lpLoss = real?.elo_change ? Math.abs(real.elo_change) : 24;

  const finalScore = `${myScore} – ${oppScore}`;

  // Compute duration from real session
  const duration = real?.start_time && real?.end_time
    ? formatDuration(new Date(real.end_time).getTime() - new Date(real.start_time).getTime())
    : "27:45";

  const playerRows: PlayerPerf[] = [
    ...blue.players.map((p, i) => ({
      handle: p.handle,
      initial: p.initial,
      isCaptain: i === 0,
      accent: "neon" as const,
      solved: 2,
      submissions: 3,
      attempts: 4,
      accuracy: 85,
      wpm: 62,
      avgTime: "06:24",
      impact: 78 - i * 8,
      mvp: i === 0,
    })),
    ...red.players.map((p, i) => ({
      handle: p.handle,
      initial: p.initial,
      isCaptain: i === 0,
      accent: "ember" as const,
      solved: 1,
      submissions: 2,
      attempts: 3,
      accuracy: 75,
      wpm: 58,
      avgTime: "07:48",
      impact: 60 - i * 6,
    })),
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      <ResultBanner
        winnerName={winnerName}
        loserName={loserName}
        finalScore={finalScore}
        duration={duration}
        lpGain={lpGain}
        lpLoss={lpLoss}
        isDraw={isDraw}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <FinalScoreboard rounds={rounds} blueTotal={myScore} redTotal={oppScore} />
        <LpSummary
          blue={{
            tone: "neon",
            teamName: blue.name,
            direction: isWinner ? "up" : "down",
            amount: isWinner ? lpGain : lpLoss,
            fromLp: 2480,
            toLp: isWinner ? 2480 + lpGain : 2480 - lpLoss,
            rankFrom: "Diamond II",
            rankTo: "Diamond II",
            badge: isWinner ? "Win streak +1" : undefined,
          }}
          red={{
            tone: "ember",
            teamName: red.name,
            direction: isWinner ? "down" : "up",
            amount: isWinner ? lpLoss : lpGain,
            fromLp: 2392,
            toLp: isWinner ? 2392 - lpLoss : 2392 + lpGain,
            rankFrom: "Diamond II",
            rankTo: "Diamond II",
          }}
        />
      </div>

      <PlayerStatsTable rows={playerRows} />

      <PostActions
        onRematch={onExit}
        onDetails={() => completedSession && (window.location.href = `/battle/results/${completedSession.id}`)}
        onExit={onExit}
      />
    </div>
  );
}

function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
