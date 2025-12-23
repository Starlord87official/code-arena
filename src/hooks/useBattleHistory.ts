import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ClanBattle, BattleContributor } from '@/lib/battleData';

export interface BattleHistoryRecord {
  id: string;
  battle_id: string;
  clan_a_id: string;
  clan_a_name: string;
  clan_a_score: number;
  clan_b_id: string;
  clan_b_name: string;
  clan_b_score: number;
  winner: 'A' | 'B' | 'tie' | null;
  mvp_username: string | null;
  mvp_xp: number | null;
  started_at: string;
  ended_at: string;
  xp_change: number;
  elo_change: number;
  problems_solved_a: number;
  problems_solved_b: number;
  total_problems: number;
  created_at: string;
}

// Fetch battle history for a specific clan
export function useClanBattleHistory(clanId: string) {
  return useQuery({
    queryKey: ['battle-history', 'clan', clanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_history')
        .select('*')
        .or(`clan_a_id.eq.${clanId},clan_b_id.eq.${clanId}`)
        .order('ended_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as BattleHistoryRecord[];
    },
    enabled: !!clanId,
  });
}

// Fetch all battle history
export function useAllBattleHistory() {
  return useQuery({
    queryKey: ['battle-history', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_history')
        .select('*')
        .order('ended_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as BattleHistoryRecord[];
    },
  });
}

// Fetch a specific battle by ID
export function useBattleById(battleId: string) {
  return useQuery({
    queryKey: ['battle-history', 'single', battleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_history')
        .select('*')
        .eq('battle_id', battleId)
        .maybeSingle();

      if (error) throw error;
      return data as BattleHistoryRecord | null;
    },
    enabled: !!battleId,
  });
}

// Save battle to history
export function useSaveBattle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      battle,
      contributorsA,
      contributorsB,
      xpChange,
      eloChange,
    }: {
      battle: ClanBattle;
      contributorsA: BattleContributor[];
      contributorsB: BattleContributor[];
      xpChange: number;
      eloChange: number;
    }) => {
      // Find MVP
      const allContributors = [...contributorsA, ...contributorsB];
      const mvp = allContributors.sort((a, b) => b.xpGained - a.xpGained)[0];

      // Calculate problems solved
      const problemsSolvedA = battle.problems.filter(p => 
        p.status === 'solved-a' || p.status === 'solved-both'
      ).length;
      const problemsSolvedB = battle.problems.filter(p => 
        p.status === 'solved-b' || p.status === 'solved-both'
      ).length;

      const { data, error } = await supabase
        .from('battle_history')
        .insert({
          battle_id: battle.id,
          clan_a_id: battle.clanA.id,
          clan_a_name: battle.clanA.name,
          clan_a_score: battle.clanA.battleScore,
          clan_b_id: battle.clanB.id,
          clan_b_name: battle.clanB.name,
          clan_b_score: battle.clanB.battleScore,
          winner: battle.winner || null,
          mvp_username: mvp?.username || null,
          mvp_xp: mvp?.xpGained || null,
          started_at: battle.startTime.toISOString(),
          ended_at: battle.endTime.toISOString(),
          xp_change: xpChange,
          elo_change: eloChange,
          problems_solved_a: problemsSolvedA,
          problems_solved_b: problemsSolvedB,
          total_problems: battle.problems.length,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['battle-history'] });
      console.log('Battle saved to history');
    },
    onError: (error) => {
      console.error('Failed to save battle:', error);
      toast.error('Failed to save battle to history');
    },
  });
}
