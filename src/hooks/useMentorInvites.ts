import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type MentorExpertise = 'dsa' | 'cp' | 'web' | 'system_design';
export type InviteStatus = 'pending' | 'accepted' | 'expired';

export interface MentorInvite {
  id: string;
  email: string;
  name: string | null;
  expertise: MentorExpertise | null;
  token: string;
  invited_by: string;
  clan_id: string | null;
  status: InviteStatus;
  accepted_by: string | null;
  created_at: string;
  accepted_at: string | null;
}

// Generate a secure random token
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Fetch invites created by the current user
export function useMentorInvites() {
  return useQuery({
    queryKey: ['mentor-invites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MentorInvite[];
    },
  });
}

// Fetch a single invite by token
export function useInviteByToken(token: string | null) {
  return useQuery({
    queryKey: ['mentor-invite', token],
    queryFn: async () => {
      if (!token) return null;
      
      const { data, error } = await supabase
        .from('mentor_invites')
        .select('*')
        .eq('token', token)
        .maybeSingle();

      if (error) throw error;
      return data as MentorInvite | null;
    },
    enabled: !!token,
  });
}

// Create a new mentor invite
export function useCreateMentorInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      name,
      expertise,
      clanId,
    }: {
      email: string;
      name?: string;
      expertise?: MentorExpertise;
      clanId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create invites');
      }

      const token = generateSecureToken();
      
      const { data, error } = await supabase
        .from('mentor_invites')
        .insert({
          email,
          name: name || null,
          expertise: expertise || null,
          token,
          invited_by: user.id,
          clan_id: clanId || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data as MentorInvite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-invites'] });
      toast.success('Invite created successfully');
    },
    onError: (error) => {
      console.error('Failed to create invite:', error);
      toast.error('Failed to create invite');
    },
  });
}

// Accept a mentor invite
export function useAcceptMentorInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { data, error } = await supabase
        .rpc('accept_mentor_invite', { invite_token: token });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; clan_id?: string; message?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to accept invite');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-invites'] });
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      queryClient.invalidateQueries({ queryKey: ['clan-roles'] });
      toast.success('You are now a mentor!');
    },
    onError: (error) => {
      console.error('Failed to accept invite:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to accept invite');
    },
  });
}
