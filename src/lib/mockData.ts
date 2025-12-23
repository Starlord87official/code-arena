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
  // Enhanced problem details
  problemStatement: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  hints?: string[];
  rankImpact: { win: number; loss: number };
  timeLimit: number; // in minutes
  isDaily?: boolean;
  expiresIn?: number; // hours until daily expires
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

// Mock challenges with enhanced data
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
    problemStatement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Your mission:** Prove you can handle the basics. This is where champions begin.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    hints: ['A brute force approach has O(n²) complexity. Can you do better?', 'Consider using a hash map to store visited values.'],
    rankImpact: { win: 1, loss: 0 },
    timeLimit: 30,
    isDaily: true,
    expiresIn: 4,
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
    problemStatement: `Given the root of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

**Your mission:** Navigate the tree with precision. Weak recursion will be exposed.`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3', explanation: 'The tree has a maximum depth of 3.' },
      { input: 'root = [1,null,2]', output: '2' },
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 10^4].',
      '-100 <= Node.val <= 100',
    ],
    hints: ['Think recursively: the depth of a tree is 1 + max(depth of left, depth of right).'],
    rankImpact: { win: 2, loss: 1 },
    timeLimit: 45,
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
    problemStatement: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

But here is the twist: you must also track the maximum steps taken in a single move across all paths.

**Your mission:** This separates the elite from the average. Brute force will fail. Only optimal DP solutions survive.`,
    examples: [
      { input: 'n = 2', output: '2', explanation: '1. 1 step + 1 step\n2. 2 steps' },
      { input: 'n = 3', output: '3', explanation: '1. 1+1+1\n2. 1+2\n3. 2+1' },
      { input: 'n = 45', output: '1836311903' },
    ],
    constraints: [
      '1 <= n <= 45',
      'Your solution must run in O(n) time.',
      'Memory usage will be monitored.',
    ],
    hints: ['This is a classic Fibonacci sequence problem.', 'Can you optimize space to O(1)?'],
    rankImpact: { win: 5, loss: 2 },
    timeLimit: 60,
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
    problemStatement: `You are given a network of n nodes, labeled from 1 to n. You are also given times, a list of travel times as directed edges times[i] = (ui, vi, wi).

Find the minimum time it takes for all nodes to receive a signal sent from a starting node k. If it is impossible for all nodes to receive the signal, return -1.

**Your mission:** Master Dijkstra's algorithm. The weak fall here.`,
    examples: [
      { input: 'times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2', output: '2' },
      { input: 'times = [[1,2,1]], n = 2, k = 1', output: '1' },
      { input: 'times = [[1,2,1]], n = 2, k = 2', output: '-1' },
    ],
    constraints: [
      '1 <= k <= n <= 100',
      '1 <= times.length <= 6000',
      '1 <= ui, vi <= n',
      'ui != vi',
      '0 <= wi <= 100',
    ],
    rankImpact: { win: 6, loss: 3 },
    timeLimit: 75,
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
    problemStatement: `Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.

Note that the same word in the dictionary may be reused multiple times in the segmentation.

**Your mission:** This is the ultimate test. 92% fail. The elite 8% prove their worth here. There are no second chances.`,
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true', explanation: 'Return true because "leetcode" can be segmented as "leet code".' },
      { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: 'true', explanation: 'Return true because "applepenapple" can be segmented as "apple pen apple".' },
      { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: 'false' },
    ],
    constraints: [
      '1 <= s.length <= 300',
      '1 <= wordDict.length <= 1000',
      '1 <= wordDict[i].length <= 20',
      's and wordDict[i] consist of only lowercase English letters.',
      'All strings in wordDict are unique.',
    ],
    hints: ['Consider using dynamic programming with memoization.', 'Think about what subproblems you need to solve.'],
    rankImpact: { win: 15, loss: 5 },
    timeLimit: 90,
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
    problemStatement: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.

**Your mission:** Simple, but precision matters. Show you can execute the fundamentals flawlessly.`,
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
    ],
    constraints: [
      '1 <= s.length <= 10^5',
      's[i] is a printable ascii character.',
    ],
    rankImpact: { win: 1, loss: 0 },
    timeLimit: 20,
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
    problemStatement: `Given the head of a singly linked list, reverse the list, and return the reversed list.

**Your mission:** Pointer manipulation separates junior devs from senior engineers. Which are you?`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
      { input: 'head = []', output: '[]' },
    ],
    constraints: [
      'The number of nodes in the list is in the range [0, 5000].',
      '-5000 <= Node.val <= 5000',
    ],
    hints: ['You can solve this iteratively or recursively.', 'Track three pointers: prev, current, and next.'],
    rankImpact: { win: 3, loss: 1 },
    timeLimit: 40,
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
    problemStatement: `Design a class to find the kth largest element in a stream. Note that it is the kth largest element in the sorted order, not the kth distinct element.

Implement KthLargest class:
- KthLargest(int k, int[] nums) Initializes the object with the integer k and the stream of integers nums.
- int add(int val) Appends the integer val to the stream and returns the element representing the kth largest element in the stream.

**Your mission:** Heap mastery is required. Inefficient solutions will time out. Only optimal approaches survive.`,
    examples: [
      { input: '["KthLargest", "add", "add", "add", "add", "add"]\n[[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]]', output: '[null, 4, 5, 5, 8, 8]', explanation: 'Maintaining top k elements efficiently.' },
    ],
    constraints: [
      '1 <= k <= 10^4',
      '0 <= nums.length <= 10^4',
      '-10^4 <= nums[i] <= 10^4',
      '-10^4 <= val <= 10^4',
      'At most 10^4 calls will be made to add.',
    ],
    rankImpact: { win: 5, loss: 2 },
    timeLimit: 60,
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
