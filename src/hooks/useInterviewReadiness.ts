import { useMemo } from 'react';
import { useRoadmapWithProgress } from '@/hooks/useRoadmap';
import { useWeaknessDetection } from '@/hooks/useWeaknessDetection';
import { useRevisionQueue } from '@/hooks/useRevisionQueue';
import { useTargets } from '@/hooks/useTargets';

export type ScoreBand = 'not_ready' | 'weak_foundation' | 'partially_ready' | 'interview_ready' | 'strong_candidate';
export type ScoreTrend = 'up' | 'down' | 'stable';

export interface ScoreBreakdown {
  category: string;
  weight: number;
  score: number;
  weightedScore: number;
  reasons: string[];
}

export interface InterviewReadinessResult {
  score: number;
  band: ScoreBand;
  label: string;
  trend: ScoreTrend;
  breakdown: ScoreBreakdown[];
  isLoading: boolean;
}

const BAND_CONFIG: Record<ScoreBand, { min: number; max: number; label: string; color: string }> = {
  not_ready: { min: 0, max: 30, label: 'Early Stage — Building Foundations', color: 'text-muted-foreground' },
  weak_foundation: { min: 31, max: 50, label: 'Developing Skills', color: 'text-orange-500' },
  partially_ready: { min: 51, max: 70, label: 'Partially Ready', color: 'text-yellow-500' },
  interview_ready: { min: 71, max: 85, label: 'Interview Ready', color: 'text-green-500' },
  strong_candidate: { min: 86, max: 100, label: 'Strong Candidate', color: 'text-primary' },
};

function getScoreBand(score: number): ScoreBand {
  if (score <= 30) return 'not_ready';
  if (score <= 50) return 'weak_foundation';
  if (score <= 70) return 'partially_ready';
  if (score <= 85) return 'interview_ready';
  return 'strong_candidate';
}

export function getBandConfig(band: ScoreBand) {
  return BAND_CONFIG[band];
}

