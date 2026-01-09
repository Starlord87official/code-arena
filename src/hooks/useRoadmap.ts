import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type TopicState = 'not_started' | 'in_progress' | 'completed';

export interface RoadmapTopic {
  id: string;
  roadmap_id: string;
  topic_name: string;
  topic_order: number;
  created_at: string;
}

export interface Roadmap {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface UserTopicProgress {
  id: string;
  user_id: string;
  roadmap_id: string;
  topic_id: string;
  state: TopicState;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

export interface TopicWithProgress extends RoadmapTopic {
  state: TopicState;
  started_at: string | null;
  completed_at: string | null;
}

export interface RoadmapWithProgress {
  roadmap: Roadmap;
  topics: TopicWithProgress[];
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
}

// Fetch all available roadmaps
export function useRoadmaps() {
  return useQuery({
    queryKey: ['roadmaps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .order('created_at');

      if (error) throw error;
      return data as Roadmap[];
    },
  });
}

// Fetch topics for a roadmap
export function useRoadmapTopics(roadmapId: string | undefined) {
  return useQuery({
    queryKey: ['roadmap-topics', roadmapId],
    queryFn: async () => {
      if (!roadmapId) return [];
      
      const { data, error } = await supabase
        .from('roadmap_topics')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('topic_order');

      if (error) throw error;
      return data as RoadmapTopic[];
    },
    enabled: !!roadmapId,
  });
}

// Check if user has started a roadmap
export function useUserActiveRoadmaps() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-active-roadmaps', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_active_roadmaps')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

// Fetch user's progress for a specific roadmap
export function useUserRoadmapProgress(roadmapId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-roadmap-progress', user?.id, roadmapId],
    queryFn: async () => {
      if (!user?.id || !roadmapId) return [];
      
      const { data, error } = await supabase
        .from('user_roadmap_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('roadmap_id', roadmapId);

      if (error) throw error;
      return data as UserTopicProgress[];
    },
    enabled: !!user?.id && !!roadmapId,
  });
}

// Combined hook: Get roadmap with user progress
export function useRoadmapWithProgress(roadmapId: string | undefined): {
  data: RoadmapWithProgress | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['roadmap-with-progress', user?.id, roadmapId],
    queryFn: async () => {
      if (!roadmapId) return null;
      
      // Fetch roadmap
      const { data: roadmap, error: roadmapError } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('id', roadmapId)
        .single();

      if (roadmapError) throw roadmapError;

      // Fetch topics
      const { data: topics, error: topicsError } = await supabase
        .from('roadmap_topics')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('topic_order');

      if (topicsError) throw topicsError;

      // Fetch user progress if authenticated
      let progressMap: Record<string, UserTopicProgress> = {};
      if (user?.id) {
        const { data: progress, error: progressError } = await supabase
          .from('user_roadmap_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('roadmap_id', roadmapId);

        if (progressError) throw progressError;
        
        progressMap = (progress || []).reduce((acc, p) => {
          acc[p.topic_id] = p as UserTopicProgress;
          return acc;
        }, {} as Record<string, UserTopicProgress>);
      }

      // Combine topics with progress
      const topicsWithProgress: TopicWithProgress[] = (topics as RoadmapTopic[]).map(topic => ({
        ...topic,
        state: progressMap[topic.id]?.state || 'not_started',
        started_at: progressMap[topic.id]?.started_at || null,
        completed_at: progressMap[topic.id]?.completed_at || null,
      }));

      const completedCount = topicsWithProgress.filter(t => t.state === 'completed').length;
      const totalCount = topicsWithProgress.length;

      return {
        roadmap: roadmap as Roadmap,
        topics: topicsWithProgress,
        completedCount,
        totalCount,
        progressPercentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      };
    },
    enabled: !!roadmapId,
  });

  return { data: data ?? null, isLoading, error: error as Error | null };
}

// Start a roadmap
export function useStartRoadmap() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (roadmapId: string) => {
      const { data, error } = await supabase.rpc('start_roadmap', {
        p_roadmap_id: roadmapId,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to start roadmap');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-active-roadmaps', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-roadmap-progress'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap-with-progress'] });
    },
  });
}

// Update topic state (for system/mentor use)
export function useUpdateTopicState() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ topicId, state }: { topicId: string; state: TopicState }) => {
      const { data, error } = await supabase.rpc('update_topic_state', {
        p_topic_id: topicId,
        p_state: state,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to update topic state');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roadmap-progress'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap-with-progress'] });
    },
  });
}
