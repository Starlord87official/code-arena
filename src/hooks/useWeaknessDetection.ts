import { useMemo } from 'react';
import { useRoadmapWithProgress, TopicWithProgress } from '@/hooks/useRoadmap';
import { useRevisionQueue } from '@/hooks/useRevisionQueue';
import { differenceInDays } from 'date-fns';

export type WeaknessRule = 
  | 'low_accuracy'
  | 'high_retry_count'
  | 'missed_revisions'
  | 'stuck_too_long'
  | 'skipped_depth';

export type SeverityLevel = 'watch' | 'at_risk' | 'critical';

export interface WeaknessRuleDetails {
  rule: WeaknessRule;
  label: string;
  description: string;
  guidance: string;
}

export interface TopicWeakness {
  topicId: string;
  topicName: string;
  triggeredRules: WeaknessRuleDetails[];
  severity: SeverityLevel;
  primaryReason: string;
}

const RULE_DETAILS: Record<WeaknessRule, Omit<WeaknessRuleDetails, 'rule'>> = {
  low_accuracy: {
    label: 'Low Accuracy',
    description: 'Accuracy below 60% after 5+ problem attempts',
    guidance: 'Focus on understanding the core concepts before attempting more problems. Review solved examples and patterns.',
  },
  high_retry_count: {
    label: 'High Retry Count',
    description: 'Same problem attempted 3+ times without success',
    guidance: 'Break down the problem into smaller steps. Try solving simpler variants first before returning to challenging problems.',
  },
  missed_revisions: {
    label: 'Missed Revisions',
    description: '2 or more missed revision sessions for this topic',
    guidance: 'Regular revision is key to retention. Set aside dedicated time for revision to strengthen your understanding.',
  },
  stuck_too_long: {
    label: 'Stuck Too Long',
    description: 'Topic has been in progress for more than 14 days',
    guidance: 'Consider breaking the topic into smaller goals. Completing even one problem daily builds momentum.',
  },
  skipped_depth: {
    label: 'Skipped Depth',
    description: 'Topic completed without proper practice depth',
    guidance: 'Mark problems for revision and attempt medium/hard difficulty to solidify your understanding.',
  },
};

function getSeverity(ruleCount: number): SeverityLevel {
  if (ruleCount >= 3) return 'critical';
  if (ruleCount >= 2) return 'at_risk';
  return 'watch';
}

function getPrimaryReason(rules: WeaknessRuleDetails[]): string {
  if (rules.length === 0) return '';
  
  // Priority order for primary reason
  const priorityOrder: WeaknessRule[] = [
    'stuck_too_long',
    'missed_revisions',
    'low_accuracy',
    'high_retry_count',
    'skipped_depth',
  ];
  
  for (const priority of priorityOrder) {
    const found = rules.find(r => r.rule === priority);
    if (found) {
      return found.description;
    }
  }
  
  return rules[0].description;
}

interface UseWeaknessDetectionResult {
  weaknesses: TopicWeakness[];
  isLoading: boolean;
  hasWeaknesses: boolean;
  criticalCount: number;
  atRiskCount: number;
  watchCount: number;
}

export function useWeaknessDetection(roadmapId: string = 'dsa'): UseWeaknessDetectionResult {
  const { data: roadmapData, isLoading: roadmapLoading } = useRoadmapWithProgress(roadmapId);
  const { data: revisionData, isLoading: revisionLoading } = useRevisionQueue();

  const weaknesses = useMemo(() => {
    if (!roadmapData?.topics) return [];

    const revisionItems = revisionData || [];
    const topicWeaknesses: TopicWeakness[] = [];

    for (const topic of roadmapData.topics) {
      const triggeredRules: WeaknessRuleDetails[] = [];

      // Rule: Stuck Too Long
      // Topic IN_PROGRESS for more than 14 days
      if (topic.state === 'in_progress' && topic.started_at) {
        const daysInProgress = differenceInDays(new Date(), new Date(topic.started_at));
        if (daysInProgress > 14) {
          triggeredRules.push({
            rule: 'stuck_too_long',
            ...RULE_DETAILS.stuck_too_long,
          });
        }
      }

      // Rule: Missed Revisions
      // 2+ MISSED or overdue revisions for topic
      const topicRevisions = revisionItems.filter(
        (r: any) => r.topic?.toLowerCase() === topic.topic_name.toLowerCase()
      );
      const missedRevisions = topicRevisions.filter((r: any) => r.status === 'overdue');
      if (missedRevisions.length >= 2) {
        triggeredRules.push({
          rule: 'missed_revisions',
          ...RULE_DETAILS.missed_revisions,
        });
      }

      // Rule: Skipped Depth
      // Topic COMPLETED but no problems marked for revision
      if (topic.state === 'completed') {
        const hasRevisions = topicRevisions.length > 0;
        if (!hasRevisions) {
          triggeredRules.push({
            rule: 'skipped_depth',
            ...RULE_DETAILS.skipped_depth,
          });
        }
      }

      // Note: low_accuracy and high_retry_count require problem-level tracking
      // which is not yet implemented. These rules will be added when that data exists.

      // Only add to weaknesses if at least one rule triggered
      if (triggeredRules.length > 0) {
        topicWeaknesses.push({
          topicId: topic.id,
          topicName: topic.topic_name,
          triggeredRules,
          severity: getSeverity(triggeredRules.length),
          primaryReason: getPrimaryReason(triggeredRules),
        });
      }
    }

    // Sort by severity (critical first, then at_risk, then watch)
    const severityOrder: Record<SeverityLevel, number> = {
      critical: 0,
      at_risk: 1,
      watch: 2,
    };

    return topicWeaknesses.sort((a, b) => 
      severityOrder[a.severity] - severityOrder[b.severity]
    );
  }, [roadmapData, revisionData]);

  const criticalCount = weaknesses.filter(w => w.severity === 'critical').length;
  const atRiskCount = weaknesses.filter(w => w.severity === 'at_risk').length;
  const watchCount = weaknesses.filter(w => w.severity === 'watch').length;

  return {
    weaknesses,
    isLoading: roadmapLoading || revisionLoading,
    hasWeaknesses: weaknesses.length > 0,
    criticalCount,
    atRiskCount,
    watchCount,
  };
}
