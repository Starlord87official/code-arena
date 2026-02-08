// Seed data for contest module UI demonstration
export interface SeedContest {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'elite';
  format: 'icpc' | 'ioi' | 'mixed';
  mode: 'solo' | 'duo' | 'clan';
  duration_minutes: number;
  status: 'upcoming' | 'live' | 'ended';
  start_time: string;
  end_time: string;
  max_participants: number;
  xp_reward: number;
  rating_impact: boolean;
  is_championship_qualifier: boolean;
  registered_count: number;
}

export interface SeedLeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  penalty: number;
  problems_solved: number;
  rating_delta: number;
}

export interface SeedContestProblem {
  id: string;
  label: string;
  title: string;
  difficulty: string;
  points: number;
  status: 'unseen' | 'attempted' | 'solved';
}

// Generate dynamic seed contests relative to current time
export function getSeedContests(): SeedContest[] {
  const now = new Date();
  return [
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001',
      title: 'Sprint Alpha',
      description: 'Quick 30-minute sprint. 2 problems. Perfect for warm-up.',
      difficulty: 'beginner',
      format: 'mixed',
      mode: 'solo',
      duration_minutes: 30,
      status: 'upcoming',
      start_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      max_participants: 200,
      xp_reward: 50,
      rating_impact: true,
      is_championship_qualifier: false,
      registered_count: 47,
    },
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000002',
      title: 'CodeLock Weekly #12',
      description: 'Standard weekly rated contest. 3 original problems.',
      difficulty: 'intermediate',
      format: 'icpc',
      mode: 'solo',
      duration_minutes: 60,
      status: 'upcoming',
      start_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      max_participants: 500,
      xp_reward: 100,
      rating_impact: true,
      is_championship_qualifier: false,
      registered_count: 128,
    },
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000003',
      title: 'Elite Showdown',
      description: 'A live 90-minute IOI-style contest. Partial scoring.',
      difficulty: 'elite',
      format: 'ioi',
      mode: 'solo',
      duration_minutes: 90,
      status: 'live',
      start_time: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      max_participants: 300,
      xp_reward: 200,
      rating_impact: true,
      is_championship_qualifier: true,
      registered_count: 212,
    },
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000004',
      title: 'Weekly Blitz #11',
      description: "Last week's rated contest. ICPC format.",
      difficulty: 'intermediate',
      format: 'icpc',
      mode: 'solo',
      duration_minutes: 60,
      status: 'ended',
      start_time: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      max_participants: 500,
      xp_reward: 100,
      rating_impact: true,
      is_championship_qualifier: false,
      registered_count: 342,
    },
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000005',
      title: 'Clan Championship Qualifier',
      description: 'Clan-mode qualifier for the championship. Best 5 members score.',
      difficulty: 'elite',
      format: 'ioi',
      mode: 'clan',
      duration_minutes: 120,
      status: 'ended',
      start_time: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
      max_participants: 100,
      xp_reward: 250,
      rating_impact: true,
      is_championship_qualifier: true,
      registered_count: 78,
    },
  ];
}

export const SEED_LEADERBOARD: SeedLeaderboardEntry[] = [
  { rank: 1, username: 'AlgoKing', score: 900, penalty: 45, problems_solved: 4, rating_delta: 85 },
  { rank: 2, username: 'ByteStorm', score: 700, penalty: 62, problems_solved: 3, rating_delta: 48 },
  { rank: 3, username: 'NeuralNinja', score: 600, penalty: 38, problems_solved: 3, rating_delta: 25 },
  { rank: 4, username: 'StackOverflow', score: 500, penalty: 72, problems_solved: 2, rating_delta: 15 },
  { rank: 5, username: 'RecursiveRex', score: 400, penalty: 55, problems_solved: 2, rating_delta: -10 },
  { rank: 6, username: 'GraphMaster', score: 300, penalty: 90, problems_solved: 1, rating_delta: -20 },
  { rank: 7, username: 'DPWizard', score: 200, penalty: 110, problems_solved: 1, rating_delta: -30 },
  { rank: 8, username: 'CodeMonk', score: 100, penalty: 120, problems_solved: 1, rating_delta: -40 },
];

export const SEED_PROBLEMS: SeedContestProblem[] = [
  { id: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000001', label: 'A', title: 'Matrix Signal', difficulty: 'medium', points: 100, status: 'solved' },
  { id: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000002', label: 'B', title: 'Token Sequence', difficulty: 'hard', points: 200, status: 'attempted' },
  { id: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000003', label: 'C', title: 'Grid Walker', difficulty: 'hard', points: 300, status: 'unseen' },
  { id: 'b2c3d4e5-f6a7-4b8c-9d0e-000000000004', label: 'D', title: 'Quantum Bridge', difficulty: 'extreme', points: 400, status: 'unseen' },
];

export const SEED_USER_RATING = {
  rating: 1285,
  max_rating: 1320,
  contests_played: 8,
  best_rank: 3,
  current_streak: 4,
};
