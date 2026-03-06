import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useAdminAuth() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    const checkAdmin = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      setIsAdmin(!error && data?.role === 'admin');
      setIsLoading(false);
    };

    checkAdmin();
  }, [user, authLoading]);

  return { isAdmin, isLoading: isLoading || authLoading, isAuthenticated };
}
