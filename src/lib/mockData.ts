// Mock user data for development
export interface User {
  uid: string;
  username: string;
  email: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  division: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'legend';
  elo: number;
  joinedAt: Date;
  solvedChallenges: number;
  rank: number;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  tags: string[];
  xpReward: number;
  description: string;
  solvedBy: number;
  successRate: number;
}

export interface Submission {
  id: string;
  userId: string;
  challengeId: string;
  status: 'passed' | 'failed' | 'pending';
  submittedAt: Date;
  language: string;
  runtime: number;
  memory: number;
}

export interface Contest {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  problems: string[];
  participants: number;
  status: 'upcoming' | 'live' | 'ended';
  xpReward: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'contest' | 'system' | 'streak' | 'duel' | 'admin' | 'xp' | 'rank';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  type: 'contest' | 'reminder' | 'deadline' | 'streak';
  date: Date;
  description: string;
}

// Mock current user
export const mockUser: User = {
  uid: 'user-001',
  username: 'CodeWarrior',
  email: 'warrior@codelock.io',
  avatar: '',
  xp: 4250,
  level: 12,
  streak: 7,
  division: 'diamond',
  elo: 1847,
  joinedAt: new Date('2024-01-15'),
  solvedChallenges: 87,
  rank: 156,
};

// Mock challenges
export const mockChallenges: Challenge[] = [
  {
    id: 'ch-001',
    title: 'Two Sum Annihilation',
    difficulty: 'easy',
    tags: ['arrays', 'hash-map'],
    xpReward: 50,
    description: 'Find two numbers that sum to a target. Destroy inefficiency.',
    solvedBy: 15420,
    successRate: 78,
  },
  {
    id: 'ch-002',
    title: 'Binary Tree Dominance',
    difficulty: 'medium',
    tags: ['trees', 'dfs', 'recursion'],
    xpReward: 100,
    description: 'Assert dominance over binary tree traversal. No weak solutions.',
    solvedBy: 8930,
    successRate: 54,
  },
  {
    id: 'ch-003',
    title: 'Dynamic Programming Ego',
    difficulty: 'hard',
    tags: ['dp', 'optimization'],
    xpReward: 200,
    description: 'Only those with true ego can solve this DP problem optimally.',
    solvedBy: 2340,
    successRate: 28,
  },
  {
    id: 'ch-004',
    title: 'Graph Conquest',
    difficulty: 'hard',
    tags: ['graphs', 'bfs', 'shortest-path'],
    xpReward: 250,
    description: 'Conquer the graph. Find the shortest path to victory.',
    solvedBy: 1890,
    successRate: 32,
  },
  {
    id: 'ch-005',
    title: 'The Ultimate Recursion',
    difficulty: 'extreme',
    tags: ['recursion', 'memoization', 'advanced'],
    xpReward: 500,
    description: 'Only legends complete this. There is only one #1.',
    solvedBy: 234,
    successRate: 8,
  },
  {
    id: 'ch-006',
    title: 'String Manipulation Arena',
    difficulty: 'easy',
    tags: ['strings', 'manipulation'],
    xpReward: 40,
    description: 'Master the basics of string manipulation.',
    solvedBy: 18920,
    successRate: 85,
  },
  {
    id: 'ch-007',
    title: 'Linked List Warfare',
    difficulty: 'medium',
    tags: ['linked-list', 'pointers'],
    xpReward: 120,
    description: 'Navigate the battlefield of pointers and nodes.',
    solvedBy: 7650,
    successRate: 48,
  },
  {
    id: 'ch-008',
    title: 'Heap of Champions',
    difficulty: 'hard',
    tags: ['heap', 'priority-queue'],
    xpReward: 180,
    description: 'Build and manipulate heaps like a champion.',
    solvedBy: 3120,
    successRate: 35,
  },
];

// Mock leaderboard
export const mockLeaderboard: User[] = [
  { ...mockUser, uid: 'u1', username: 'AlphaStrike', xp: 28500, level: 45, division: 'legend', elo: 2847, rank: 1, solvedChallenges: 342, streak: 45 },
  { ...mockUser, uid: 'u2', username: 'BinaryBeast', xp: 24200, level: 42, division: 'legend', elo: 2756, rank: 2, solvedChallenges: 298, streak: 32 },
  { ...mockUser, uid: 'u3', username: 'CodeAssassin', xp: 21800, level: 38, division: 'master', elo: 2634, rank: 3, solvedChallenges: 276, streak: 28 },
  { ...mockUser, uid: 'u4', username: 'DevDestroyer', xp: 19500, level: 35, division: 'master', elo: 2512, rank: 4, solvedChallenges: 254, streak: 21 },
  { ...mockUser, uid: 'u5', username: 'EliteEncoder', xp: 17200, level: 32, division: 'diamond', elo: 2389, rank: 5, solvedChallenges: 231, streak: 19 },
  { ...mockUser, uid: 'u6', username: 'FlowMaster', xp: 15800, level: 30, division: 'diamond', elo: 2267, rank: 6, solvedChallenges: 212, streak: 15 },
  { ...mockUser, uid: 'u7', username: 'GridGladiator', xp: 14100, level: 28, division: 'diamond', elo: 2145, rank: 7, solvedChallenges: 198, streak: 12 },
  { ...mockUser, uid: 'u8', username: 'HashHunter', xp: 12500, level: 25, division: 'platinum', elo: 2023, rank: 8, solvedChallenges: 178, streak: 9 },
  { ...mockUser, uid: 'u9', username: 'IndexInferno', xp: 10200, level: 22, division: 'platinum', elo: 1901, rank: 9, solvedChallenges: 156, streak: 7 },
  { ...mockUser, uid: 'u10', username: 'JavaJuggernaut', xp: 8900, level: 20, division: 'gold', elo: 1779, rank: 10, solvedChallenges: 134, streak: 5 },
];

