// Clan vs Clan Battle System Mock Data

export interface BattleClan {
  id: string;
  name: string;
  mentorName: string;
  mentorAvatar: string;
  totalXP: number;
  battleScore: number;
  status: 'leading' | 'trailing' | 'tied' | 'at-risk';
  memberCount: number;
}

export interface BattleContributor {
  id: string;
  username: string;
  avatar: string;
  xpGained: number;
  problemsSolved: number;
  rank: number;
  streak: boolean;
}

export interface BattleProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  status: 'locked' | 'unlocked' | 'solved-a' | 'solved-b' | 'solved-both';
  solveProgressA: number; // percentage of Clan A members who solved
  solveProgressB: number; // percentage of Clan B members who solved
  firstBlood?: 'A' | 'B';
}

export interface BattleFeedMessage {
  id: string;
  message: string;
  type: 'lead-change' | 'solve' | 'streak' | 'clutch' | 'milestone' | 'warning';
  timestamp: Date;
  clan?: 'A' | 'B';
}

export interface BattleChatMessage {
  id: string;
  clanId: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  type: 'message' | 'mentor' | 'command' | 'reaction';
  timestamp: Date;
}

export interface MentorCommand {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface ClanBattle {
  id: string;
  status: 'live' | 'upcoming' | 'ended';
  startTime: Date;
  endTime: Date;
  clanA: BattleClan;
  clanB: BattleClan;
  problems: BattleProblem[];
  winner?: 'A' | 'B' | 'tie';
}

// Mock Battle Data
export const mockBattle: ClanBattle = {
  id: 'battle-001',
  status: 'live',
  startTime: new Date(Date.now() - 45 * 60 * 1000), // Started 45 mins ago
  endTime: new Date(Date.now() + 32 * 60 * 1000 + 14 * 1000), // 32:14 remaining
  clanA: {
    id: 'clan-001',
    name: 'Algorithm Elite',
    mentorName: 'AlgorithmMaster',
    mentorAvatar: 'AM',
    totalXP: 125400,
    battleScore: 2850,
    status: 'leading',
    memberCount: 42,
  },
  clanB: {
    id: 'clan-002',
    name: 'System Builders',
    mentorName: 'SystemArchitect',
    mentorAvatar: 'SA',
    totalXP: 98700,
    battleScore: 2420,
    status: 'trailing',
    memberCount: 38,
  },
  problems: [
    {
      id: 'bp-001',
      title: 'Two Sum Variant',
      difficulty: 'Easy',
      xpReward: 100,
      status: 'solved-both',
      solveProgressA: 85,
      solveProgressB: 78,
      firstBlood: 'A',
    },
    {
      id: 'bp-002',
      title: 'Sliding Window Maximum',
      difficulty: 'Medium',
      xpReward: 200,
      status: 'solved-both',
      solveProgressA: 62,
      solveProgressB: 55,
      firstBlood: 'A',
    },
    {
      id: 'bp-003',
      title: 'DP-3: Longest Path',
      difficulty: 'Medium',
      xpReward: 250,
      status: 'solved-a',
      solveProgressA: 45,
      solveProgressB: 32,
      firstBlood: 'A',
    },
    {
      id: 'bp-004',
      title: 'Graph Coloring',
      difficulty: 'Hard',
      xpReward: 400,
      status: 'unlocked',
      solveProgressA: 12,
      solveProgressB: 8,
    },
    {
      id: 'bp-005',
      title: 'Advanced Tree DP',
      difficulty: 'Hard',
      xpReward: 500,
      status: 'locked',
      solveProgressA: 0,
      solveProgressB: 0,
    },
  ],
};

export const mockContributorsA: BattleContributor[] = [
  { id: 'c-001', username: 'BinaryBoss', avatar: 'BB', xpGained: 650, problemsSolved: 4, rank: 1, streak: true },
  { id: 'c-002', username: 'DataDriven', avatar: 'DD', xpGained: 550, problemsSolved: 3, rank: 2, streak: true },
  { id: 'c-003', username: 'CodeWarrior', avatar: 'CW', xpGained: 450, problemsSolved: 3, rank: 3, streak: false },
  { id: 'c-004', username: 'AlgoNinja', avatar: 'AN', xpGained: 350, problemsSolved: 2, rank: 4, streak: false },
  { id: 'c-005', username: 'RecursiveRex', avatar: 'RR', xpGained: 250, problemsSolved: 2, rank: 5, streak: false },
];

export const mockContributorsB: BattleContributor[] = [
  { id: 'c-011', username: 'ScaleSeeker', avatar: 'SS', xpGained: 580, problemsSolved: 3, rank: 1, streak: true },
  { id: 'c-012', username: 'DistribDev', avatar: 'DV', xpGained: 480, problemsSolved: 3, rank: 2, streak: false },
  { id: 'c-013', username: 'CacheKing', avatar: 'CK', xpGained: 380, problemsSolved: 2, rank: 3, streak: false },
  { id: 'c-014', username: 'ShardMaster', avatar: 'SM', xpGained: 280, problemsSolved: 2, rank: 4, streak: false },
  { id: 'c-015', username: 'LoadBalancer', avatar: 'LB', xpGained: 180, problemsSolved: 1, rank: 5, streak: false },
];

export const mockBattleFeed: BattleFeedMessage[] = [
  { id: 'f-001', message: 'Algorithm Elite takes the lead!', type: 'lead-change', timestamp: new Date(Date.now() - 2 * 60 * 1000), clan: 'A' },
  { id: 'f-002', message: 'BinaryBoss is on a 4-problem streak 🔥', type: 'streak', timestamp: new Date(Date.now() - 5 * 60 * 1000), clan: 'A' },
  { id: 'f-003', message: 'System Builders lost 120 XP on timeout', type: 'warning', timestamp: new Date(Date.now() - 8 * 60 * 1000), clan: 'B' },
  { id: 'f-004', message: 'First blood on DP-3 goes to Algorithm Elite!', type: 'solve', timestamp: new Date(Date.now() - 12 * 60 * 1000), clan: 'A' },
  { id: 'f-005', message: 'ScaleSeeker clutch solve under 30 seconds!', type: 'clutch', timestamp: new Date(Date.now() - 15 * 60 * 1000), clan: 'B' },
  { id: 'f-006', message: '50% of problems completed', type: 'milestone', timestamp: new Date(Date.now() - 20 * 60 * 1000) },
  { id: 'f-007', message: 'System Builders takes the lead!', type: 'lead-change', timestamp: new Date(Date.now() - 25 * 60 * 1000), clan: 'B' },
  { id: 'f-008', message: 'Battle started! May the best clan win.', type: 'milestone', timestamp: new Date(Date.now() - 45 * 60 * 1000) },
];

export const mockClanChat: BattleChatMessage[] = [
  { id: 'bc-001', clanId: 'clan-001', userId: 'mentor-001', username: 'AlgorithmMaster', avatar: 'AM', content: 'Focus on DP-3, we can close this out!', type: 'mentor', timestamp: new Date(Date.now() - 3 * 60 * 1000) },
  { id: 'bc-002', clanId: 'clan-001', userId: 'c-001', username: 'BinaryBoss', avatar: 'BB', content: 'On it! Almost done with Graph Coloring', type: 'message', timestamp: new Date(Date.now() - 2 * 60 * 1000) },
  { id: 'bc-003', clanId: 'clan-001', userId: 'c-002', username: 'DataDriven', avatar: 'DD', content: '🔥', type: 'reaction', timestamp: new Date(Date.now() - 90 * 1000) },
  { id: 'bc-004', clanId: 'clan-001', userId: 'c-003', username: 'CodeWarrior', avatar: 'CW', content: 'Graph Coloring needs greedy approach, not DP', type: 'message', timestamp: new Date(Date.now() - 60 * 1000) },
  { id: 'bc-005', clanId: 'clan-001', userId: 'mentor-001', username: 'AlgorithmMaster', avatar: 'AM', content: '⚡ CLUTCH MODE ACTIVATED', type: 'command', timestamp: new Date(Date.now() - 30 * 1000) },
];

export const mentorCommands: MentorCommand[] = [
  { id: 'cmd-001', label: 'Focus on DP-3', icon: 'Target', description: 'Direct team to prioritize DP-3 problem' },
  { id: 'cmd-002', label: 'All members push now', icon: 'Zap', description: 'Signal for maximum effort' },
  { id: 'cmd-003', label: 'Hold submissions', icon: 'Hand', description: 'Wait for review before submitting' },
  { id: 'cmd-004', label: 'Clutch mode activated', icon: 'Flame', description: 'Final push - all out effort' },
];

// Helper functions
export function getBattleMomentum(battle: ClanBattle): number {
  const total = battle.clanA.battleScore + battle.clanB.battleScore;
  if (total === 0) return 50;
  return Math.round((battle.clanA.battleScore / total) * 100);
}

export function getTimeRemaining(endTime: Date): { minutes: number; seconds: number } {
  const diff = endTime.getTime() - Date.now();
  if (diff <= 0) return { minutes: 0, seconds: 0 };
  return {
    minutes: Math.floor(diff / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function getDifficultyColor(difficulty: 'Easy' | 'Medium' | 'Hard'): string {
  switch (difficulty) {
    case 'Easy': return 'text-status-success bg-status-success/20 border-status-success/30';
    case 'Medium': return 'text-status-warning bg-status-warning/20 border-status-warning/30';
    case 'Hard': return 'text-destructive bg-destructive/20 border-destructive/30';
  }
}

export function getStatusColor(status: BattleClan['status']): string {
  switch (status) {
    case 'leading': return 'text-status-success';
    case 'trailing': return 'text-muted-foreground';
    case 'tied': return 'text-status-warning';
    case 'at-risk': return 'text-destructive';
  }
}
