import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Crown, Trophy, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/bl/PageHeader";
import { RankBadge } from "@/components/rank/RankBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import type { RankTier, RankDivision } from "@/hooks/useRankState";

interface LadderRow {
  rank_position: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  tier: RankTier;
  division: RankDivision;
  lp: number;
  mmr: number;
  games_played: number;
  win_streak: number;
  is_self?: boolean;
}

const TIER_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "challenger", label: "Challenger" },
  { value: "grandmaster", label: "GM" },
  { value: "master", label: "Master" },
  { value: "diamond", label: "Diamond" },
  { value: "platinum", label: "Platinum" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "bronze", label: "Bronze" },
  { value: "iron", label: "Iron" },
];

const PAGE_SIZE = 25;

export default function RankedLeaderboard() {
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["ranked-leaderboard", tierFilter, page],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_ranked_leaderboard", {
        p_tier_filter: tierFilter === "all" ? null : tierFilter,
        p_limit: PAGE_SIZE,
        p_offset: page * PAGE_SIZE,
      });
      if (error) throw error;
      return (data ?? []) as LadderRow[];
    },
  });

  const { data: myRow } = useQuery({
    queryKey: ["ranked-leaderboard-self", tierFilter],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_my_ranked_position", {
        p_tier_filter: tierFilter === "all" ? null : tierFilter,
      });
      if (error) throw error;
      const arr = (data ?? []) as LadderRow[];
      return arr[0] ?? null;
    },
  });

  const top3 = (rows ?? []).slice(0, page === 0 ? 3 : 0);
  const tableRows = (rows ?? []).slice(page === 0 ? 3 : 0);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <PageHeader
        title="Ranked Ladder"
        subtitle="Top warriors of the active season — sorted by tier, division, and LP."
        icon={Trophy}
      />

      {/* Tier filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TIER_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setTierFilter(f.value);
              setPage(0);
            }}
            className={cn(
              "border px-3 py-1.5 font-display text-[10px] font-bold tracking-[0.18em] uppercase transition-all bl-clip-chevron",
              tierFilter === f.value
                ? "border-neon bg-neon/15 text-neon"
                : "border-line/60 bg-panel/40 text-text-mute hover:text-text",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {isLoading ? (
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : top3.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {top3.map((r) => (
            <PodiumCard key={r.user_id} row={r} />
          ))}
        </div>
      ) : null}

      {/* Table */}
      <div className="mt-6 border border-line bg-panel/40 bl-glass">
        <div className="grid grid-cols-[60px_1fr_120px_80px_80px_80px] items-center border-b border-line/60 px-4 py-2 font-display text-[9.5px] font-bold tracking-[0.22em] text-text-mute">
          <span>RANK</span>
          <span>WARRIOR</span>
          <span className="text-center">TIER</span>
          <span className="text-right">LP</span>
          <span className="text-right">MMR</span>
          <span className="text-right">GAMES</span>
        </div>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : tableRows.length === 0 && top3.length === 0 ? (
          <div className="p-12 text-center font-mono text-[12px] text-text-mute">
            // no ranked players yet — finish your placements to appear here
          </div>
        ) : (
          <ul>
            {tableRows.map((r) => (
              <LadderRowItem key={r.user_id} row={r} />
            ))}
          </ul>
        )}

        {/* Sticky self row */}
        {myRow && !rows?.some((r) => r.is_self) && (
          <div className="sticky bottom-0 border-t-2 border-neon/40 bg-neon/5">
            <LadderRowItem row={{ ...myRow, is_self: true }} />
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="border border-line/60 px-3 py-1.5 font-display text-[10px] font-bold tracking-[0.18em] disabled:opacity-30"
        >
          ← PREV
        </button>
        <span className="font-mono text-[11px] text-text-mute">PAGE {page + 1}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={(rows?.length ?? 0) < PAGE_SIZE}
          className="border border-line/60 px-3 py-1.5 font-display text-[10px] font-bold tracking-[0.18em] disabled:opacity-30"
        >
          NEXT →
        </button>
      </div>
    </div>
  );
}

function PodiumCard({ row }: { row: LadderRow }) {
  const isFirst = row.rank_position === 1;
  return (
    <Link
      to={`/profile/${row.username}`}
      className={cn(
        "relative flex items-center gap-4 border bg-panel/60 p-4 transition-all hover:scale-[1.01] bl-corners",
        isFirst ? "border-gold/60 shadow-[0_0_24px_rgba(251,191,36,0.25)]" : "border-line/60",
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center">
        {isFirst ? (
          <Crown className="h-10 w-10 text-gold drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
        ) : (
          <span className="font-display text-[28px] font-black text-text-mute">
            #{row.rank_position}
          </span>
        )}
      </div>
      <Avatar className="h-12 w-12 border border-line">
        <AvatarImage src={row.avatar_url ?? undefined} />
        <AvatarFallback>{row.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[14px] font-bold text-text">{row.username}</div>
        <div className="mt-1">
          <RankBadge tier={row.tier} division={row.division} lp={row.lp} size="sm" />
        </div>
      </div>
    </Link>
  );
}

function LadderRowItem({ row }: { row: LadderRow }) {
  return (
    <li
      className={cn(
        "grid grid-cols-[60px_1fr_120px_80px_80px_80px] items-center border-b border-line/30 px-4 py-3 last:border-0 hover:bg-void/40",
        row.is_self && "bg-neon/5",
      )}
    >
      <span className="font-display text-[14px] font-bold tabular-nums text-text">
        #{row.rank_position}
      </span>
      <Link to={`/profile/${row.username}`} className="flex items-center gap-3 min-w-0">
        <Avatar className="h-7 w-7">
          <AvatarImage src={row.avatar_url ?? undefined} />
          <AvatarFallback className="text-[10px]">{row.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="truncate font-display text-[12px] font-bold text-text hover:text-neon">
          {row.username}
          {row.is_self && <span className="ml-2 text-[9px] tracking-[0.2em] text-neon">YOU</span>}
        </span>
      </Link>
      <div className="flex justify-center">
        <RankBadge tier={row.tier} division={row.division} size="sm" showLp={false} />
      </div>
      <span className="text-right font-mono text-[12px] font-bold tabular-nums text-text">{row.lp}</span>
      <span className="text-right font-mono text-[11px] tabular-nums text-text-mute">{row.mmr}</span>
      <span className="text-right font-mono text-[11px] tabular-nums text-text-mute">{row.games_played}</span>
    </li>
  );
}
