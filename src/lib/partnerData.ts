// Lock-In Partner Program Data Types & Helper Functions
// All mock data has been removed — data is fetched from Supabase

export type PartnerGoal = 'big_tech' | 'product' | 'oa_sprint' | 'placement';
export type PartnerFocus = 'medium_focused' | 'topic_focused' | 'company_focused';
export type PartnerPace = 'fast' | 'steady' | 'slow_deep';
export type CommStyle = 'chat_only' | 'voice_weekends' | 'text_summaries';
export type AccountabilityStyle = 'strict' | 'supportive' | 'mixed';
export type Language = 'cpp' | 'java' | 'python';
export type ReliabilityTier = 'platinum' | 'gold' | 'silver' | 'bronze' | 'unranked';
export type ContractStatus = 'pending' | 'active' | 'completed' | 'abandoned';
export type MissionStatus = 'pending' | 'completed' | 'missed' | 'recovery';
export type TrialFormat = 'trial_a' | 'trial_b' | 'trial_c';

export interface TimeSlot {
  day: string;
  start: string;
  end: string;
}

export interface TrainingCard {
  id: string;
  userId: string;
  goal: PartnerGoal;
  focus: PartnerFocus;
  currentLevel: {
    solvedCount: number;
    internalRating: number;
    contestRating?: number;
  };
  dailyCommitment: 30 | 60 | 90;
  preferredSlots: TimeSlot[];
  language: Language;
  pace: PartnerPace;
  commStyle: CommStyle;
  accountabilityStyle: AccountabilityStyle;
  noGhostingRule: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  reliabilityScore: number;
  reliabilityTier: ReliabilityTier;
  disciplineScore: number;
  chemistryScore: number;
  clutchScore: number;
  completedContracts: number;
  totalContracts: number;
  currentStreak: number;
  bestStreak: number;
  trainingCard?: TrainingCard;
  lastActive: string;
}

export interface MatchSuggestion {
  id: string;
  partner: PartnerProfile;
  compatibilityScore: number;
  matchReasons: string[];
  isOnline: boolean;
}

export interface DailyMission {
  id: string;
  contractId: string;
  userId: string;
  date: string;
  tasks: {
    id: string;
    type: 'new_problem' | 'revision' | 'trial_prep';
    title: string;
    problemId?: string;
    status: MissionStatus;
    completedAt?: string;
  }[];
  status: MissionStatus;
}

export interface Contract {
  id: string;
  partnerAId: string;
  partnerBId: string;
  partnerA: PartnerProfile;
  partnerB: PartnerProfile;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  dailyTarget: number;
  duoStreak: number;
  disciplineDebt: {
    userId: string;
    taskCount: number;
  }[];
  gapList: string[];
  nextTrialDate: string;
  nextTrialFormat: TrialFormat;
  missions: DailyMission[];
  createdAt: string;
}

export interface Trial {
  id: string;
  contractId: string;
  format: TrialFormat;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  duration: number;
  problems: {
    id: string;
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic: string;
    solved: boolean;
    timeTaken?: number;
  }[];
  results: {
    odlyjerId: string;
    score: number;
    problemsSolved: number;
    qualified: boolean;
  }[];
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface TrialReport {
  id: string;
  trialId: string;
  contractId: string;
  generatedAt: string;
  timeLostBreakdown: {
    category: string;
    minutes: number;
    percentage: number;
  }[];
  wrongAttemptPatterns: {
    pattern: string;
    frequency: number;
    examples: string[];
  }[];
  revisionPlan: {
    day3: string[];
    day7: string[];
    day21: string[];
  };
  nextWeekPlan: {
    focus: string;
    dailyTarget: number;
    trialFormat: TrialFormat;
  };
  qualified: boolean;
}

export interface NudgeEvent {
  id: string;
  userId: string;
  contractId: string;
  type: 'reminder' | 'warning' | 'recovery' | 'rematch_offer';
  message: string;
  missedDays: number;
  createdAt: string;
  dismissed: boolean;
}

// Helper functions
export const getReliabilityTier = (score: number): ReliabilityTier => {
  if (score >= 95) return 'platinum';
  if (score >= 85) return 'gold';
  if (score >= 70) return 'silver';
  if (score >= 50) return 'bronze';
  return 'unranked';
};

export const getGoalLabel = (goal: PartnerGoal): string => {
  const labels: Record<PartnerGoal, string> = {
    big_tech: 'Big Tech',
    product: 'Product Companies',
    oa_sprint: 'OA Sprint',
    placement: 'Placement Season'
  };
  return labels[goal];
};

export const getFocusLabel = (focus: PartnerFocus): string => {
  const labels: Record<PartnerFocus, string> = {
    medium_focused: 'Medium-Focused',
    topic_focused: 'Topic-Focused',
    company_focused: 'Company-Focused'
  };
  return labels[focus];
};

export const getPaceLabel = (pace: PartnerPace): string => {
  const labels: Record<PartnerPace, string> = {
    fast: 'Fast',
    steady: 'Steady',
    slow_deep: 'Slow + Deep'
  };
  return labels[pace];
};

export const getLanguageLabel = (lang: Language): string => {
  const labels: Record<Language, string> = {
    cpp: 'C++',
    java: 'Java',
    python: 'Python'
  };
  return labels[lang];
};

export const getTrialFormatLabel = (format: TrialFormat): string => {
  const labels: Record<TrialFormat, string> = {
    trial_a: '2 Mediums, 60 min',
    trial_b: '1 Medium + 1 OA-style, 75 min',
    trial_c: '3 problems from weak topic'
  };
  return labels[format];
};
