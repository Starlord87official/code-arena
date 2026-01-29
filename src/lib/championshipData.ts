// Championship Data Models and Mock Data

export type TrackType = 'solo' | 'duo' | 'clan';
export type StageStatus = 'upcoming' | 'active' | 'completed' | 'locked';
export type UserTrackStatus = 'not_registered' | 'registered' | 'qualified' | 'eliminated' | 'finalist' | 'champion';
export type FrameRarity = 'participant' | 'qualified' | 'semi_finalist' | 'finalist' | 'champion';
export type VerificationLane = 'open' | 'crown';

export interface ChampionshipSeason {
  id: string;
  year: number;
  country: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  registrationStart: string;
  registrationEnd: string;
  finalsDate: string;
  stages: ChampionshipStage[];
}

export interface ChampionshipStage {
  id: string;
  name: string;
  shortName: string;
  order: number;
  startDate: string;
  endDate: string;
  status: StageStatus;
  format: string;
  cutoffPercentile?: number;
}

export interface TrackInfo {
  type: TrackType;
  title: string;
  prize: string;
  description: string;
  icon: string;
  accentColor: string;
  rules: string[];
}

export interface UserChampionshipStatus {
  seasonId: string;
  verificationLane: VerificationLane;
  phoneVerified: boolean;
  tracks: {
    solo?: UserTrackProgress;
    duo?: UserTrackProgress;
    clan?: UserTrackProgress;
  };
}

export interface UserTrackProgress {
  status: UserTrackStatus;
  currentStage: string;
  rank?: number;
  score?: number;
  partner?: { id: string; username: string; avatar?: string }; // For duo
  clanId?: string; // For clan
  stageResults: StageResult[];
  framesEarned: FrameRarity[];
  eliminatedAt?: string;
  qualifiedAt?: string;
}

export interface StageResult {
  stageId: string;
  stageName: string;
  rank: number;
  score: number;
  totalParticipants: number;
  qualified: boolean;
  completedAt: string;
}

export interface StandingEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  timeMs: number;
  verified: boolean;
  isPastChampion: boolean;
  championYears?: number[];
  frame?: FrameRarity;
  partnerId?: string; // For duo
  partnerUsername?: string;
  clanName?: string; // For clan
}

export interface Champion {
  year: number;
  track: TrackType;
  userId: string;
  username: string;
  avatar?: string;
  partnerId?: string;
  partnerUsername?: string;
  partnerAvatar?: string;
  clanName?: string;
  clanMembers?: { id: string; username: string; avatar?: string }[];
  story?: string;
  stats: {
    totalScore: number;
    problemsSolved: number;
    avgTimePerProblem: number;
    qualifierRank: number;
    finalsRank: number;
  };
  path: {
    stageName: string;
    rank: number;
    score: number;
  }[];
}

export interface Frame {
  rarity: FrameRarity;
  name: string;
  description: string;
  borderColor: string;
  glowColor: string;
  year?: number;
}

// Track Configurations
export const TRACKS: Record<TrackType, TrackInfo> = {
  solo: {
    type: 'solo',
    title: 'Solo Championship',
    prize: 'CodeLock Solo Crown',
    description: 'Individual mastery. Prove your skill alone.',
    icon: 'User',
    accentColor: 'hsl(199 100% 50%)', // Neon blue
    rules: [
      '3-hour selection trial',
      '6 problems, increasing difficulty',
      'Top 10% qualify each round',
      'Final: Live problem reveal'
    ]
  },
  duo: {
    type: 'duo',
    title: 'Duo Championship',
    prize: 'CodeLock Duo Crown',
    description: 'Relay-solve with your partner. Synced or alternating.',
    icon: 'Users',
    accentColor: 'hsl(185 100% 50%)', // Cyan
    rules: [
      'Pick your duo partner before Qualifier',
      'Relay-solve: alternate problems',
      'Combined score determines rank',
      'Both must be verified for Crown Lane'
    ]
  },
  clan: {
    type: 'clan',
    title: 'Clan Championship',
    prize: 'CodeLock Clan Crown',
    description: 'Top-5 aggregate. Your clan\'s elite squad.',
    icon: 'Shield',
    accentColor: 'hsl(45 90% 55%)', // Gold
    rules: [
      'Roster lock 48h before Qualifier',
      'Top 5 scores count per round',
      'Minimum 5 verified members',
      'Clan leader confirms roster'
    ]
  }
};