// Mock contests
export const mockContests: Contest[] = [
  {
    id: 'ct-001',
    title: 'Weekly Arena #47',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    problems: ['ch-001', 'ch-002', 'ch-003'],
    participants: 0,
    status: 'upcoming',
    xpReward: 500,
  },
  {
    id: 'ct-002',
    title: 'Speed Coding Blitz',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
    problems: ['ch-006', 'ch-007'],
    participants: 0,
    status: 'upcoming',
    xpReward: 300,
  },
  {
    id: 'ct-003',
    title: 'Elite Championship',
    startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    problems: ['ch-003', 'ch-004', 'ch-005', 'ch-008'],
    participants: 0,
    status: 'upcoming',
    xpReward: 1000,
  },
];

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: 'n-001',
    userId: 'user-001',
    type: 'contest',
    title: 'Weekly Arena #47 Starting Soon',
    message: 'The arena opens in 2 days. Prepare yourself.',
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'n-002',
    userId: 'user-001',
    type: 'streak',
    title: 'Streak On Fire! 🔥',
    message: 'You have a 7-day streak! Keep the fire burning.',
    read: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'n-003',
    userId: 'user-001',
    type: 'xp',
    title: '+200 XP Earned',
    message: 'You solved "Dynamic Programming Ego" and earned 200 XP!',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'n-004',
    userId: 'user-001',
    type: 'rank',
    title: 'Rank Up! Diamond Division',
    message: 'You have ascended to Diamond Division. Prove your worth.',
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'n-005',
    userId: 'user-001',
    type: 'system',
    title: 'New Challenges Available',
    message: '5 new challenges have been added to the arena.',
    read: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

// Mock calendar events
export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'ev-001',
    userId: 'user-001',
    title: 'Weekly Arena #47',
    type: 'contest',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    description: 'Weekly competitive contest with 3 problems.',
  },
  {
    id: 'ev-002',
    userId: 'user-001',
    title: 'Speed Coding Blitz',
    type: 'contest',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description: 'Fast-paced 1-hour contest.',
  },
  {
    id: 'ev-003',
    userId: 'user-001',
    title: 'Daily Streak Reminder',
    type: 'streak',
    date: new Date(),
    description: 'Complete at least one challenge to maintain your streak.',
  },
  {
    id: 'ev-004',
    userId: 'user-001',
    title: 'Elite Championship',
    type: 'contest',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    description: 'Major championship with 4 hard problems.',
  },
  {
    id: 'ev-005',
    userId: 'user-001',
    title: 'Practice Session',
    type: 'reminder',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    description: 'Scheduled practice for DP problems.',
  },
];

// Helper functions
export const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
  switch (difficulty) {
    case 'easy': return 'text-status-success';
    case 'medium': return 'text-status-warning';
    case 'hard': return 'text-destructive';
    case 'extreme': return 'text-rank-legend';
    default: return 'text-foreground';
  }
};

export const getDivisionColor = (division: User['division']) => {
  switch (division) {
    case 'bronze': return 'text-rank-bronze';
    case 'silver': return 'text-rank-silver';
    case 'gold': return 'text-rank-gold';
    case 'platinum': return 'text-rank-platinum';
    case 'diamond': return 'text-rank-diamond';
    case 'master': return 'text-rank-master';
    case 'legend': return 'text-rank-legend';
    default: return 'text-foreground';
  }
};

export const getDivisionAura = (division: User['division']) => {
  switch (division) {
    case 'bronze': return 'rank-aura-bronze';
    case 'silver': return 'rank-aura-silver';
    case 'gold': return 'rank-aura-gold';
    case 'platinum': return 'rank-aura-platinum';
    case 'diamond': return 'rank-aura-diamond';
    case 'master': return 'rank-aura-master';
    case 'legend': return 'rank-aura-legend';
    default: return '';
  }
};

export const getXpForNextLevel = (level: number) => level * 500;
export const getXpProgress = (xp: number, level: number) => {
  const currentLevelXp = (level - 1) * 500;
  const nextLevelXp = level * 500;
  return ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
};
