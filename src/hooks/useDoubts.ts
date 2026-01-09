import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type DoubtCategory = 'study' | 'job' | 'internship' | 'referral';
export type DoubtDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Doubt {
  id: string;
  user_id: string;
  category: DoubtCategory;
  topic_id: string;
  topic_name: string;
  difficulty: DoubtDifficulty;
  title: string;
  content: string;
  code_block: string | null;
  is_solved: boolean;
  solved_at: string | null;
  created_at: string;
  is_own: boolean;
}

export interface EligibleTopic {
  id: string;
  topic_name: string;
  roadmap_id: string;
  state: 'in_progress' | 'completed';
}

interface DoubtFilters {
  showSolved?: boolean;
  category?: DoubtCategory | null;
  topicId?: string | null;
  difficulty?: DoubtDifficulty | null;
  search?: string | null;
}

export function useDoubts(filters: DoubtFilters = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['doubts', user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc('get_visible_doubts' as any, {
        p_show_solved: filters.showSolved ?? false,
        p_category: filters.category ?? null,
        p_topic_id: filters.topicId ?? null,
        p_difficulty: filters.difficulty ?? null,
        p_search: filters.search ?? null,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; doubts: Doubt[]; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch doubts');
      }
      
      return result.doubts || [];
    },
    enabled: !!user?.id,
  });
}

export function useEligibleTopics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['eligible-doubt-topics', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc('get_eligible_doubt_topics' as any);

      if (error) throw error;
      
      const result = data as { success: boolean; topics: EligibleTopic[] };
      return result.topics || [];
    },
    enabled: !!user?.id,
  });
}

export function useCreateDoubt() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      category,
      topicId,
      difficulty,
      title,
      content,
      codeBlock,
    }: {
      category: DoubtCategory;
      topicId: string;
      difficulty: DoubtDifficulty;
      title: string;
      content: string;
      codeBlock?: string;
    }) => {
      const { data, error } = await supabase.rpc('create_doubt' as any, {
        p_category: category,
        p_topic_id: topicId,
        p_difficulty: difficulty,
        p_title: title,
        p_content: content,
        p_code_block: codeBlock || null,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to create doubt');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doubts', user?.id] });
    },
  });
}

export function useMarkDoubtSolved() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (doubtId: string) => {
      const { data, error } = await supabase.rpc('mark_doubt_solved' as any, {
        p_doubt_id: doubtId,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to mark doubt as solved');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doubts', user?.id] });
    },
  });
}
