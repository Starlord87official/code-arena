import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OAAttempt {
  id: string;
  user_id: string;
  assessment_id: string;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  max_score: number | null;
  integrity_json: {
    tabSwitches: number;
    fullscreenExits: number;
    copyPasteCount: number;
  };
  status: string;
  created_at: string;
}

export interface OAAttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  answer: string | null;
  status: string;
  time_spent_sec: number | null;
  score: number | null;
}

export function useOAAttempt(attemptId: string | undefined) {
  return useQuery({
    queryKey: ['oa-attempt', attemptId],
    queryFn: async () => {
      if (!attemptId) throw new Error('No attempt ID');

      const { data, error } = await supabase
        .from('oa_attempts')
        .select('*, oa_assessments(*, oa_packs(*))')
        .eq('id', attemptId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!attemptId,
  });
}

export function useOAAttemptAnswers(attemptId: string | undefined) {
  return useQuery({
    queryKey: ['oa-attempt-answers', attemptId],
    queryFn: async () => {
      if (!attemptId) throw new Error('No attempt ID');

      const { data, error } = await supabase
        .from('oa_attempt_answers')
        .select('*, oa_questions(*)')
        .eq('attempt_id', attemptId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!attemptId,
  });
}
