import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type MentorExpertise = 'dsa' | 'cp' | 'web' | 'system_design';
export type InviteStatus = 'pending' | 'accepted' | 'expired';

// Safe interface - no raw email or token exposed
// Safe interface - no raw email or token exposed (token removed from view entirely)
export interface MentorInviteSafe {
  id: string;
  email_masked: string | null; // Only first 2 chars + domain hint (e.g., "jo***@gmail.com")
  name: string | null;
  expertise: MentorExpertise | null;
  invited_by: string;
  clan_id: string | null;
  status: InviteStatus;
  accepted_by: string | null;
  created_at: string;
  accepted_at: string | null;
}

// For invite acceptance via token (used by RPC)
export interface InviteInfo {
  id: string;
  status: InviteStatus;
  clan_id: string | null;
  expertise: MentorExpertise | null;
  name: string | null;
  created_at: string;
}

// Response from creating an invite (includes token for sharing)
// This is safe because only the creator sees this
export interface CreateInviteResponse {
  id: string;
  token: string;
  email: string;
  name: string | null;
  expertise: MentorExpertise | null;
  clan_id: string | null;
  status: InviteStatus;
  created_at: string;
}

// Generate a secure random token
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Fetch invites created by the current user (using safe view)
export function useMentorInvites() {
  return useQuery({
    queryKey: ['mentor-invites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_invites_safe')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MentorInviteSafe[];
    },
  });
}

// Fetch invite status by token using secure RPC (no email/token exposure)
export function useInviteByToken(token: string | null) {
  return useQuery({
    queryKey: ['mentor-invite', token],
    queryFn: async () => {
      if (!token) return null;
      
      // Use secure RPC instead of direct table access
      const { data, error } = await supabase
        .rpc('get_invite_status_by_token', { p_token: token });

      if (error) throw error;
      
      const result = data as unknown as { success: boolean; error?: string; invite?: InviteInfo };
      
      if (!result.success) {
        return null;
      }
      
      return result.invite as InviteInfo | null;
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
      // Return type includes token for sharing (safe - only creator sees this)
      return data as unknown as CreateInviteResponse;
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
