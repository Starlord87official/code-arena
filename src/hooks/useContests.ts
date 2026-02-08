import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useContests() {
  return useQuery({
    queryKey: ['contests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('start_time', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useContest(id: string | undefined) {
  return useQuery({
    queryKey: ['contest', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useContestRegistrations(contestId: string | undefined) {
  return useQuery({
    queryKey: ['contest-registrations', contestId],
    queryFn: async () => {
      if (!contestId) return [];
      const { data, error } = await supabase
        .from('contest_registrations')
        .select('*')
        .eq('contest_id', contestId);
      if (error) throw error;
      return data;
    },
    enabled: !!contestId,
  });
}

export function useMyRegistration(contestId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-contest-registration', contestId, user?.id],
    queryFn: async () => {
      if (!contestId || !user?.id) return null;
      const { data, error } = await supabase
        .from('contest_registrations')
        .select('*')
        .eq('contest_id', contestId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!contestId && !!user?.id,
  });
}

export function useRegisterForContest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ contestId, language }: { contestId: string; language?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('contest_registrations')
        .insert({ contest_id: contestId, user_id: user.id, language: language || 'cpp' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['contest-registrations', vars.contestId] });
      queryClient.invalidateQueries({ queryKey: ['my-contest-registration', vars.contestId] });
    },
  });
}

export function useUserContestRating() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-contest-rating', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_contest_ratings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useContestRatingChanges(contestId: string | undefined) {
  return useQuery({
    queryKey: ['contest-rating-changes', contestId],
    queryFn: async () => {
      if (!contestId) return [];
      const { data, error } = await supabase
        .from('contest_rating_changes')
        .select('*')
        .eq('contest_id', contestId)
        .order('rank', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!contestId,
  });
}
