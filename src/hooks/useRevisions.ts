import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type RevisionState = 'pending' | 'done' | 'missed';

export interface TopicRevision {
  id: string;
  user_id: string;
  topic_id: string;
  roadmap_id: string;
  revision_number: number;
  scheduled_date: string;
  state: RevisionState;
  completed_at: string | null;
  created_at: string;
}

export interface RevisionWithTopic extends TopicRevision {
  topic_name: string;
  topic_order: number;
}

export interface RevisionSummary {
  due_today: number;
  missed: number;
  upcoming: number;
}

// Fetch revision summary (due today, missed, upcoming counts)
export function useRevisionSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['revision-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Use raw RPC call since types may not be updated yet
      const { data, error } = await supabase.rpc('get_revision_summary' as any);

      if (error) throw error;
      return (data as unknown) as RevisionSummary;
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every minute to check for missed
  });
}

// Fetch all revisions for a user
export function useUserRevisions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-revisions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First mark any missed revisions
      await supabase.rpc('mark_missed_revisions' as any, { p_user_id: user.id });

      // Query topic_revisions table (may not be in types yet)
      const { data, error } = await supabase
        .from('topic_revisions' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return (data as unknown) as TopicRevision[];
    },
    enabled: !!user?.id,
  });
}

// Fetch revisions with topic details
export function useRevisionsWithTopics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['revisions-with-topics', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First mark any missed revisions
      await supabase.rpc('mark_missed_revisions' as any, { p_user_id: user.id });

      // Fetch revisions
      const { data: revisions, error: revError } = await supabase
        .from('topic_revisions' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (revError) throw revError;

      const revisionsTyped = (revisions as unknown) as TopicRevision[];

      // Fetch topic names
      const topicIds = [...new Set(revisionsTyped.map(r => r.topic_id))];
      if (topicIds.length === 0) return [];

      const { data: topics, error: topicError } = await supabase
        .from('roadmap_topics')
        .select('id, topic_name, topic_order')
        .in('id', topicIds);

      if (topicError) throw topicError;

      const topicMap = (topics || []).reduce((acc, t) => {
        acc[t.id] = { topic_name: t.topic_name, topic_order: t.topic_order };
        return acc;
      }, {} as Record<string, { topic_name: string; topic_order: number }>);

      return revisionsTyped.map(r => ({
        ...r,
        topic_name: topicMap[r.topic_id]?.topic_name || 'Unknown Topic',
        topic_order: topicMap[r.topic_id]?.topic_order || 0,
      })) as RevisionWithTopic[];
    },
    enabled: !!user?.id,
  });
}

// Fetch revisions due today
export function useRevisionsDueToday() {
  const { data: allRevisions, isLoading, error } = useRevisionsWithTopics();

  const today = new Date().toISOString().split('T')[0];
  const dueToday = (allRevisions || []).filter(
    r => r.state === 'pending' && r.scheduled_date === today
  );

  return { data: dueToday, isLoading, error };
}

// Fetch missed revisions
export function useMissedRevisions() {
  const { data: allRevisions, isLoading, error } = useRevisionsWithTopics();

  const missed = (allRevisions || []).filter(r => r.state === 'missed');

  return { data: missed, isLoading, error };
}

// Complete a revision (called when user does qualifying activity)
export function useCompleteRevision() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (topicId: string) => {
      const { data, error } = await supabase.rpc('complete_revision', {
        p_topic_id: topicId,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; revisions_completed: number };
      if (!result.success) {
        throw new Error(result.error || 'Failed to complete revision');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revision-summary', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-revisions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['revisions-with-topics', user?.id] });
    },
  });
}

// Get revisions for a specific topic
export function useTopicRevisions(topicId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['topic-revisions', user?.id, topicId],
    queryFn: async () => {
      if (!user?.id || !topicId) return [];

      const { data, error } = await supabase
        .from('topic_revisions' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('topic_id', topicId)
        .order('revision_number', { ascending: true });

      if (error) throw error;
      return (data as unknown) as TopicRevision[];
    },
    enabled: !!user?.id && !!topicId,
  });
}
