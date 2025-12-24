import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppRole } from './useUserRole';

export type { AppRole };

export interface UserRole {
  id: string;
  user_id: string;
  clan_id: string;
  role: AppRole;
  created_at: string;
}

// Fetch user role for a specific clan
export function useUserClanRole(userId: string | undefined, clanId: string) {
  return useQuery({
    queryKey: ['user-role', userId, clanId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('clan_id', clanId)
        .maybeSingle();

      if (error) throw error;
      return data as UserRole | null;
    },
    enabled: !!userId && !!clanId,
  });
}

// Fetch all roles for a clan
export function useClanRoles(clanId: string) {
  return useQuery({
    queryKey: ['clan-roles', clanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('clan_id', clanId);

      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!clanId,
  });
}

// Check if user is mentor
export function useIsMentor(userId: string | undefined, clanId: string) {
  const { data: role, isLoading } = useUserClanRole(userId, clanId);
  return {
    isMentor: role?.role === 'mentor',
    isLoading,
  };
}
// NOTE: Direct role assignment has been removed for security.
// Mentor role can ONLY be assigned via accept_mentor_invite() database function.
// This ensures mentor role is invite-only.
