import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OAAttempt {
  id: string;
  user_id: string;
  assessment_id: string;
  started_at: string;
  submitted_at: string | null;
  score: number;
  max_score: number;
  integrity_json: Record<string, unknown>;
  status: string;
  created_at: string;
}

export function useOAHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['oa-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('oa_attempts')
        .select('*, oa_assessments(title, duration_minutes, oa_packs(title))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}
