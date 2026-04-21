import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBattleEntryData } from "@/hooks/useBattleEntryData";
import { useBattleResult } from "@/hooks/useBattleResult";
import { useMatchmaking, type BattleMode } from "@/hooks/useMatchmaking";

import type { BattlePhase } from "@/components/battle-v2/types";

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

// Post-battle
import { ResultBanner } from "@/components/battle-v2/post-battle/ResultBanner";
import { FinalScoreboard } from "@/components/battle-v2/post-battle/FinalScoreboard";
import { LpSummary } from "@/components/battle-v2/post-battle/LpSummary";
import { PlayerStatsTable } from "@/components/battle-v2/post-battle/PlayerStatsTable";
import { PostActions } from "@/components/battle-v2/post-battle/PostActions";

export default function Battle() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [selectedMode, setSelectedMode] = useState<ModeId>("ranked");
  const [selectedFormat, setSelectedFormat] = useState<BattleFormat>("duo");
  const [selectedRegion, setSelectedRegion] = useState<string>("AP-S");
  const [warriorQuery, setWarriorQuery] = useState("");
  const [devPhase, setDevPhase] = useState<BattlePhase | null>(null);

  const entryData = useBattleEntryData();
  const {
    matchmakingState,
    findOpponent,
    cancelSearch,
    isSearching,
    isMatched,
    isFindingOpponent,
  } = useMatchmaking();

  const completedMatchId = searchParams.get("completed");
  const { data: result } = useBattleResult(completedMatchId, !!completedMatchId);

  const phase: BattlePhase = useMemo(() => {
    if (devPhase) return devPhase;
    if (completedMatchId && result) return "post_battle";
    if (isMatched || matchmakingState.status === "in_battle") return "pre_battle";
    if (isSearching) return "searching";
    return "entry";
  }, [devPhase, completedMatchId, result, isMatched, isSearching, matchmakingState.status]);

  const handleFindOpponent = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    const mode: BattleMode = selectedMode === "practice" ? "quick" : selectedMode;
    findOpponent(mode);
  };

  const handleExitPostBattle = () => {
    setDevPhase(null);
    navigate("/battle", { replace: true });
  };

  const handleRematch = () => {
    setDevPhase(null);
    navigate("/battle", { replace: true });
    const mode: BattleMode = selectedMode === "practice" ? "quick" : selectedMode;
    setTimeout(() => findOpponent(mode), 100);
  };

  const summary = entryData.summary;
  const combatant: CombatantData | undefined = user
    ? {
        pid: (user.id ?? "0000").slice(0, 4).toUpperCase(),
        username:
          (user.user_metadata?.username as string) ??
          user.email?.split("@")[0] ??
          "warrior",
        initial: (
          (user.user_metadata?.username as string) ??
          user.email ??
          "W"
        )
          .slice(0, 1)
          .toUpperCase(),
        level: Math.max(1, Math.floor((summary?.elo ?? 1000) / 100)),
        rank: summary?.rank_label ?? "Bronze",
        topPercent: undefined,
        lpCurrent: summary?.elo ?? 1000,
        lpTarget: (summary?.elo ?? 1000) + 200,
        nextRank: summary?.rank_label ?? "Bronze",
        isCaptain: selectedFormat === "duo",
        wins: summary?.wins ?? 0,
        losses: summary?.losses ?? 0,
        winRate: summary?.win_rate ?? 0,
        streak: summary?.current_streak ?? 0,
        mvps: summary?.mvp_count ?? 0,
        dailyDone: 0,
        dailyTotal: 3,
        dailyLabel: "Win 3 Ranked duels",
        form: [],
        recent: [],
      }
    : undefined;

  const modeMeta = useMemo(() => {
    switch (selectedMode) {
      case "quick":
        return { label: "QUICK MATCH", accent: "neon" as const, stakes: "No LP" };
      case "ranked":
        return { label: "RANKED DUO", accent: "ember" as const, stakes: "±24 LP" };
      case "custom":
        return { label: "CUSTOM BATTLE", accent: "gold" as const, stakes: "Configurable" };
      case "practice":
      default:
        return { label: "PRACTICE ARENA", accent: "neon" as const, stakes: "Training" };
    }
  }, [selectedMode]);

  // Auto-redirect to live session route when matched
  useEffect(() => {
    if ((isMatched || matchmakingState.status === "in_battle") && matchmakingState.sessionId) {
      navigate(`/battle/session/${matchmakingState.sessionId}`, { replace: true });
    }
  }, [isMatched, matchmakingState, navigate]);

  return (
    <div className="min-h-screen bg-void text-text">
      {phase === "entry" && (
        <EntryView
          combatant={combatant}
          isLoadingStats={entryData.isLoadingSummary}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          selectedFormat={selectedFormat}
          onSelectFormat={setSelectedFormat}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          warriorQuery={warriorQuery}
          onWarriorQuery={setWarriorQuery}
          entryData={entryData}
          isSearching={isSearching}
          isFindingOpponent={isFindingOpponent}
          waitTime={matchmakingState.waitTime}
          onFind={handleFindOpponent}
          onCancel={cancelSearch}
          modeLabel={modeMeta.label}
          modeAccent={modeMeta.accent}
          stakesLabel={modeMeta.stakes}
          phase={phase}
          onPhaseChange={setDevPhase}
        />
      )}

      {phase === "searching" && (
        <SearchingView waitTime={matchmakingState.waitTime} onCancel={cancelSearch} />
      )}

      {phase === "pre_battle" && (
        <div className="flex min-h-[60vh] items-center justify-center p-10 text-center">
          <div className="bl-glass border border-neon/40 p-8 max-w-md">
            <div className="font-display text-[10px] font-bold tracking-[0.3em] text-neon mb-3">
              MATCH FOUND · ENTERING ARENA
            </div>
            <p className="font-mono text-[12px] text-text-dim">
              Routing to live workspace…
            </p>
          </div>
        </div>
      )}

      {phase === "post_battle" && result && (
        <PostBattleView result={result} userId={user?.id} onExit={handleExitPostBattle} onRematch={handleRematch} />
      )}

    </div>
  );
}

