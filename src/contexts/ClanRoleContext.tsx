import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useUserClanRole, AppRole } from '@/hooks/useClanRoles';

interface ClanRoleContextType {
  role: AppRole | null;
  isMentor: boolean;
  isStudent: boolean;
  isLoading: boolean;
}

const ClanRoleContext = createContext<ClanRoleContextType | undefined>(undefined);

export function ClanRoleProvider({ 
  children, 
  clanId 
}: { 
  children: ReactNode; 
  clanId: string;
}) {
  const { user } = useAuth();
  const { data: userRole, isLoading } = useUserClanRole(user?.uid, clanId);

  const value = useMemo(() => ({
    role: userRole?.role || null,
    isMentor: userRole?.role === 'mentor',
    isStudent: userRole?.role === 'student',
    isLoading,
  }), [userRole, isLoading]);

  return (
    <ClanRoleContext.Provider value={value}>
      {children}
    </ClanRoleContext.Provider>
  );
}

export function useClanRole() {
  const context = useContext(ClanRoleContext);
  if (context === undefined) {
    // Return default values if not within provider (for demo purposes)
    return {
      role: null,
      isMentor: false,
      isStudent: false,
      isLoading: false,
    };
  }
  return context;
}
