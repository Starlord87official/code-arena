import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type EventCategory = 'study' | 'career' | 'personal' | 'internship' | 'revision' | 'contest';

export interface PlannerEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  category: EventCategory;
  is_system_event: boolean;
  system_event_type: string | null;
  reference_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  event_date: string;
  end_date?: string;
  category: EventCategory;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

export function usePlannerEvents(filters?: { categories?: EventCategory[] }) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['planner-events', user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('planner_events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });

      if (filters?.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as PlannerEvent[];
    },
    enabled: !!user?.id,
  });
}

export function useCreatePlannerEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('planner_events')
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description || null,
          event_date: input.event_date,
          end_date: input.end_date || null,
          category: input.category,
          is_system_event: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PlannerEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-events', user?.id] });
    },
  });
}

export function useUpdatePlannerEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateEventInput) => {
      const { data, error } = await supabase
        .from('planner_events')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as PlannerEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-events', user?.id] });
    },
  });
}

export function useDeletePlannerEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('planner_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-events', user?.id] });
    },
  });
}

// Helper to get color by category
export function getCategoryColor(category: EventCategory) {
  switch (category) {
    case 'internship':
    case 'career':
      return 'bg-destructive';
    case 'revision':
    case 'study':
      return 'bg-green-500';
    case 'contest':
      return 'bg-primary';
    case 'personal':
    default:
      return 'bg-muted-foreground';
  }
}

export function getCategoryLabel(category: EventCategory) {
  switch (category) {
    case 'internship':
      return 'Internship';
    case 'career':
      return 'Career';
    case 'revision':
      return 'Revision';
    case 'study':
      return 'Study';
    case 'contest':
      return 'Contest';
    case 'personal':
      return 'Personal';
    default:
      return category;
  }
}
