import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Targets {
  daily: number;
  weekly: number;
  monthly: number;
}

interface Progress {
  today: number;
  week: number;
  month: number;
}

interface ActivityDay {
  date: string;
  count: number;
}

interface ActivitySummary {
  targets: Targets | null;
  progress: Progress;
  streak: number;
  activity: ActivityDay[];
}

export function useTargets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['activity-summary', user?.id],
    queryFn: async (): Promise<ActivitySummary> => {
      const { data, error } = await supabase.rpc('get_activity_summary' as any);
      
      if (error) {
        console.error('Error fetching activity summary:', error);
        return {
          targets: null,
          progress: { today: 0, week: 0, month: 0 },
          streak: 0,
          activity: []
        };
      }
      
      return data as unknown as ActivitySummary;
    },
    enabled: !!user,
  });

  const updateTargetsMutation = useMutation({
    mutationFn: async (targets: Partial<Targets>) => {
      const { data, error } = await supabase.rpc('update_user_targets' as any, {
        p_daily: targets.daily ?? null,
        p_weekly: targets.weekly ?? null,
        p_monthly: targets.monthly ?? null,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-summary', user?.id] });
    },
  });

  const recordActivityMutation = useMutation({
    mutationFn: async (problemsSolved: number = 1) => {
      const { data, error } = await supabase.rpc('record_activity' as any, {
        p_problems_solved: problemsSolved,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-summary', user?.id] });
    },
  });

  return {
    targets: summary?.targets ?? null,
    progress: summary?.progress ?? { today: 0, week: 0, month: 0 },
    streak: summary?.streak ?? 0,
    activity: summary?.activity ?? [],
    isLoading,
    error,
    updateTargets: updateTargetsMutation.mutate,
    recordActivity: recordActivityMutation.mutate,
    isUpdating: updateTargetsMutation.isPending,
  };
}
