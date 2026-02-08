// Static seed data for Clan Arena UI (mirrors DB seed data)
// Used for display when user is NOT logged in or viewing browse mode

export const SEED_CLANS = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Code Titans',
    tag: 'TITAN',
    description: 'Elite competitive coding squad. We grind OAs and dominate wars.',
    motto: 'Code or Die',
    privacy: 'public' as const,
    max_members: 15,
    level: 8,
    total_xp: 45200,
    weekly_xp: 3800,
    rank_tier: 'gold' as const,
    member_count: 12,
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    name: 'Binary Beasts',
    tag: 'BEAST',
    description: 'Rising stars focused on DSA mastery and interview prep.',
    motto: 'Binary > Everything',
    privacy: 'public' as const,
    max_members: 10,
    level: 5,
    total_xp: 22100,
    weekly_xp: 1900,
    rank_tier: 'silver' as const,
    member_count: 7,
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Shadow Coders',
    tag: 'SHDW',
    description: 'Invite-only elite clan. Top performers only.',
    motto: 'In the shadows, we compile',
    privacy: 'private' as const,
    max_members: 5,
    level: 12,
    total_xp: 78500,
    weekly_xp: 6200,
    rank_tier: 'elite' as const,
    member_count: 5,
  },
];

export const RANK_TIERS = {
  bronze: { label: 'Bronze', color: 'hsl(30, 70%, 45%)', glow: 'rank-aura-bronze' },
  silver: { label: 'Silver', color: 'hsl(210, 10%, 60%)', glow: 'rank-aura-silver' },
  gold: { label: 'Gold', color: 'hsl(45, 90%, 55%)', glow: 'rank-aura-gold' },
  elite: { label: 'Elite', color: 'hsl(185, 50%, 65%)', glow: 'rank-aura-platinum' },
  legend: { label: 'Legend', color: 'hsl(340, 100%, 60%)', glow: 'rank-aura-legend' },
} as const;

export type RankTier = keyof typeof RANK_TIERS;

export const CLAN_BENEFITS = [
  {
    title: 'Shared Progress',
    description: 'Every problem solved contributes to your clan\'s XP ladder.',
    icon: 'TrendingUp',
  },
  {
    title: 'Weekly Quests',
    description: 'Complete weekly objectives together for bonus XP and badges.',
    icon: 'Target',
  },
  {
    title: 'Clan Wars',
    description: 'Compete weekly against matched clans. Best 5 members score.',
    icon: 'Swords',
  },
  {
    title: 'OA Rankings',
    description: 'Your OA scores build your clan\'s competitive OA standing.',
    icon: 'ClipboardCheck',
  },
  {
    title: 'Seasonal Ranks',
    description: 'Climb from Bronze to Legend with monthly rank promotions.',
    icon: 'Crown',
  },
];
