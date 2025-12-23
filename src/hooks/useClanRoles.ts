import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AppRole = 'mentor' | 'student';

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

// Assign role to user
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      clanId,
      role,
    }: {
      userId: string;
      clanId: string;
      role: AppRole;
    }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          clan_id: clanId,
          role,
        }, {
          onConflict: 'user_id,clan_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-role', variables.userId, variables.clanId] });
      queryClient.invalidateQueries({ queryKey: ['clan-roles', variables.clanId] });
      toast.success('Role assigned successfully');
    },
    onError: (error) => {
      console.error('Failed to assign role:', error);
      toast.error('Failed to assign role');
    },
  });
}
