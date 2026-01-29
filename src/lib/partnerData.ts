// Lock-In Partner Program Data Types & Mock Data

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
  duration: number; // minutes
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

// Mock Data
export const mockPartnerProfiles: PartnerProfile[] = [
  {
    id: 'partner-1',
    username: 'arjun_dsa',
    avatarUrl: undefined,
    reliabilityScore: 92,
    reliabilityTier: 'gold',
    disciplineScore: 88,
    chemistryScore: 85,
    clutchScore: 78,
    completedContracts: 12,
    totalContracts: 14,
    currentStreak: 23,
    bestStreak: 45,
    lastActive: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    trainingCard: {
      id: 'card-1',
      userId: 'partner-1',
      goal: 'big_tech',
      focus: 'medium_focused',
      currentLevel: {
        solvedCount: 456,
        internalRating: 1842,
        contestRating: 1756
      },
      dailyCommitment: 90,
      preferredSlots: [
        { day: 'weekdays', start: '21:00', end: '23:00' },
        { day: 'weekends', start: '10:00', end: '13:00' }
      ],
      language: 'cpp',
      pace: 'fast',
      commStyle: 'voice_weekends',
      accountabilityStyle: 'strict',
      noGhostingRule: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    }
  },
  {
    id: 'partner-2',
    username: 'priya_codes',
    avatarUrl: undefined,
    reliabilityScore: 97,
    reliabilityTier: 'platinum',
    disciplineScore: 95,
    chemistryScore: 92,
    clutchScore: 88,
    completedContracts: 18,
    totalContracts: 18,
    currentStreak: 67,
    bestStreak: 67,
    lastActive: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    trainingCard: {
      id: 'card-2',
      userId: 'partner-2',
      goal: 'big_tech',
      focus: 'topic_focused',
      currentLevel: {
        solvedCount: 623,
        internalRating: 1956,
        contestRating: 1834
      },
      dailyCommitment: 60,
      preferredSlots: [
        { day: 'daily', start: '06:00', end: '08:00' }
      ],
      language: 'python',
      pace: 'steady',
      commStyle: 'text_summaries',
      accountabilityStyle: 'mixed',
      noGhostingRule: true,
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-22T09:15:00Z'
    }
  },
  {
    id: 'partner-3',
    username: 'rahul_sys',
    avatarUrl: undefined,
    reliabilityScore: 78,
    reliabilityTier: 'silver',
    disciplineScore: 72,
    chemistryScore: 80,
    clutchScore: 85,
    completedContracts: 6,
    totalContracts: 9,
    currentStreak: 8,
    bestStreak: 21,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    trainingCard: {
      id: 'card-3',
      userId: 'partner-3',
      goal: 'product',
      focus: 'company_focused',
      currentLevel: {
        solvedCount: 234,
        internalRating: 1456
      },
      dailyCommitment: 60,
      preferredSlots: [
        { day: 'weekdays', start: '19:00', end: '21:00' }
      ],
      language: 'java',
      pace: 'slow_deep',
      commStyle: 'chat_only',
      accountabilityStyle: 'supportive',
      noGhostingRule: true,
      createdAt: '2024-01-18T15:00:00Z',
      updatedAt: '2024-01-21T18:45:00Z'
    }
  },
  {
    id: 'partner-4',
    username: 'sneha_algo',
    avatarUrl: undefined,
    reliabilityScore: 85,
    reliabilityTier: 'gold',
    disciplineScore: 82,
    chemistryScore: 88,
    clutchScore: 75,
    completedContracts: 9,
    totalContracts: 11,
    currentStreak: 15,
    bestStreak: 34,
    lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    trainingCard: {
      id: 'card-4',
      userId: 'partner-4',
      goal: 'oa_sprint',
      focus: 'medium_focused',
      currentLevel: {
        solvedCount: 312,
        internalRating: 1678,
        contestRating: 1589
      },
      dailyCommitment: 90,
      preferredSlots: [
        { day: 'weekdays', start: '20:00', end: '22:30' },
        { day: 'weekends', start: '14:00', end: '18:00' }
      ],
      language: 'cpp',
      pace: 'fast',
      commStyle: 'voice_weekends',
      accountabilityStyle: 'strict',
      noGhostingRule: true,
      createdAt: '2024-01-12T11:00:00Z',
      updatedAt: '2024-01-23T16:20:00Z'
    }
  },
  {
    id: 'partner-5',
    username: 'vikram_prep',
    avatarUrl: undefined,
    reliabilityScore: 62,
    reliabilityTier: 'bronze',
    disciplineScore: 58,
    chemistryScore: 70,
    clutchScore: 65,
    completedContracts: 3,
    totalContracts: 7,
    currentStreak: 2,
    bestStreak: 12,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    trainingCard: {
      id: 'card-5',
      userId: 'partner-5',
      goal: 'placement',
      focus: 'topic_focused',
      currentLevel: {
        solvedCount: 145,
        internalRating: 1234
      },
      dailyCommitment: 30,
      preferredSlots: [
        { day: 'weekends', start: '16:00', end: '18:00' }
      ],
      language: 'python',
      pace: 'slow_deep',
      commStyle: 'chat_only',
      accountabilityStyle: 'supportive',
      noGhostingRule: false,
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-01-20T09:00:00Z'
    }
  }
];