// Frame Configurations
export const FRAMES: Record<FrameRarity, Frame> = {
  participant: {
    rarity: 'participant',
    name: 'Participant',
    description: 'Competed in CodeLock Championship',
    borderColor: 'hsl(var(--muted))',
    glowColor: 'hsla(var(--muted), 0.3)'
  },
  qualified: {
    rarity: 'qualified',
    name: 'Qualified',
    description: 'Cleared the Qualifier Gate',
    borderColor: 'hsl(142 76% 45%)',
    glowColor: 'hsla(142, 76%, 45%, 0.4)'
  },
  semi_finalist: {
    rarity: 'semi_finalist',
    name: 'Semi-Finalist',
    description: 'Reached the Semi-Finals',
    borderColor: 'hsl(199 100% 50%)',
    glowColor: 'hsla(199, 100%, 50%, 0.5)'
  },
  finalist: {
    rarity: 'finalist',
    name: 'Finalist',
    description: 'Competed in the Grand Finals',
    borderColor: 'hsl(265 100% 60%)',
    glowColor: 'hsla(265, 100%, 60%, 0.5)'
  },
  champion: {
    rarity: 'champion',
    name: 'Champion',
    description: 'CodeLock Championship Winner',
    borderColor: 'hsl(45 90% 55%)',
    glowColor: 'hsla(45, 90%, 55%, 0.6)'
  }
};

// Mock Season Data - India 2026
export const MOCK_SEASON_2026: ChampionshipSeason = {
  id: 'india-2026',
  year: 2026,
  country: 'India',
  title: 'CodeLock Championship India 2026',
  subtitle: 'Once a year. Earn the Crown.',
  isActive: true,
  registrationStart: '2026-01-15T00:00:00+05:30',
  registrationEnd: '2026-02-01T23:59:59+05:30',
  finalsDate: '2026-03-29T18:00:00+05:30',
  stages: [
    {
      id: 'registration',
      name: 'Registration',
      shortName: 'REG',
      order: 1,
      startDate: '2026-01-15T00:00:00+05:30',
      endDate: '2026-02-01T23:59:59+05:30',
      status: 'completed',
      format: 'Open registration with phone verification for Crown Lane'
    },
    {
      id: 'warmup',
      name: 'Warm-Up Practice',
      shortName: 'WARM',
      order: 2,
      startDate: '2026-02-03T00:00:00+05:30',
      endDate: '2026-02-09T23:59:59+05:30',
      status: 'completed',
      format: 'Unranked practice sets, 3 per day'
    },
    {
      id: 'qualifier',
      name: 'Qualifier Trials',
      shortName: 'QUAL',
      order: 3,
      startDate: '2026-02-15T10:00:00+05:30',
      endDate: '2026-02-15T13:00:00+05:30',
      status: 'active',
      format: '3-hour trial, 6 problems',
      cutoffPercentile: 10
    },
    {
      id: 'playoffs',
      name: 'Playoff Rounds',
      shortName: 'PLAY',
      order: 4,
      startDate: '2026-02-22T18:00:00+05:30',
      endDate: '2026-02-22T20:00:00+05:30',
      status: 'upcoming',
      format: '2-hour sprint, 4 problems',
      cutoffPercentile: 25
    },
    {
      id: 'semifinal',
      name: 'Semi-Finals',
      shortName: 'SEMI',
      order: 5,
      startDate: '2026-03-08T18:00:00+05:30',
      endDate: '2026-03-08T21:00:00+05:30',
      status: 'locked',
      format: '3-hour challenge, 5 problems',
      cutoffPercentile: 50
    },
    {
      id: 'finals',
      name: 'Grand Finals',
      shortName: 'FINAL',
      order: 6,
      startDate: '2026-03-29T18:00:00+05:30',
      endDate: '2026-03-29T22:00:00+05:30',
      status: 'locked',
      format: 'Live problem reveal, 4 hours'
    }
  ]
};

