import { useMemo } from 'react';
import { mockChallenges, Challenge } from '@/lib/mockData';
import { useRevisionQueue, RevisionQueueItem } from './useRevisionQueue';
import { TopicWithProgress } from './useRoadmap';

// Map topic names from roadmap_topics to challenge tags
const TOPIC_TAG_MAP: Record<string, string[]> = {
  'Arrays': ['arrays'],
  'Strings': ['strings'],
  'Linked List': ['linked-list'],
  'Stack & Queue': ['stack', 'queue'],
  'Recursion': ['recursion'],
  'Trees': ['trees'],
  'Binary Search Trees': ['binary-search', 'bst'],
  'Graphs': ['graphs', 'bfs', 'dfs'],
  'Dynamic Programming': ['dp', 'dynamic-programming'],
  'Greedy': ['greedy'],
  'Heaps / Priority Queue': ['heap', 'priority-queue'],
  'Bit Manipulation': ['bit-manipulation', 'bits'],
  'Tries': ['trie', 'tries'],
};

export interface TopicProblemStats {
  topicId: string;
  topicName: string;
  totalProblems: number;
  solvedProblems: number;
  revisionCount: number;
  problems: Challenge[];
  needsMorePractice: boolean;
}

// Mock solved problems for development (in production, this would come from DB)
const MOCK_SOLVED_PROBLEM_IDS = [
  'ch-001', // Two Sum
  'ch-006', // String Manipulation
  'ch-012', // Rotate Array
];

export function useTopicProblems(topics: TopicWithProgress[]) {
  const { data: revisionQueue = [], isLoading: revisionLoading } = useRevisionQueue();

  const topicStats = useMemo(() => {
    const statsMap: Record<string, TopicProblemStats> = {};

    topics.forEach((topic) => {
      const topicTags = TOPIC_TAG_MAP[topic.topic_name] || [];
      
      // Find all problems that match this topic's tags
      const topicProblems = mockChallenges.filter((challenge) =>
        challenge.tags.some((tag) => topicTags.includes(tag.toLowerCase()))
      );

      // Count solved problems (mock for now)
      const solvedProblems = topicProblems.filter((p) =>
        MOCK_SOLVED_PROBLEM_IDS.includes(p.id)
      ).length;

      // Count problems marked for revision in this topic
      const topicRevisions = (revisionQueue as RevisionQueueItem[]).filter(
        (item) => {
          // Match by topic field or by checking if problem tags match
          if (item.topic) {
            return topicTags.some(tag => 
              item.topic?.toLowerCase().includes(tag)
            );
          }
          // Fallback: check if problem ID is in topic problems
          return topicProblems.some(p => p.id === item.problem_id);
        }
      );

      // Determine if user needs more practice (many attempts, few solved)
      // For now, show if < 30% solved and at least 3 problems available
      const needsMorePractice = 
        topicProblems.length >= 3 && 
        solvedProblems / topicProblems.length < 0.3 &&
        topic.lockStatus === 'in_progress';

      statsMap[topic.id] = {
        topicId: topic.id,
        topicName: topic.topic_name,
        totalProblems: topicProblems.length,
        solvedProblems,
        revisionCount: topicRevisions.length,
        problems: topicProblems,
        needsMorePractice,
      };
    });

    return statsMap;
  }, [topics, revisionQueue]);

  return {
    topicStats,
    isLoading: revisionLoading,
  };
}

export function useTopicProblemStats(topicId: string, topicName: string) {
  const { data: revisionQueue = [] } = useRevisionQueue();

  return useMemo(() => {
    const topicTags = TOPIC_TAG_MAP[topicName] || [];
    
    const topicProblems = mockChallenges.filter((challenge) =>
      challenge.tags.some((tag) => topicTags.includes(tag.toLowerCase()))
    );

    const solvedProblems = topicProblems.filter((p) =>
      MOCK_SOLVED_PROBLEM_IDS.includes(p.id)
    ).length;

    const topicRevisions = (revisionQueue as RevisionQueueItem[]).filter(
      (item) => {
        if (item.topic) {
          return topicTags.some(tag => 
            item.topic?.toLowerCase().includes(tag)
          );
        }
        return topicProblems.some(p => p.id === item.problem_id);
      }
    );

    return {
      totalProblems: topicProblems.length,
      solvedProblems,
      revisionCount: topicRevisions.length,
      problems: topicProblems,
    };
  }, [topicId, topicName, revisionQueue]);
}
