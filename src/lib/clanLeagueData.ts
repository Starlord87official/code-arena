// Clan League & Battle History System

export type ClanLeague = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legend';

export interface ClanLeagueInfo {
  league: ClanLeague;
  name: string;
  minXP: number;
  maxXP: number;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

export interface BattleHistory {
  id: string;
  date: Date;
  opponentClanId: string;
  opponentClanName: string;
  opponentMentorName: string;
  result: 'win' | 'loss' | 'draw';
  yourScore: number;
  opponentScore: number;
  xpChange: number;
  eloChange: number;
  mvpUsername: string;
  mvpXpGained: number;
  problemsSolved: number;
  totalProblems: number;
}

export interface BattleRequest {
  id: string;
  fromClanId: string;
  fromClanName: string;
  fromMentorName: string;
  toClanId: string;
  difficulty: 'easy' | 'mixed' | 'hard';
  problemCount: number;
  scheduledAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
}

export const leagueData: ClanLeagueInfo[] = [
  {
    league: 'bronze',
    name: 'Bronze',
    minXP: 0,
    maxXP: 50000,
    color: 'text-amber-600',
    bgColor: 'bg-amber-600/20',
    borderColor: 'border-amber-600/50',
    icon: '🥉',
  },
  {
    league: 'silver',
    name: 'Silver',
    minXP: 50000,
    maxXP: 100000,
    color: 'text-slate-300',
    bgColor: 'bg-slate-300/20',
    borderColor: 'border-slate-300/50',
    icon: '🥈',
  },
  {
    league: 'gold',
    name: 'Gold',
    minXP: 100000,
    maxXP: 200000,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    icon: '🥇',
  },
  {
    league: 'diamond',
    name: 'Diamond',
    minXP: 200000,
    maxXP: 500000,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/20',
    borderColor: 'border-cyan-400/50',
    icon: '💎',
  },
  {
    league: 'legend',
    name: 'Legend',
    minXP: 500000,
    maxXP: Infinity,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
    borderColor: 'border-purple-400/50',
    icon: '👑',
  },
];

// Mock Battle History for clan-001 (Algorithm Elite)
export const mockBattleHistory: BattleHistory[] = [
  {
    id: 'bh-001',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    opponentClanId: 'clan-002',
    opponentClanName: 'System Builders',
    opponentMentorName: 'SystemArchitect',
    result: 'win',
    yourScore: 2850,
    opponentScore: 2420,
    xpChange: 450,
    eloChange: 25,
    mvpUsername: 'BinaryBoss',
    mvpXpGained: 650,
    problemsSolved: 18,
    totalProblems: 5,
  },
  {
    id: 'bh-002',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    opponentClanId: 'clan-004',
    opponentClanName: 'Competitive Forge',
    opponentMentorName: 'CPChampion',
    result: 'loss',
    yourScore: 1980,
    opponentScore: 2650,
    xpChange: -180,
    eloChange: -15,
    mvpUsername: 'DataDriven',
    mvpXpGained: 420,
    problemsSolved: 12,
    totalProblems: 5,
  },
  {
    id: 'bh-003',
    date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    opponentClanId: 'clan-003',
    opponentClanName: 'Full Stack Warriors',
    opponentMentorName: 'WebCraftsman',
    result: 'win',
    yourScore: 3200,
    opponentScore: 1850,
    xpChange: 520,
    eloChange: 30,
    mvpUsername: 'AlgoNinja',
    mvpXpGained: 580,
    problemsSolved: 22,
    totalProblems: 5,
  },
  {
    id: 'bh-004',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    opponentClanId: 'clan-002',
    opponentClanName: 'System Builders',
    opponentMentorName: 'SystemArchitect',
    result: 'win',
    yourScore: 2100,
    opponentScore: 1950,
    xpChange: 280,
    eloChange: 12,
    mvpUsername: 'CodeWarrior',
    mvpXpGained: 390,
    problemsSolved: 15,
    totalProblems: 5,
  },
  {
    id: 'bh-005',
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    opponentClanId: 'clan-004',
    opponentClanName: 'Competitive Forge',
    opponentMentorName: 'CPChampion',
    result: 'draw',
    yourScore: 2400,
    opponentScore: 2400,
    xpChange: 50,
    eloChange: 0,
    mvpUsername: 'BinaryBoss',
    mvpXpGained: 480,
    problemsSolved: 16,
    totalProblems: 5,
  },
];

// Mock Battle Requests
export const mockBattleRequests: BattleRequest[] = [
  {
    id: 'br-001',
    fromClanId: 'clan-003',
    fromClanName: 'Full Stack Warriors',
    fromMentorName: 'WebCraftsman',
    toClanId: 'clan-001',
    difficulty: 'mixed',
    problemCount: 5,
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'br-002',
    fromClanId: 'clan-004',
    fromClanName: 'Competitive Forge',
    fromMentorName: 'CPChampion',
    toClanId: 'clan-001',
    difficulty: 'hard',
    problemCount: 5,
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
];

// Helper functions
export function getClanLeague(totalXP: number): ClanLeagueInfo {
  for (let i = leagueData.length - 1; i >= 0; i--) {
    if (totalXP >= leagueData[i].minXP) {
      return leagueData[i];
    }
  }
  return leagueData[0];
}

export function getLeagueProgress(totalXP: number): number {
  const league = getClanLeague(totalXP);
  if (league.maxXP === Infinity) return 100;
  const xpInLeague = totalXP - league.minXP;
  const leagueRange = league.maxXP - league.minXP;
  return Math.min(100, Math.round((xpInLeague / leagueRange) * 100));
}

export function getNextLeague(currentLeague: ClanLeague): ClanLeagueInfo | null {
  const currentIndex = leagueData.findIndex(l => l.league === currentLeague);
  if (currentIndex < leagueData.length - 1) {
    return leagueData[currentIndex + 1];
  }
  return null;
}

export function getXPToNextLeague(totalXP: number): number {
  const league = getClanLeague(totalXP);
  if (league.maxXP === Infinity) return 0;
  return league.maxXP - totalXP;
}

export function getBattleHistory(clanId: string): BattleHistory[] {
  // Mock: return all history for clan-001
  if (clanId === 'clan-001') {
    return mockBattleHistory;
  }
  return [];
}

export function getBattleRequests(clanId: string): BattleRequest[] {
  return mockBattleRequests.filter(r => r.toClanId === clanId && r.status === 'pending');
}

export function getClanStats(clanId: string) {
  const history = getBattleHistory(clanId);
  const wins = history.filter(b => b.result === 'win').length;
  const losses = history.filter(b => b.result === 'loss').length;
  const draws = history.filter(b => b.result === 'draw').length;
  const totalXPGained = history.reduce((sum, b) => sum + Math.max(0, b.xpChange), 0);
  const totalXPLost = history.reduce((sum, b) => sum + Math.min(0, b.xpChange), 0);
  
  return {
    wins,
    losses,
    draws,
    winRate: history.length > 0 ? Math.round((wins / history.length) * 100) : 0,
    totalXPGained,
    totalXPLost,
    totalBattles: history.length,
  };
}
