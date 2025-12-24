import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppRole } from './useClanRoles';

export interface UserRoleInfo {
  id: string;
  user_id: string;
  clan_id: string;
  role: AppRole;
  created_at: string;
}

// Fetch user's primary role (checks if they have mentor role anywhere)
export function useUserRole(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Get all roles for this user
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      // Return the roles array
      return data as UserRoleInfo[];
    },
    enabled: !!userId,
  });
}

// Check if user is a mentor in any clan
export function useIsMentorAnywhere(userId: string | undefined) {
  const { data: roles, isLoading } = useUserRole(userId);
  
  const isMentor = roles?.some(r => r.role === 'mentor') ?? false;
  
  return {
    isMentor,
    isLoading,
    roles,
  };
}