export const mockCurrentUser: PartnerProfile = {
  id: 'current-user',
  username: 'you',
  reliabilityScore: 88,
  reliabilityTier: 'gold',
  disciplineScore: 85,
  chemistryScore: 82,
  clutchScore: 79,
  completedContracts: 8,
  totalContracts: 9,
  currentStreak: 12,
  bestStreak: 28,
  lastActive: new Date().toISOString(),
  trainingCard: {
    id: 'card-current',
    userId: 'current-user',
    goal: 'big_tech',
    focus: 'medium_focused',
    currentLevel: {
      solvedCount: 378,
      internalRating: 1723,
      contestRating: 1645
    },
    dailyCommitment: 60,
    preferredSlots: [
      { day: 'weekdays', start: '21:00', end: '23:00' }
    ],
    language: 'cpp',
    pace: 'steady',
    commStyle: 'voice_weekends',
    accountabilityStyle: 'mixed',
    noGhostingRule: true,
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-22T20:00:00Z'
  }
};

export const mockMatchSuggestions: MatchSuggestion[] = [
  {
    id: 'match-1',
    partner: mockPartnerProfiles[0],
    compatibilityScore: 94,
    matchReasons: ['Same time window', 'Same focus', 'Similar pace', 'Same target companies'],
    isOnline: true
  },
  {
    id: 'match-2',
    partner: mockPartnerProfiles[1],
    compatibilityScore: 89,
    matchReasons: ['Same focus', 'High reliability', 'Compatible schedule'],
    isOnline: true
  },
  {
    id: 'match-3',
    partner: mockPartnerProfiles[3],
    compatibilityScore: 82,
    matchReasons: ['Same time window', 'Similar level', 'Same language'],
    isOnline: false
  },
  {
    id: 'match-4',
    partner: mockPartnerProfiles[2],
    compatibilityScore: 75,
    matchReasons: ['Compatible schedule', 'Complementary skills'],
    isOnline: false
  }
];

// Active duo contract mock
export const mockActiveContract: Contract = {
  id: 'contract-active',
  partnerAId: 'current-user',
  partnerBId: 'partner-1',
  partnerA: mockCurrentUser,
  partnerB: mockPartnerProfiles[0],
  status: 'active',
  startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
  dailyTarget: 2,
  duoStreak: 3,
  disciplineDebt: [
    { userId: 'current-user', taskCount: 1 }
  ],
  gapList: ['Binary Search', 'Dynamic Programming', 'Graph Traversal'],
  nextTrialDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
  nextTrialFormat: 'trial_a',
  missions: [
    {
      id: 'mission-today',
      contractId: 'contract-active',
      userId: 'current-user',
      date: new Date().toISOString().split('T')[0],
      tasks: [
        {
          id: 'task-1',
          type: 'new_problem',
          title: 'Container With Most Water',
          problemId: 'prob-1',
          status: 'completed',
          completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: 'task-2',
          type: 'revision',
          title: 'Two Sum (Revision)',
          problemId: 'prob-2',
          status: 'pending'
        }
      ],
      status: 'pending'
    }
  ],
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
};

export const mockTrial: Trial = {
  id: 'trial-1',
  contractId: 'contract-active',
  format: 'trial_a',
  scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
  duration: 60,
  problems: [
    {
      id: 'trial-prob-1',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'medium',
      topic: 'Sliding Window',
      solved: false
    },
    {
      id: 'trial-prob-2',
      title: '3Sum',
      difficulty: 'medium',
      topic: 'Two Pointers',
      solved: false
    }
  ],
  results: [],
  status: 'scheduled'
};

export const mockTrialReport: TrialReport = {
  id: 'report-1',
  trialId: 'trial-past-1',
  contractId: 'contract-active',
  generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  timeLostBreakdown: [
    { category: 'Edge case handling', minutes: 12, percentage: 35 },
    { category: 'Initial approach selection', minutes: 8, percentage: 24 },
    { category: 'Debugging', minutes: 7, percentage: 21 },
    { category: 'Syntax errors', minutes: 4, percentage: 12 },
    { category: 'Other', minutes: 3, percentage: 8 }
  ],
  wrongAttemptPatterns: [
    {
      pattern: 'Off-by-one errors in loop bounds',
      frequency: 4,
      examples: ['Array index out of bounds', 'Missing last element']
    },
    {
      pattern: 'Incomplete edge case coverage',
      frequency: 3,
      examples: ['Empty input', 'Single element', 'Negative numbers']
    }
  ],
  revisionPlan: {
    day3: ['Two Pointers fundamentals', 'Edge case checklist review'],
    day7: ['Sliding Window patterns', 'Time complexity analysis'],
    day21: ['Full mock with similar problems', 'Speed optimization']
  },
  nextWeekPlan: {
    focus: 'Sliding Window + Two Pointers',
    dailyTarget: 2,
    trialFormat: 'trial_b'
  },
  qualified: true
};

export const mockNudgeEvents: NudgeEvent[] = [
  {
    id: 'nudge-1',
    userId: 'current-user',
    contractId: 'contract-active',
    type: 'reminder',
    message: 'You have 1 task in Discipline Debt. Clear it today to maintain your streak.',
    missedDays: 0,
    createdAt: new Date().toISOString(),
    dismissed: false
  }
];
