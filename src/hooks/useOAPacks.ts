import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OAPack {
  id: string;
  title: string;
  description: string | null;
  role_track: string;
  difficulty: string;
  duration_minutes: number;
  tags: string[];
  icon: string | null;
  is_featured: boolean | null;
  order_index: number | null;
  created_at: string;
  assessment_count?: number;
}

export interface OAAssessment {
  id: string;
  pack_id: string;
  title: string;
  duration_minutes: number;
  rules_json: Record<string, unknown>;
  sections_json: Array<{ name: string; questionCount: number }>;
  order_index: number | null;
  created_at: string;
}

export function useOAPacks() {
  return useQuery({
    queryKey: ['oa-packs'],
    queryFn: async () => {
      const { data: packs, error } = await supabase
        .from('oa_packs')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Get assessment counts per pack
      const { data: assessments } = await supabase
        .from('oa_assessments')
        .select('pack_id');

      const countMap: Record<string, number> = {};
      assessments?.forEach((a: { pack_id: string }) => {
        countMap[a.pack_id] = (countMap[a.pack_id] || 0) + 1;
      });

      return (packs as OAPack[]).map(p => ({
        ...p,
        assessment_count: countMap[p.id] || 0,
      }));
    },
  });
}

export function useOAPackDetail(packId: string | undefined) {
  return useQuery({
    queryKey: ['oa-pack', packId],
    queryFn: async () => {
      if (!packId) throw new Error('No pack ID');

      const [packResult, assessmentsResult] = await Promise.all([
        supabase.from('oa_packs').select('*').eq('id', packId).single(),
        supabase
          .from('oa_assessments')
          .select('*')
          .eq('pack_id', packId)
          .order('order_index', { ascending: true }),
      ]);

      if (packResult.error) throw packResult.error;

      return {
        pack: packResult.data as OAPack,
        assessments: (assessmentsResult.data || []) as OAAssessment[],
      };
    },
    enabled: !!packId,
  });
}

export function useOAAssessmentDetail(assessmentId: string | undefined) {
  return useQuery({
    queryKey: ['oa-assessment', assessmentId],
    queryFn: async () => {
      if (!assessmentId) throw new Error('No assessment ID');

      const { data, error } = await supabase
        .from('oa_assessments')
        .select('*, oa_packs(*)')
        .eq('id', assessmentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!assessmentId,
  });
}