// ─────────── ENTRY ───────────
function EntryView(props: {
  combatant?: CombatantData;
  isLoadingStats: boolean;
  selectedMode: ModeId;
  onSelectMode: (m: ModeId) => void;
  selectedFormat: BattleFormat;
  onSelectFormat: (f: BattleFormat) => void;
  selectedRegion: string;
  onSelectRegion: (r: string) => void;
  warriorQuery: string;
  onWarriorQuery: (s: string) => void;
  entryData: ReturnType<typeof useBattleEntryData>;
  isSearching: boolean;
  isFindingOpponent: boolean;
  waitTime?: number;
  onFind: () => void;
  onCancel: () => void;
  modeLabel: string;
  modeAccent: "neon" | "ember" | "gold";
  stakesLabel: string;
  phase: BattlePhase;
  onPhaseChange: (p: BattlePhase) => void;
}) {
  const formatLabel = props.selectedFormat === "duo" ? "2 V 2" : "1 V 1";
  const { entryData } = props;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 space-y-6">
      <div className="flex flex-col gap-1">
        <div className="font-mono text-[10px] tracking-[0.22em] text-text-mute">
          SECTOR <span className="text-neon">// 007_ENTRY</span>
        </div>
        <h1 className="font-display text-[28px] md:text-[34px] font-black tracking-tight text-text">
          Battle Entry
        </h1>
      </div>

      <EntryHero />

      <SectionLabel step="01" subtitle="CONFIGURE YOUR LOADOUT" title="Profile, format, region." />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
        <CombatantProfile data={props.combatant} isLoading={props.isLoadingStats} />
        <FormatSelector selected={props.selectedFormat} onSelect={props.onSelectFormat} />
        <RegionSelector regions={[]} selected={props.selectedRegion} onSelect={props.onSelectRegion} />
      </div>

      <SectionLabel
        step="02"
        subtitle="SELECT BATTLE MODE"
        title="Choose your war."
        rightSlot={
          <span className="font-mono text-[10px] tracking-[0.22em] text-text-mute">
            4 MODES · <span className="text-ember">1 RANKED</span>
          </span>
        }
      />
      <ModeGrid selected={props.selectedMode} onSelect={props.onSelectMode} />

      <LoadoutBar
        modeLabel={props.modeLabel}
        modeAccent={props.modeAccent}
        formatLabel={formatLabel}
        regionCode={props.selectedRegion}
        stakesLabel={props.stakesLabel}
        isSearching={props.isSearching}
        isPending={props.isFindingOpponent}
        waitTime={props.waitTime}
        onFind={props.onFind}
        onCancel={props.onCancel}
      />

      <GlobalStatsStrip
        stats={entryData.global}
        avgQueue={props.waitTime ? `${Math.floor(props.waitTime)}s` : "—"}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <OnlineWarriorsList
          warriors={entryData.online}
          isLoading={entryData.isLoadingOnline}
          query={props.warriorQuery}
          onQuery={props.onWarriorQuery}
        />
        <RecentBattlesList
          battles={entryData.recent}
          isLoading={entryData.isLoadingRecent}
        />
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

// ─────────── POST-BATTLE ───────────
function PostBattleView({
  result,
  userId,
  onExit,
  onRematch,
}: {
  result: NonNullable<ReturnType<typeof useBattleResult>["data"]>;
  userId?: string;
  onExit: () => void;
  onRematch: () => void;
}) {
  const me = result.players.find((p) => p.user_id === userId);
  const opp = result.players.find((p) => p.user_id !== userId);

  const outcome: "win" | "loss" | "draw" =
    result.is_draw ? "draw"
    : result.winner_id && result.winner_id === userId ? "win"
    : result.winner_id ? "loss"
    : "draw";

  const callerName = me?.handle ?? "You";
  const opponentName = opp?.handle ?? "Opponent";
  const finalScore = `${me?.score ?? 0} – ${opp?.score ?? 0}`;
  const duration = formatDuration(result.duration_sec * 1000);
  const lpDelta = me?.elo_change ?? 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      <ResultBanner
        outcome={outcome}
        callerName={callerName}
        opponentName={opponentName}
        finalScore={finalScore}
        duration={duration}
        lpDelta={lpDelta}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <FinalScoreboard rounds={result.rounds} players={result.players} callerId={userId} />
        <LpSummary players={result.players} callerId={userId} />
      </div>

      <PlayerStatsTable players={result.players} callerId={userId} />

      <PostActions
        onRematch={onRematch}
        onDetails={onExit}
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
