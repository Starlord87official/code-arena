import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChallengePack {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string;
  category: string;
  difficulty_range: string[];
  estimated_hours: number;
  unlock_level: number;
  is_featured: boolean;
  is_new: boolean;
  order_index: number;
}

export interface PackWithProgress extends ChallengePack {
  stats: {
    total_challenges: number;
    easy_count: number;
    medium_count: number;
    hard_count: number;
    extreme_count: number;
    total_xp: number;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  isUnlocked: boolean;
}

export function useChallengePacks() {
  const { user, isAuthenticated } = useAuth();

  // Fetch all packs
  const packsQuery = useQuery({
    queryKey: ['challenge-packs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_packs')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as ChallengePack[];
    },
    enabled: isAuthenticated,
  });

  // Fetch user level
  const levelQuery = useQuery({
    queryKey: ['user-level', user?.id],
    queryFn: async () => {
      if (!user?.id) return 1;
      const { data, error } = await supabase.rpc('get_user_level', {
        p_user_id: user.id,
      });
      if (error) return 1;
      return data as number;
    },
    enabled: isAuthenticated && !!user?.id,
  });

  // Fetch pack stats and progress
  const packsWithProgress: PackWithProgress[] = (packsQuery.data || []).map((pack) => {
    const userLevel = levelQuery.data || 1;
    const isUnlocked = userLevel >= pack.unlock_level;

    // Default stats - will be fetched dynamically
    return {
      ...pack,
      stats: {
        total_challenges: 0,
        easy_count: 0,
        medium_count: 0,
        hard_count: 0,
        extreme_count: 0,
        total_xp: 0,
      },
      progress: {
        completed: 0,
        total: 0,
        percentage: 0,
      },
      isUnlocked,
    };
  });

  // Get packs by category
  const featuredPacks = packsWithProgress.filter((p) => p.is_featured);
  const interviewPacks = packsWithProgress.filter((p) => p.category === 'interview');
  const patternPacks = packsWithProgress.filter((p) => p.category === 'pattern');
  const advancedPacks = packsWithProgress.filter((p) => p.category === 'advanced');
  const companyPacks = packsWithProgress.filter((p) => p.category === 'company');

  return {
    packs: packsWithProgress,
    featuredPacks,
    interviewPacks,
    patternPacks,
    advancedPacks,
    companyPacks,
    userLevel: levelQuery.data || 1,
    isLoading: packsQuery.isLoading || levelQuery.isLoading,
    error: packsQuery.error || levelQuery.error,
  };
}

export function usePackDetails(packSlug: string) {
  const { user, isAuthenticated } = useAuth();

  // Fetch pack info
  const packQuery = useQuery({
    queryKey: ['challenge-pack', packSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_packs')
        .select('*')
        .eq('slug', packSlug)
        .maybeSingle();

      if (error) throw error;
      return data as ChallengePack | null;
    },
    enabled: isAuthenticated && !!packSlug,
  });

  // Fetch challenges in pack
  const challengesQuery = useQuery({
    queryKey: ['pack-challenges', packQuery.data?.id],
    queryFn: async () => {
      if (!packQuery.data?.id) return [];
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('pack_id', packQuery.data.id)
        .eq('is_active', true)
        .order('difficulty', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated && !!packQuery.data?.id,
  });

  // Fetch user completions for pack
  const completionsQuery = useQuery({
    queryKey: ['pack-completions', user?.id, packQuery.data?.id],
    queryFn: async () => {
      if (!user?.id || !packQuery.data?.id) return [];
      const challengeIds = (challengesQuery.data || []).map((c) => c.id);
      if (challengeIds.length === 0) return [];

      const { data, error } = await supabase
        .from('challenge_completions')
        .select('challenge_id')
        .eq('user_id', user.id)
        .in('challenge_id', challengeIds);

      if (error) throw error;
      return data.map((c) => c.challenge_id);
    },
    enabled: isAuthenticated && !!user?.id && !!challengesQuery.data?.length,
  });

  const completedIds = new Set(completionsQuery.data || []);
  const challenges = (challengesQuery.data || []).map((c) => ({
    ...c,
    isSolved: completedIds.has(c.id),
  }));

  const progress = {
    completed: completedIds.size,
    total: challenges.length,
    percentage: challenges.length > 0 ? Math.round((completedIds.size / challenges.length) * 100) : 0,
  };

  return {
    pack: packQuery.data,
    challenges,
    progress,
    isLoading: packQuery.isLoading || challengesQuery.isLoading,
    error: packQuery.error || challengesQuery.error,
  };
}
