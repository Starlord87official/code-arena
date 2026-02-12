import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { PartnerGoal, PartnerFocus, PartnerPace, CommStyle, AccountabilityStyle, Language, ReliabilityTier } from '@/lib/partnerData';
import { getReliabilityTier } from '@/lib/partnerData';

// Fetch current user's training card
export function useMyTrainingCard() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['lockin-my-training-card', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('lockin_training_cards')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Fetch all available training cards (for browse matches)
export function useTrainingCards() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['lockin-training-cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lockin_training_cards')
        .select('*')
        .neq('user_id', user?.id ?? '');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

// Fetch a specific training card by user_id
export function useTrainingCardByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ['lockin-training-card', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('lockin_training_cards')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// Fetch partner stats for a user
export function usePartnerStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['lockin-partner-stats', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('lockin_partner_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// Fetch partner stats + training card + profile for match browsing
export function useMatchCandidates() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['lockin-match-candidates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get all training cards except current user's
      const { data: cards, error: cardsError } = await supabase
        .from('lockin_training_cards')
        .select('*')
        .neq('user_id', user.id);
      if (cardsError) throw cardsError;
      if (!cards || cards.length === 0) return [];

      // Get partner stats for those users
      const userIds = cards.map(c => c.user_id);
      const { data: stats } = await supabase
        .from('lockin_partner_stats')
        .select('*')
        .in('user_id', userIds);

      // Get public profiles
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('*')
        .in('id', userIds);

      return cards.map(card => {
        const stat = stats?.find(s => s.user_id === card.user_id);
        const profile = profiles?.find(p => p.id === card.user_id);
        const reliabilityScore = stat?.reliability_score ?? 0;
        return {
          id: card.id,
          partnerId: card.user_id,
          username: profile?.username ?? 'Unknown',
          avatarUrl: profile?.avatar_url,
          reliabilityScore,
          reliabilityTier: getReliabilityTier(reliabilityScore) as ReliabilityTier,
          disciplineScore: stat?.discipline_score ?? 0,
          completedContracts: stat?.completed_contracts ?? 0,
          totalContracts: stat?.total_contracts ?? 0,
          currentStreak: stat?.current_streak ?? 0,
          card,
        };
      });
    },
    enabled: !!user,
  });
}

// Create/upsert training card
export function useCreateTrainingCard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cardData: {
      goal: PartnerGoal;
      focus: PartnerFocus;
      solvedCount: number;
      internalRating: number;
      contestRating: string;
      dailyCommitment: 30 | 60 | 90;
      preferredSlots: string[];
      language: Language;
      pace: PartnerPace;
      commStyle: CommStyle;
      accountabilityStyle: AccountabilityStyle;
      noGhostingRule: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('lockin_training_cards')
        .upsert({
          user_id: user.id,
          goal: cardData.goal,
          focus: cardData.focus,
          solved_count: cardData.solvedCount,
          internal_rating: cardData.internalRating,
          contest_rating: cardData.contestRating || null,
          daily_commitment: cardData.dailyCommitment,
          preferred_slots: cardData.preferredSlots,
          language: cardData.language,
          pace: cardData.pace,
          comm_style: cardData.commStyle,
          accountability_style: cardData.accountabilityStyle,
          no_ghosting_rule: cardData.noGhostingRule,
        }, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw error;

      // Also ensure partner stats exist
      await supabase
        .from('lockin_partner_stats')
        .upsert({ user_id: user.id }, { onConflict: 'user_id' });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lockin-my-training-card'] });
      queryClient.invalidateQueries({ queryKey: ['lockin-training-cards'] });
      queryClient.invalidateQueries({ queryKey: ['lockin-match-candidates'] });
    },
  });
}

// Send partner invite
export function useSendPartnerInvite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (receiverId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('lockin_partner_requests')
        .insert({ sender_id: user.id, receiver_id: receiverId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lockin-partner-requests'] });
    },
  });
}

// Fetch active contract for current user
export function useActiveContract() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['lockin-active-contract', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('lockin_contracts')
        .select('*')
        .or(`partner_a_id.eq.${user.id},partner_b_id.eq.${user.id}`)
        .eq('status', 'active')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Fetch contract missions for a contract
export function useContractMissions(contractId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['lockin-contract-missions', contractId, user?.id],
    queryFn: async () => {
      if (!contractId || !user) return [];
      const { data, error } = await supabase
        .from('lockin_contract_missions')
        .select('*')
        .eq('contract_id', contractId)
        .eq('user_id', user.id)
        .eq('mission_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!contractId && !!user,
  });
}

// Update mission status
export function useUpdateMissionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ missionId, status }: { missionId: string; status: string }) => {
      const { error } = await supabase
        .from('lockin_contract_missions')
        .update({
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', missionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lockin-contract-missions'] });
    },
  });
}

// Fetch trials for a contract
export function useContractTrials(contractId: string | undefined) {
  return useQuery({
    queryKey: ['lockin-trials', contractId],
    queryFn: async () => {
      if (!contractId) return [];
      const { data, error } = await supabase
        .from('lockin_trials')
        .select('*')
        .eq('contract_id', contractId)
        .order('scheduled_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!contractId,
  });
}

// Fetch trial report
export function useTrialReport(trialId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['lockin-trial-report', trialId],
    queryFn: async () => {
      if (!trialId || !user) return null;
      const { data, error } = await supabase
        .from('lockin_trial_reports')
        .select('*')
        .eq('trial_id', trialId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!trialId && !!user,
  });
}