// Mock User Championship Status
export const MOCK_USER_STATUS: UserChampionshipStatus = {
  seasonId: 'india-2026',
  verificationLane: 'crown',
  phoneVerified: true,
  tracks: {
    solo: {
      status: 'qualified',
      currentStage: 'playoffs',
      rank: 847,
      score: 4250,
      stageResults: [
        {
          stageId: 'qualifier',
          stageName: 'Qualifier Trials',
          rank: 847,
          score: 4250,
          totalParticipants: 12847,
          qualified: true,
          completedAt: '2026-02-15T12:45:00+05:30'
        }
      ],
      framesEarned: ['qualified'],
      qualifiedAt: '2026-02-15T13:00:00+05:30'
    },
    duo: {
      status: 'registered',
      currentStage: 'qualifier',
      partner: {
        id: 'user-456',
        username: 'AlgoMaster_99',
        avatar: undefined
      },
      stageResults: [],
      framesEarned: []
    }
  }
};

// Mock Standings Data
export const MOCK_SOLO_STANDINGS: StandingEntry[] = [
  { rank: 1, userId: 'champion-1', username: 'ByteKing_Pro', score: 6000, timeMs: 5832000, verified: true, isPastChampion: true, championYears: [2025], frame: 'champion' },
  { rank: 2, userId: 'user-2', username: 'AlgorithmAce', score: 5950, timeMs: 6120000, verified: true, isPastChampion: false, frame: 'finalist' },
  { rank: 3, userId: 'user-3', username: 'CodeNinja_X', score: 5900, timeMs: 6300000, verified: true, isPastChampion: false, frame: 'semi_finalist' },
  { rank: 4, userId: 'user-4', username: 'DSA_Destroyer', score: 5850, timeMs: 6480000, verified: true, isPastChampion: false, frame: 'qualified' },
  { rank: 5, userId: 'user-5', username: 'RecursionRuler', score: 5800, timeMs: 6600000, verified: false, isPastChampion: false },
  { rank: 6, userId: 'user-6', username: 'GraphTheory_G', score: 5750, timeMs: 6720000, verified: true, isPastChampion: false },
  { rank: 7, userId: 'user-7', username: 'DynamicDev', score: 5700, timeMs: 6900000, verified: true, isPastChampion: false },
  { rank: 8, userId: 'user-8', username: 'StackOverflow_S', score: 5650, timeMs: 7080000, verified: true, isPastChampion: false },
  { rank: 9, userId: 'user-9', username: 'BinaryBeast', score: 5600, timeMs: 7200000, verified: false, isPastChampion: false },
  { rank: 10, userId: 'user-10', username: 'TreeTraverser', score: 5550, timeMs: 7320000, verified: true, isPastChampion: false },
];

export const MOCK_DUO_STANDINGS: StandingEntry[] = [
  { rank: 1, userId: 'duo-1a', username: 'SyncSolvers', partnerId: 'duo-1b', partnerUsername: 'AlphaBeta', score: 11200, timeMs: 5400000, verified: true, isPastChampion: false, frame: 'finalist' },
  { rank: 2, userId: 'duo-2a', username: 'RelayRacers', partnerId: 'duo-2b', partnerUsername: 'SpeedCode', score: 11000, timeMs: 5700000, verified: true, isPastChampion: false, frame: 'qualified' },
  { rank: 3, userId: 'duo-3a', username: 'PairProgrammers', partnerId: 'duo-3b', partnerUsername: 'DebugDuo', score: 10800, timeMs: 5850000, verified: true, isPastChampion: false },
];

export const MOCK_CLAN_STANDINGS: StandingEntry[] = [
  { rank: 1, userId: 'clan-1', username: 'Elite Coders', clanName: 'Elite Coders Guild', score: 28500, timeMs: 18000000, verified: true, isPastChampion: true, championYears: [2025], frame: 'champion' },
  { rank: 2, userId: 'clan-2', username: 'Algorithm Army', clanName: 'Algorithm Army', score: 27800, timeMs: 19200000, verified: true, isPastChampion: false, frame: 'finalist' },
  { rank: 3, userId: 'clan-3', username: 'Binary Brigade', clanName: 'Binary Brigade', score: 27200, timeMs: 19800000, verified: true, isPastChampion: false },
];

