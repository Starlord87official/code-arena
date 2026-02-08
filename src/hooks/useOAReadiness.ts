import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OAReadiness {
  id: string;
  user_id: string;
  readiness_score: number;
  oa_streak: number;
  total_attempts: number;
  best_score: number;
  weak_topics: string[];
  updated_at: string;
}

export function useOAReadiness() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['oa-readiness', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('oa_readiness')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as OAReadiness | null;
    },
    enabled: !!user?.id,
  });
}
