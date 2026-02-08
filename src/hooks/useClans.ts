import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Clan {
  id: string;
  name: string;
  tag: string;
  description: string | null;
  motto: string | null;
  privacy: string;
  timezone: string;
  max_members: number;
  level: number;
  total_xp: number;
  weekly_xp: number;
  rank_tier: string;
  created_by: string;
  created_at: string;
  member_count?: number;
}

export interface ClanMember {
  id: string;
  clan_id: string;
  user_id: string;
  role: string;
  weekly_xp: number;
  total_xp: number;
  last_active_at: string;
  joined_at: string;
  username?: string;
  avatar_url?: string;
}

export interface ClanWar {
  id: string;
  week_start: string;
  clan_a: string;
  clan_b: string;
  score_a: number;
  score_b: number;
  result: string;
  created_at: string;
  clan_a_name?: string;
  clan_b_name?: string;
}

export interface ClanQuest {
  id: string;
  week_start: string;
  clan_id: string;
  quest_type: string;
  target: number;
  progress: number;
  reward_xp: number;
}

export interface ClanActivityItem {
  id: string;
  clan_id: string;
  type: string;
  message: string;
  meta: Record<string, unknown>;
  created_at: string;
}

// Fetch all clans (for browsing)
export function useAllClans() {
  return useQuery({
    queryKey: ['clans-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clans')
        .select('*')
        .order('weekly_xp', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Clan[];
    },
  });
}

// Fetch single clan by ID
export function useClanById(clanId: string | undefined) {
  return useQuery({
    queryKey: ['clan', clanId],
    queryFn: async () => {
      if (!clanId) return null;
      const { data, error } = await supabase
        .from('clans')
        .select('*')
        .eq('id', clanId)
        .single();
      if (error) throw error;
      return data as Clan;
    },
    enabled: !!clanId,
  });
}

// Fetch user's current clan membership
export function useMyMembership(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-clan-membership', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('clan_members_v2')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data as ClanMember | null;
    },
    enabled: !!userId,
  });
}

// Fetch clan members
export function useClanMembers(clanId: string | undefined) {
  return useQuery({
    queryKey: ['clan-members', clanId],
    queryFn: async () => {
      if (!clanId) return [];
      const { data, error } = await supabase
        .from('clan_members_v2')
        .select('*')
        .eq('clan_id', clanId)
        .order('total_xp', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClanMember[];
    },
    enabled: !!clanId,
  });
}

// Fetch clan wars
export function useClanWars(clanId: string | undefined) {
  return useQuery({
    queryKey: ['clan-wars', clanId],
    queryFn: async () => {
      if (!clanId) return [];
      const { data, error } = await supabase
        .from('clan_wars')
        .select('*')
        .or(`clan_a.eq.${clanId},clan_b.eq.${clanId}`)
        .order('week_start', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as ClanWar[];
    },
    enabled: !!clanId,
  });
}

// Fetch clan quests for current week
export function useClanQuests(clanId: string | undefined) {
  return useQuery({
    queryKey: ['clan-quests', clanId],
    queryFn: async () => {
      if (!clanId) return [];
      const { data, error } = await supabase
        .from('clan_quests')
        .select('*')
        .eq('clan_id', clanId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as ClanQuest[];
    },
    enabled: !!clanId,
  });
}

// Fetch clan activity log
export function useClanActivity(clanId: string | undefined) {
  return useQuery({
    queryKey: ['clan-activity', clanId],
    queryFn: async () => {
      if (!clanId) return [];
      const { data, error } = await supabase
        .from('clan_activity_log')
        .select('*')
        .eq('clan_id', clanId)
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as ClanActivityItem[];
    },
    enabled: !!clanId,
  });
}

// Fetch user's pending application for a clan
export function useMyApplication(clanId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['clan-application', clanId, userId],
    queryFn: async () => {
      if (!clanId || !userId) return null;
      const { data, error } = await supabase
        .from('clan_applications')
        .select('*')
        .eq('clan_id', clanId)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!clanId && !!userId,
  });
}

// Create Clan mutation
export function useCreateClan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      tag: string;
      description?: string;
      motto?: string;
      privacy: string;
      max_members: number;
    }) => {
      const { data, error } = await supabase.rpc('create_clan', {
        p_name: params.name,
        p_tag: params.tag,
        p_description: params.description ?? null,
        p_motto: params.motto ?? null,
        p_privacy: params.privacy,
        p_max_members: params.max_members,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string; clan_id?: string };
      if (!result.success) throw new Error(result.error || 'Failed to create clan');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clans-all'] });
      queryClient.invalidateQueries({ queryKey: ['my-clan-membership'] });
      toast.success('Clan created successfully!');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create clan');
    },
  });
}

// Apply to clan mutation
export function useApplyToClan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clanId: string) => {
      const { data, error } = await supabase.rpc('apply_to_clan', { p_clan_id: clanId });
      if (error) throw error;
      const result = data as { success: boolean; error?: string };
      if (!result.success) throw new Error(result.error || 'Failed to apply');
      return result;
    },
    onSuccess: (_, clanId) => {
      queryClient.invalidateQueries({ queryKey: ['clan-application', clanId] });
      toast.success('Application submitted!');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to apply');
    },
  });
}

// Leave clan mutation
export function useLeaveClanV2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('leave_clan_v2');
      if (error) throw error;
      const result = data as { success: boolean; error?: string };
      if (!result.success) throw new Error(result.error || 'Failed to leave clan');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-clan-membership'] });
      queryClient.invalidateQueries({ queryKey: ['clans-all'] });
      toast.success('You have left the clan');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to leave clan');
    },
  });
}

// Transfer leadership mutation
export function useTransferLeadership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newLeaderId: string) => {
      const { data, error } = await supabase.rpc('transfer_clan_leadership', {
        p_new_leader_id: newLeaderId,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string };
      if (!result.success) throw new Error(result.error || 'Failed to transfer leadership');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clan-members'] });
      queryClient.invalidateQueries({ queryKey: ['my-clan-membership'] });
      toast.success('Leadership transferred!');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to transfer leadership');
    },
  });
}

// Approve application mutation
export function useApproveApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { data, error } = await supabase.rpc('approve_clan_application', {
        p_application_id: applicationId,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string };
      if (!result.success) throw new Error(result.error || 'Failed to approve');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clan-members'] });
      queryClient.invalidateQueries({ queryKey: ['clan-application'] });
      toast.success('Application approved!');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to approve');
    },
  });
}