export function useInterviewReadiness(roadmapId: string = 'dsa'): InterviewReadinessResult {
  const { data: roadmapData, isLoading: roadmapLoading } = useRoadmapWithProgress(roadmapId);
  const { weaknesses, isLoading: weaknessLoading, criticalCount, atRiskCount, watchCount } = useWeaknessDetection(roadmapId);
  const { data: revisionData, isLoading: revisionLoading } = useRevisionQueue();
  const { progress, streak, activity, isLoading: activityLoading } = useTargets();

  const result = useMemo(() => {
    const breakdown: ScoreBreakdown[] = [];
    
    // 1. Roadmap Completion (30%)
    const roadmapWeight = 30;
    let roadmapScore = 0;
    const roadmapReasons: string[] = [];
    
    if (roadmapData) {
      const completionRate = roadmapData.progressPercentage;
      roadmapScore = completionRate;
      
      if (completionRate === 100) {
        roadmapReasons.push('All topics completed ✓');
      } else if (completionRate >= 75) {
        roadmapReasons.push(`${completionRate}% roadmap completed`);
      } else if (completionRate >= 50) {
        roadmapReasons.push(`${completionRate}% completed - keep going!`);
      } else if (completionRate > 0) {
        roadmapReasons.push(`Only ${completionRate}% completed`);
      } else {
        roadmapReasons.push('No topics completed yet');
        roadmapScore = 0;
      }
    }
    
    breakdown.push({
      category: 'Roadmap Completion',
      weight: roadmapWeight,
      score: roadmapScore,
      weightedScore: (roadmapScore / 100) * roadmapWeight,
      reasons: roadmapReasons,
    });

    // 2. Topic Health (25%) - Based on weakness engine
    const topicHealthWeight = 25;
    let topicHealthScore = 100;
    const topicHealthReasons: string[] = [];
    
    // Penalize based on weaknesses
    const criticalPenalty = criticalCount * 25;
    const atRiskPenalty = atRiskCount * 15;
    const watchPenalty = watchCount * 5;
    
    topicHealthScore = Math.max(0, 100 - criticalPenalty - atRiskPenalty - watchPenalty);
    
    if (criticalCount > 0) {
      topicHealthReasons.push(`${criticalCount} critical topic(s) need attention`);
    }
    if (atRiskCount > 0) {
      topicHealthReasons.push(`${atRiskCount} topic(s) at risk`);
    }
    if (watchCount > 0) {
      topicHealthReasons.push(`${watchCount} topic(s) to watch`);
    }
    if (topicHealthScore === 100) {
      topicHealthReasons.push('All topics are healthy ✓');
    }
    
    breakdown.push({
      category: 'Topic Health',
      weight: topicHealthWeight,
      score: topicHealthScore,
      weightedScore: (topicHealthScore / 100) * topicHealthWeight,
      reasons: topicHealthReasons,
    });

    // 3. Revision Discipline (20%)
    const revisionWeight = 20;
    let revisionScore = 50; // Base score
    const revisionReasons: string[] = [];
    
    const revisionItems = revisionData || [];
    const totalRevisions = revisionItems.length;
    const overdueRevisions = revisionItems.filter((r: any) => r.status === 'overdue').length;
    const completedRevisions = revisionItems.filter((r: any) => r.status === 'completed').length;
    
    if (totalRevisions === 0) {
      revisionScore = 30;
      revisionReasons.push('No problems marked for revision');
    } else {
      // Start with base of 50, adjust based on behavior
      const overdueRate = overdueRevisions / totalRevisions;
      
      if (overdueRate > 0.5) {
        revisionScore = 20;
        revisionReasons.push(`${overdueRevisions} overdue revisions`);
      } else if (overdueRate > 0.25) {
        revisionScore = 50;
        revisionReasons.push('Some revisions are overdue');
      } else if (overdueRate > 0) {
        revisionScore = 70;
        revisionReasons.push('Few revisions pending');
      } else {
        revisionScore = 90;
        revisionReasons.push('Revision schedule on track ✓');
      }
      
      // Bonus for having revisions scheduled
      if (totalRevisions >= 10) {
        revisionScore = Math.min(100, revisionScore + 10);
        revisionReasons.push('Active revision practice ✓');
      }
    }
    
    breakdown.push({
      category: 'Revision Discipline',
      weight: revisionWeight,
      score: revisionScore,
      weightedScore: (revisionScore / 100) * revisionWeight,
      reasons: revisionReasons,
    });

    // 4. Practice Quality (15%)
    // Note: This requires problem difficulty tracking which isn't fully implemented
    // Using roadmap depth as a proxy for now
    const practiceWeight = 15;
    let practiceScore = 50;
    const practiceReasons: string[] = [];
    
    if (roadmapData) {
      const completedTopics = roadmapData.topics.filter(t => t.state === 'completed').length;
      const inProgressTopics = roadmapData.topics.filter(t => t.state === 'in_progress').length;
      
      // Check if completed topics have revisions (indicating depth)
      const topicsWithRevisions = new Set(
        revisionItems.map((r: any) => r.topic?.toLowerCase()).filter(Boolean)
      );
      
      const completedWithDepth = roadmapData.topics
        .filter(t => t.state === 'completed')
        .filter(t => topicsWithRevisions.has(t.topic_name.toLowerCase()))
        .length;
      
      if (completedTopics > 0) {
        const depthRate = completedWithDepth / completedTopics;
        practiceScore = Math.round(40 + (depthRate * 60));
        
        if (depthRate >= 0.8) {
          practiceReasons.push('Good practice depth across topics ✓');
        } else if (depthRate >= 0.5) {
          practiceReasons.push('Moderate practice depth');
        } else {
          practiceReasons.push('Consider deeper practice per topic');
        }
      } else {
        practiceScore = 30;
        practiceReasons.push('Start completing topics for practice data');
      }
    }
    
    breakdown.push({
      category: 'Practice Quality',
      weight: practiceWeight,
      score: practiceScore,
      weightedScore: (practiceScore / 100) * practiceWeight,
      reasons: practiceReasons,
    });

    // 5. Consistency (10%)
    const consistencyWeight = 10;
    let consistencyScore = 0;
    const consistencyReasons: string[] = [];
    
    // Use streak and recent activity
    if (streak >= 30) {
      consistencyScore = 100;
      consistencyReasons.push(`${streak} day streak - excellent! ✓`);
    } else if (streak >= 14) {
      consistencyScore = 85;
      consistencyReasons.push(`${streak} day streak - great consistency`);
    } else if (streak >= 7) {
      consistencyScore = 70;
      consistencyReasons.push(`${streak} day streak - building momentum`);
    } else if (streak >= 3) {
      consistencyScore = 50;
      consistencyReasons.push(`${streak} day streak`);
    } else if (streak >= 1) {
      consistencyScore = 30;
      consistencyReasons.push('Just started - keep it up!');
    } else {
      consistencyScore = 10;
      consistencyReasons.push('No active streak');
    }
    
    // Check recent activity (last 7 days from heatmap)
    const recentActivity = activity.slice(-7);
    const activeDays = recentActivity.filter((a: any) => a.count > 0).length;
    if (activeDays >= 5) {
      consistencyScore = Math.min(100, consistencyScore + 15);
      consistencyReasons.push('Active 5+ days this week ✓');
    }
    
    breakdown.push({
      category: 'Consistency',
      weight: consistencyWeight,
      score: consistencyScore,
      weightedScore: (consistencyScore / 100) * consistencyWeight,
      reasons: consistencyReasons,
    });

    // Calculate total score
    const totalScore = Math.round(
      breakdown.reduce((sum, b) => sum + b.weightedScore, 0)
    );
    
    const band = getScoreBand(totalScore);
    
    // Trend calculation would require historical data
    // For now, use heuristics based on current state
    let trend: ScoreTrend = 'stable';
    if (streak >= 7 && overdueRevisions === 0) {
      trend = 'up';
    } else if (criticalCount > 0 || overdueRevisions > 3) {
      trend = 'down';
    }

    return {
      score: totalScore,
      band,
      label: BAND_CONFIG[band].label,
      trend,
      breakdown,
    };
  }, [roadmapData, weaknesses, criticalCount, atRiskCount, watchCount, revisionData, streak, activity]);

  const isLoading = roadmapLoading || weaknessLoading || revisionLoading || activityLoading;

  return {
    ...result,
    isLoading,
  };
}
