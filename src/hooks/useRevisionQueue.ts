import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RevisionQueueItem {
  id: string;
  problem_id: string;
  problem_title: string;
  topic: string | null;
  scheduled_date: string;
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
  created_at: string;
}

export function useRevisionQueue() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['revision-queue', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc('get_revision_queue' as any);

      if (error) throw error;
      
      const result = data as { success: boolean; items: RevisionQueueItem[] };
      return result.items || [];
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every minute to update statuses
  });
}

export function useAddToRevisionQueue() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      problemId,
      problemTitle,
      topic,
      daysUntilRevision,
    }: {
      problemId: string;
      problemTitle: string;
      topic?: string;
      daysUntilRevision: number;
    }) => {
      const { data, error } = await supabase.rpc('add_to_revision_queue' as any, {
        p_problem_id: problemId,
        p_problem_title: problemTitle,
        p_topic: topic || null,
        p_days_until_revision: daysUntilRevision,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to add to revision queue');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revision-queue', user?.id] });
    },
  });
}

export function useCompleteRevisionItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc('complete_revision_item' as any, {
        p_id: id,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to complete revision');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revision-queue', user?.id] });
    },
  });
}
