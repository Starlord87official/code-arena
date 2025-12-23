import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BattleHistoryRecord } from './useBattleHistory';

export interface ClanBattleStats {
  totalBattles: number;
  wins: number;
  losses: number;
  ties: number;
  winRate: number;
  totalXpGained: number;
  totalXpLost: number;
  netXp: number;
  avgScore: number;
  bestStreak: number;
  recentForm: ('W' | 'L' | 'D')[];
}

export function useClanBattleStats(clanId: string) {
  return useQuery({
    queryKey: ['clan-battle-stats', clanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_history')
        .select('*')
        .or(`clan_a_id.eq.${clanId},clan_b_id.eq.${clanId}`)
        .order('ended_at', { ascending: false });

      if (error) throw error;

      const battles = data as BattleHistoryRecord[];
      
      if (battles.length === 0) {
        return {
          totalBattles: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          winRate: 0,
          totalXpGained: 0,
          totalXpLost: 0,
          netXp: 0,
          avgScore: 0,
          bestStreak: 0,
          recentForm: [],
        } as ClanBattleStats;
      }

      let wins = 0;
      let losses = 0;
      let ties = 0;
      let totalXpGained = 0;
      let totalXpLost = 0;
      let totalScore = 0;
      let currentStreak = 0;
      let bestStreak = 0;
      const recentForm: ('W' | 'L' | 'D')[] = [];

      battles.forEach((battle, index) => {
        const isClanA = battle.clan_a_id === clanId;
        const isWin = (isClanA && battle.winner === 'A') || (!isClanA && battle.winner === 'B');
        const isLoss = (isClanA && battle.winner === 'B') || (!isClanA && battle.winner === 'A');
        const score = isClanA ? battle.clan_a_score : battle.clan_b_score;

        totalScore += score;

        if (isWin) {
          wins++;
          totalXpGained += Math.abs(battle.xp_change);
          currentStreak++;
          bestStreak = Math.max(bestStreak, currentStreak);
          if (index < 5) recentForm.push('W');
        } else if (isLoss) {
          losses++;
          totalXpLost += Math.abs(battle.xp_change);
          currentStreak = 0;
          if (index < 5) recentForm.push('L');
        } else {
          ties++;
          currentStreak = 0;
          if (index < 5) recentForm.push('D');
        }
      });

      const totalBattles = battles.length;
      const winRate = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;
      const avgScore = totalBattles > 0 ? Math.round(totalScore / totalBattles) : 0;

      return {
        totalBattles,
        wins,
        losses,
        ties,
        winRate,
        totalXpGained,
        totalXpLost,
        netXp: totalXpGained - totalXpLost,
        avgScore,
        bestStreak,
        recentForm,
      } as ClanBattleStats;
    },
    enabled: !!clanId,
  });
}