// Mock Champions (Hall of Champions)
export const MOCK_CHAMPIONS_2025: Champion[] = [
  {
    year: 2025,
    track: 'solo',
    userId: 'champion-1',
    username: 'ByteKing_Pro',
    avatar: undefined,
    story: 'From a small town in Kerala to the national stage. ByteKing_Pro dominated every round with surgical precision, solving the Finals boss problem in just 18 minutes.',
    stats: {
      totalScore: 24500,
      problemsSolved: 23,
      avgTimePerProblem: 12.4,
      qualifierRank: 3,
      finalsRank: 1
    },
    path: [
      { stageName: 'Qualifier', rank: 3, score: 5900 },
      { stageName: 'Playoffs', rank: 2, score: 5850 },
      { stageName: 'Semi-Finals', rank: 1, score: 6200 },
      { stageName: 'Grand Finals', rank: 1, score: 6550 }
    ]
  },
  {
    year: 2025,
    track: 'duo',
    userId: 'duo-champ-1a',
    username: 'SyncMasters',
    partnerId: 'duo-champ-1b',
    partnerUsername: 'PairPerfect',
    story: 'The unbeatable duo from IIT Bombay. Their relay-solve strategy set a new standard for duo championships.',
    stats: {
      totalScore: 45200,
      problemsSolved: 44,
      avgTimePerProblem: 8.2,
      qualifierRank: 1,
      finalsRank: 1
    },
    path: [
      { stageName: 'Qualifier', rank: 1, score: 11400 },
      { stageName: 'Playoffs', rank: 1, score: 11200 },
      { stageName: 'Semi-Finals', rank: 2, score: 11100 },
      { stageName: 'Grand Finals', rank: 1, score: 11500 }
    ]
  },
  {
    year: 2025,
    track: 'clan',
    userId: 'clan-1',
    username: 'Elite Coders Guild',
    clanName: 'Elite Coders Guild',
    clanMembers: [
      { id: 'c1', username: 'ClanLeader_X', avatar: undefined },
      { id: 'c2', username: 'TopCoder_Y', avatar: undefined },
      { id: 'c3', username: 'AlgoKing_Z', avatar: undefined },
      { id: 'c4', username: 'DSA_Master', avatar: undefined },
      { id: 'c5', username: 'CodeWizard', avatar: undefined }
    ],
    story: 'Five coders, one mission. Elite Coders Guild proved that teamwork and consistent excellence win championships.',
    stats: {
      totalScore: 142000,
      problemsSolved: 115,
      avgTimePerProblem: 9.8,
      qualifierRank: 2,
      finalsRank: 1
    },
    path: [
      { stageName: 'Qualifier', rank: 2, score: 28000 },
      { stageName: 'Playoffs', rank: 1, score: 35500 },
      { stageName: 'Semi-Finals', rank: 1, score: 37000 },
      { stageName: 'Grand Finals', rank: 1, score: 41500 }
    ]
  }
];

// Helper functions
export function getStageStatusLabel(status: StageStatus): string {
  switch (status) {
    case 'upcoming': return 'Upcoming';
    case 'active': return 'Live Now';
    case 'completed': return 'Completed';
    case 'locked': return 'Locked';
    default: return status;
  }
}

export function getUserStatusLabel(status: UserTrackStatus): string {
  switch (status) {
    case 'not_registered': return 'Not Registered';
    case 'registered': return 'Registered';
    case 'qualified': return 'Qualified';
    case 'eliminated': return 'Eliminated';
    case 'finalist': return 'Finalist';
    case 'champion': return 'Champion';
    default: return status;
  }
}

export function formatTimeMs(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

export function getFrameByRarity(rarity: FrameRarity): Frame {
  return FRAMES[rarity];
}

export function getTrackInfo(track: TrackType): TrackInfo {
  return TRACKS[track];
}
