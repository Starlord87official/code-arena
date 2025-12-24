import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'mentor' | 'student';

export interface UserRoleInfo {
  id: string;
  user_id: string;
  clan_id: string;
  role: AppRole;
  created_at: string;
}

// Fetch all roles for a user
export function useUserRole(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      return data as UserRoleInfo[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// Central hook to check mentor status - single source of truth
export function useIsMentorAnywhere(userId: string | undefined) {
  const { data: roles, isLoading, isFetching } = useUserRole(userId);
  
  // User is a mentor if they have the 'mentor' role in any clan
  const isMentor = roles?.some(r => r.role === 'mentor') ?? false;
  
  // User is a student (default role) - has student role or no roles yet
  const isStudent = !isMentor;
  
  return {
    isMentor,
    isStudent,
    isLoading: isLoading || isFetching,
    roles,
    // Helper to check specific role
    hasRole: (role: AppRole) => roles?.some(r => r.role === role) ?? false,
  };
}

// Hook to check if role validation is complete (for route protection)
export function useRoleValidation(userId: string | undefined) {
  const { isMentor, isStudent, isLoading, roles } = useIsMentorAnywhere(userId);
  
  return {
    isMentor,
    isStudent,
    isLoading,
    // Role is validated when we have loaded and user has roles assigned
    isValidated: !isLoading && roles !== null && roles !== undefined,
    roles,
  };
}
