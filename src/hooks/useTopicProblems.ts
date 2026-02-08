import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TopicWithProgress } from './useRoadmap';

// Map topic names from roadmap_topics to challenge tags (case-insensitive matching)
const TOPIC_TAG_MAP: Record<string, string[]> = {
  'Arrays': ['arrays', 'two pointers', 'two-pointers', 'sliding window', 'pointers', 'prefix', 'matrix'],
  'Strings': ['strings', 'hashing', 'hash-map'],
  'Linked List': ['linked list', 'linked-list'],
  'Stack & Queue': ['stack', 'monotonic stack', 'deque'],
  'Recursion': ['recursion', 'backtracking', 'memoization'],
  'Trees': ['trees', 'bfs', 'dfs'],
  'Binary Search Trees': ['binary search', 'bst'],
  'Graphs': ['graphs', 'topological sort', 'union find', 'dijkstra', 'shortest-path'],
  'Dynamic Programming': ['dp', 'optimization'],
  'Greedy': ['greedy'],
  'Heaps / Priority Queue': ['heap'],
  'Bit Manipulation': ['bit-manipulation', 'bits'],
  'Tries': ['trie'],
};

export interface TopicProblemStats {
  topicId: string;
  topicName: string;
  totalProblems: number;
  solvedProblems: number;
  revisionCount: number;
  problems: { id: string; title: string; difficulty: string; tags: string[] }[];
  needsMorePractice: boolean;
}

interface ChallengeRow {
  id: string;
  title: string;
  difficulty: string;
  tags: string[];
}

/**
 * Fetches all active challenges from the DB (cached).
 */
function useChallenges() {
  return useQuery({
    queryKey: ['challenges-all-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('id, title, difficulty, tags')
        .eq('is_active', true);

      if (error) throw error;
      return (data || []) as ChallengeRow[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });
}

/**
 * Fetches the current user's distinct completed challenge IDs.
 */
function useUserCompletions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-completions', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();

      const { data, error } = await supabase
        .from('challenge_completions')
        .select('challenge_id')
        .eq('user_id', user.id);

      if (error) throw error;

      // Deduplicate challenge_ids
      const ids = new Set<string>();
      for (const row of data || []) {
        ids.add(row.challenge_id);
      }
      return ids;
    },
    enabled: !!user?.id,
  });
}

/**
 * Fetches the user's revision queue count per topic.
 */
function useRevisionCounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['revision-counts', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Map<string, number>();

      const { data, error } = await supabase.rpc('get_revision_queue' as any);
      if (error) throw error;

      const result = data as { success: boolean; items: { topic: string | null }[] };
      const counts = new Map<string, number>();
      for (const item of result.items || []) {
        if (item.topic) {
          const key = item.topic.toLowerCase();
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      }
      return counts;
    },
    enabled: !!user?.id,
  });
}

/**
 * Matches a topic name to challenges using case-insensitive tag matching.
 */
function getTopicChallenges(topicName: string, challenges: ChallengeRow[]): ChallengeRow[] {
  const topicTags = TOPIC_TAG_MAP[topicName] || [];
  if (topicTags.length === 0) return [];

  return challenges.filter((challenge) =>
    challenge.tags.some((tag) =>
      topicTags.includes(tag.toLowerCase())
    )
  );
}

/**
 * Main hook: computes topic stats from real DB data.
 */
export function useTopicProblems(topics: TopicWithProgress[]) {
  const { data: challenges = [], isLoading: challengesLoading } = useChallenges();
  const { data: completedIds = new Set<string>(), isLoading: completionsLoading } = useUserCompletions();
  const { data: revisionCounts = new Map<string, number>(), isLoading: revisionsLoading } = useRevisionCounts();

  const isLoading = challengesLoading || completionsLoading || revisionsLoading;

  const topicStats: Record<string, TopicProblemStats> = {};

  if (!isLoading) {
    topics.forEach((topic) => {
      const topicChallenges = getTopicChallenges(topic.topic_name, challenges);

      // Count solved (distinct completions)
      const solvedProblems = topicChallenges.filter((c) => completedIds.has(c.id)).length;

      // Count revisions for this topic
      const topicTags = TOPIC_TAG_MAP[topic.topic_name] || [];
      let revisionCount = 0;
      for (const tag of topicTags) {
        revisionCount += revisionCounts.get(tag) || 0;
      }

      // Needs more practice if < 30% solved and at least 3 problems and in_progress
      const needsMorePractice =
        topicChallenges.length >= 3 &&
        solvedProblems / topicChallenges.length < 0.3 &&
        topic.lockStatus === 'in_progress';

      topicStats[topic.id] = {
        topicId: topic.id,
        topicName: topic.topic_name,
        totalProblems: topicChallenges.length,
        solvedProblems,
        revisionCount,
        problems: topicChallenges,
        needsMorePractice,
      };
    });
  }

  return {
    topicStats,
    isLoading,
  };
}

/**
 * Single-topic variant for standalone use.
 */
export function useTopicProblemStats(topicId: string, topicName: string) {
  const { data: challenges = [], isLoading: challengesLoading } = useChallenges();
  const { data: completedIds = new Set<string>(), isLoading: completionsLoading } = useUserCompletions();
  const { data: revisionCounts = new Map<string, number>(), isLoading: revisionsLoading } = useRevisionCounts();

  const isLoading = challengesLoading || completionsLoading || revisionsLoading;

  if (isLoading) {
    return { totalProblems: 0, solvedProblems: 0, revisionCount: 0, problems: [], isLoading: true };
  }

  const topicChallenges = getTopicChallenges(topicName, challenges);
  const solvedProblems = topicChallenges.filter((c) => completedIds.has(c.id)).length;

  const topicTags = TOPIC_TAG_MAP[topicName] || [];
  let revisionCount = 0;
  for (const tag of topicTags) {
    revisionCount += revisionCounts.get(tag) || 0;
  }

  return {
    totalProblems: topicChallenges.length,
    solvedProblems,
    revisionCount,
    problems: topicChallenges,
    isLoading: false,
  };
}
