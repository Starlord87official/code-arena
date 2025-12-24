import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'mentor' | 'student';
export type RoleStatus = 'mentor' | 'student' | 'loading';

export interface UserRoleInfo {
  id: string;
  user_id: string;
  clan_id: string;
  role: AppRole;
  created_at: string;
}

// Fetch all roles for a user from Supabase
function useUserRolesQuery(userId: string | undefined) {
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

/**
 * SINGLE SOURCE OF TRUTH for user role.
 * Returns role: 'student' | 'mentor' | 'loading'
 * 
 * While loading, ALL role-specific UI must be hidden.
 * Only renders role-specific content AFTER role is resolved from Supabase.
 */
export function useUserRole(userId: string | undefined): {
  role: RoleStatus;
  isMentor: boolean;
  isStudent: boolean;
  isLoading: boolean;
  isValidated: boolean;
  roles: UserRoleInfo[] | null;
} {
  const { data: roles, isLoading, isFetching } = useUserRolesQuery(userId);
  
  // Loading state - role not yet determined
  const loading = isLoading || isFetching || (userId !== undefined && roles === undefined);
  
  // User is a mentor if they have the 'mentor' role in any clan
  const isMentor = roles?.some(r => r.role === 'mentor') ?? false;
  
  // Determine role status
  const role: RoleStatus = loading ? 'loading' : (isMentor ? 'mentor' : 'student');
  
  return {
    role,
    isMentor: role === 'mentor',
    isStudent: role === 'student',
    isLoading: loading,
    isValidated: !loading && roles !== null && roles !== undefined,
    roles: roles ?? null,
  };
}

// Aliases for backward compatibility
export const useIsMentorAnywhere = useUserRole;
export const useRoleValidation = useUserRole;
