import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface BattleParticipantRow {
  id: string;
  match_id: string;
  user_id: string;
  score: number;
  problems_solved: number;
  is_forfeit: boolean;
  disconnected_at: string | null;
  reconnected_at: string | null;
}

export interface BattleMatchRow {
  id: string;
  state: string;
  status: string;
  winner_id: string | null;
  is_draw: boolean | null;
  ended_at: string | null;
}

export interface BattleSubmissionRow {
  id: string;
  match_id: string;
  user_id: string;
  problem_id: string;
  verdict: string;
  status: string;
  score: number;
  testcases_passed: number | null;
  testcases_total: number | null;
  submitted_at: string;
}

interface UseBattleRealtimeReturn {
  match: BattleMatchRow | null;
  participants: BattleParticipantRow[];
  latestSubmission: BattleSubmissionRow | null;
  isConnected: boolean;
}

export function useBattleRealtime(matchId: string | undefined): UseBattleRealtimeReturn {
  const [match, setMatch] = useState<BattleMatchRow | null>(null);
  const [participants, setParticipants] = useState<BattleParticipantRow[]>([]);
  const [latestSubmission, setLatestSubmission] = useState<BattleSubmissionRow | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const backoffRef = useRef(1000);

  useEffect(() => {
    if (!matchId) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const setup = async () => {
      // Initial fetch
      const [m, p] = await Promise.all([
        supabase.from("battle_matches").select("id, state, status, winner_id, is_draw, ended_at").eq("id", matchId).maybeSingle(),
        supabase.from("battle_participants").select("id, match_id, user_id, score, problems_solved, is_forfeit, disconnected_at, reconnected_at").eq("match_id", matchId),
      ]);
      if (cancelled) return;
      if (m.data) setMatch(m.data as BattleMatchRow);
      if (p.data) setParticipants(p.data as BattleParticipantRow[]);

      const channel = supabase
        .channel(`battle-rt-${matchId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "battle_matches", filter: `id=eq.${matchId}` }, (payload: any) => {
          if (payload.new) setMatch(payload.new as BattleMatchRow);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "battle_participants", filter: `match_id=eq.${matchId}` }, (payload: any) => {
          const row = payload.new as BattleParticipantRow;
          if (!row) return;
          setParticipants((prev) => {
            const idx = prev.findIndex((x) => x.user_id === row.user_id);
            if (idx === -1) return [...prev, row];
            const copy = prev.slice();
            copy[idx] = row;
            return copy;
          });
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "battle_match_submissions", filter: `match_id=eq.${matchId}` }, (payload: any) => {
          if (payload.new) setLatestSubmission(payload.new as BattleSubmissionRow);
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "battle_match_submissions", filter: `match_id=eq.${matchId}` }, (payload: any) => {
          if (payload.new) setLatestSubmission(payload.new as BattleSubmissionRow);
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsConnected(true);
            backoffRef.current = 1000;
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setIsConnected(false);
            if (!cancelled) {
              const delay = Math.min(backoffRef.current, 15000);
              backoffRef.current = Math.min(delay * 2, 15000);
              retryTimer = setTimeout(() => {
                if (channelRef.current) supabase.removeChannel(channelRef.current);
                setup();
              }, delay);
            }
          }
        });

      channelRef.current = channel;
    };

    setup();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [matchId]);

  return { match, participants, latestSubmission, isConnected };
}
