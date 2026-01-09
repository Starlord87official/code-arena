import { useState } from 'react';
import { AIInsightButton } from './AIInsightButton';
import { AIInsightDisplay } from './AIInsightDisplay';
import { useScoreInsights, useAIUsage } from '@/hooks/useAIInsights';
import type { ScoreBreakdown } from '@/hooks/useInterviewReadiness';

interface ScoreExplainButtonProps {
  score: number;
  breakdown: ScoreBreakdown[];
}

export function ScoreExplainButton({ score, breakdown }: ScoreExplainButtonProps) {
  const [showInsight, setShowInsight] = useState(false);
  const { explainScore, insight, isLoading, error, reset } = useScoreInsights();
  const { data: usage } = useAIUsage();

  const handleClick = async () => {
    if (insight) {
      setShowInsight(!showInsight);
      return;
    }
    
    setShowInsight(true);
    await explainScore(score, breakdown as unknown as Record<string, unknown>[]);
  };

  const handleClose = () => {
    setShowInsight(false);
    reset();
  };

  const isDisabled = !usage?.ai_enabled || usage?.remaining === 0;

  return (
    <div className="space-y-3">
      <AIInsightButton
        onClick={handleClick}
        isLoading={isLoading}
        disabled={isDisabled}
        label={insight ? (showInsight ? "Hide explanation" : "Show explanation") : "Explain my score"}
        variant="ghost"
        className="w-full justify-center"
      />
      
      {showInsight && (
        <AIInsightDisplay
          insight={insight}
          isLoading={isLoading}
          error={error}
          onClose={handleClose}
          title="Score Explanation"
        />
      )}
    </div>
  );
}
