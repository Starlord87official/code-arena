import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export type InsightType = 
  | 'explain_mistakes'
  | 'edge_cases'
  | 'complexity_analysis'
  | 'different_thinking'
  | 'topic_performance'
  | 'explain_score';

export interface AIUsage {
  used: number;
  remaining: number;
  limit: number;
  ai_enabled: boolean;
}

export interface AIInsightResult {
  insight: string;
  usage: {
    used: number;
    remaining: number;
    limit: number;
  };
}

const INSIGHT_LABELS: Record<InsightType, string> = {
  explain_mistakes: 'Explain mistakes in my solution',
  edge_cases: 'Identify edge cases I missed',
  complexity_analysis: 'Analyze time and space complexity',
  different_thinking: 'Suggest how to think differently',
  topic_performance: 'Analyze my performance in this topic',
  explain_score: 'Explain my score',
};

export function getInsightLabel(type: InsightType): string {
  return INSIGHT_LABELS[type];
}

export function useAIUsage() {
  return useQuery({
    queryKey: ['ai-usage'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_ai_usage_today');
      if (error) throw error;
      return data as unknown as AIUsage;
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useAIInsight() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const requestInsight = useCallback(async (
    type: InsightType,
    context: Record<string, unknown>
  ): Promise<AIInsightResult | null> => {
    setIsLoading(true);
    setError(null);
    setInsight(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to use AI insights');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ type, context }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 429) {
          toast({
            title: 'Daily limit reached',
            description: `You've used all ${data.limit || 20} AI insights for today. Try again tomorrow!`,
            variant: 'destructive',
          });
          throw new Error('Daily AI limit reached');
        }
        if (response.status === 503) {
          toast({
            title: 'AI temporarily unavailable',
            description: 'AI insights are temporarily disabled. Please try again later.',
            variant: 'destructive',
          });
          throw new Error('AI insights are temporarily disabled');
        }
        throw new Error(data.error || 'Failed to get AI insight');
      }

      setInsight(data.insight);
      
      // Invalidate usage query to update the UI
      queryClient.invalidateQueries({ queryKey: ['ai-usage'] });

      return data as AIInsightResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      if (!message.includes('limit') && !message.includes('disabled')) {
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [queryClient, toast]);

  const reset = useCallback(() => {
    setInsight(null);
    setError(null);
  }, []);

  return {
    requestInsight,
    insight,
    isLoading,
    error,
    reset,
  };
}

// Export hook for code submission insights specifically
export function useCodeInsights() {
  const aiInsight = useAIInsight();
  
  const getCodeInsight = useCallback(async (
    type: 'explain_mistakes' | 'edge_cases' | 'complexity_analysis' | 'different_thinking',
    problemTitle: string,
    userCode?: string,
    approach?: string
  ) => {
    return aiInsight.requestInsight(type, {
      problemTitle,
      userCode,
      approach,
    });
  }, [aiInsight]);

  return {
    ...aiInsight,
    getCodeInsight,
  };
}

// Export hook for topic performance insights
export function useTopicInsights() {
  const aiInsight = useAIInsight();
  
  const getTopicInsight = useCallback(async (
    topicName: string,
    weaknessData: Record<string, unknown>
  ) => {
    return aiInsight.requestInsight('topic_performance', {
      topicName,
      weaknessData,
    });
  }, [aiInsight]);

  return {
    ...aiInsight,
    getTopicInsight,
  };
}

// Export hook for score explanation
export function useScoreInsights() {
  const aiInsight = useAIInsight();
  
  const explainScore = useCallback(async (
    score: number,
    breakdown: Record<string, unknown>[]
  ) => {
    return aiInsight.requestInsight('explain_score', {
      score,
      breakdown,
    });
  }, [aiInsight]);

  return {
    ...aiInsight,
    explainScore,
  };
}
