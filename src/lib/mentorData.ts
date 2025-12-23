// Mentor + Clan System Mock Data
// Phase A: Foundation - Trust, Mentorship, Retention

export type MentorRole = 'trial' | 'verified' | 'elite';
export type TeachingFocus = 'DSA' | 'Competitive Programming' | 'Web Development' | 'System Design' | 'Machine Learning';

export interface Mentor {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  role: MentorRole;
  bio: string;
  experience: string;
  teachingFocus: TeachingFocus[];
  availability: string;
  whyFollow: string;
  clanId: string | null;
  rating: number;
  totalStudents: number;
  totalClasses: number;
  joinedAt: Date;
}

export interface Clan {
  id: string;
  name: string;
  description: string;
  theme: string;
  mentorId: string;
  memberCount: number;
  maxMembers: number;
  totalXP: number;
  weeklyFocus: string;
  weeklyGoal: string;
  createdAt: Date;
  isOpen: boolean;
}

export interface ClanMember {
  id: string;
  clanId: string;
  username: string;
  avatar: string;
  xp: number;
  joinedAt: Date;
  lastActive: Date;
  streak: number;
}

export interface ClassSession {
  id: string;
  clanId: string;
  mentorId: string;
  title: string;
  description: string;
  scheduledAt: Date;
  duration: number; // minutes
  meetLink: string;
  status: 'upcoming' | 'live' | 'ended';
  attendees: number;
}

export interface ClanMessage {
  id: string;
  clanId: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  type: 'message' | 'mentor' | 'system' | 'announcement';
  createdAt: Date;
}

export interface ClanAnnouncement {
  id: string;
  clanId: string;
  mentorId: string;
  title: string;
  content: string;
  createdAt: Date;
  isPinned: boolean;
}

// Mock Mentors
export const mockMentors: Mentor[] = [
  {
    id: 'mentor-001',
    userId: 'user-mentor-001',
    username: 'AlgorithmMaster',
    avatar: 'AM',
    role: 'trial',
    bio: 'Former FAANG engineer with 8+ years of experience in algorithm design and competitive programming. Passionate about helping students break into top tech companies.',
    experience: '8 years at Google, 500+ students mentored, 3x ICPC World Finalist coach',
    teachingFocus: ['DSA', 'Competitive Programming'],
    availability: 'Weekends, 2 sessions/week',
    whyFollow: 'I focus on building intuition, not just memorizing patterns. My students learn to think like engineers.',
    clanId: 'clan-001',
    rating: 4.9,
    totalStudents: 234,
    totalClasses: 89,
    joinedAt: new Date('2024-01-15'),
  },
  {
    id: 'mentor-002',
    userId: 'user-mentor-002',
    username: 'SystemArchitect',
    avatar: 'SA',
    role: 'trial',
    bio: 'Principal Engineer specializing in distributed systems. I teach the fundamentals that make senior engineers stand out.',
    experience: '10 years in system design, Led architecture at 3 unicorn startups',
    teachingFocus: ['System Design', 'DSA'],
    availability: 'Tue/Thu evenings',
    whyFollow: 'System design is about trade-offs. I teach you how to think critically about scale.',
    clanId: 'clan-002',
    rating: 4.8,
    totalStudents: 156,
    totalClasses: 67,
    joinedAt: new Date('2024-02-20'),
  },
  {
    id: 'mentor-003',
    userId: 'user-mentor-003',
    username: 'WebCraftsman',
    avatar: 'WC',
    role: 'trial',
    bio: 'Full-stack developer and educator. I believe in learning by building real products.',
    experience: '6 years of full-stack development, Open source contributor',
    teachingFocus: ['Web Development'],
    availability: 'Mon/Wed/Fri afternoons',
    whyFollow: 'Skip the tutorials. Build real projects. Ship code that matters.',
    clanId: 'clan-003',
    rating: 4.7,
    totalStudents: 89,
    totalClasses: 45,
    joinedAt: new Date('2024-03-10'),
  },
  {
    id: 'mentor-004',
    userId: 'user-mentor-004',
    username: 'MLPioneer',
    avatar: 'ML',
    role: 'trial',
    bio: 'Machine Learning researcher turned educator. Making ML accessible to everyone.',
    experience: 'PhD in ML, Research scientist at top AI lab',
    teachingFocus: ['Machine Learning', 'DSA'],
    availability: 'Weekends only',
    whyFollow: 'ML is not magic. I break down complex concepts into digestible pieces.',
    clanId: null,
    rating: 4.6,
    totalStudents: 45,
    totalClasses: 23,
    joinedAt: new Date('2024-04-05'),
  },
  {
    id: 'mentor-005',
    userId: 'user-mentor-005',
    username: 'CPChampion',
    avatar: 'CP',
    role: 'trial',
    bio: 'Codeforces Grandmaster, ICPC World Finalist. I live and breathe competitive programming.',
    experience: 'Codeforces rating 2600+, 5 years of CP coaching',
    teachingFocus: ['Competitive Programming', 'DSA'],
    availability: 'Daily practice sessions',
    whyFollow: 'Speed and precision. I train you to solve problems under pressure.',
    clanId: 'clan-004',
    rating: 4.9,
    totalStudents: 312,
    totalClasses: 156,
    joinedAt: new Date('2024-01-01'),
  },
];

// Mock Clans
export const mockClans: Clan[] = [
  {
    id: 'clan-001',
    name: 'Algorithm Elite',
    description: 'A focused clan for serious learners who want to master data structures and algorithms. We solve hard problems together.',
    theme: 'elite',
    mentorId: 'mentor-001',
    memberCount: 42,
    maxMembers: 50,
    totalXP: 125400,
    weeklyFocus: 'Dynamic Programming Optimization',
    weeklyGoal: 'Complete 3 DP problems each, discuss solutions in weekly review',
    createdAt: new Date('2024-01-20'),
    isOpen: true,
  },
  {
    id: 'clan-002',
    name: 'System Builders',
    description: 'Learn to design systems that scale. From databases to distributed architectures.',
    theme: 'technical',
    mentorId: 'mentor-002',
    memberCount: 38,
    maxMembers: 50,
    totalXP: 98700,
    weeklyFocus: 'Database Sharding Strategies',
    weeklyGoal: 'Design a sharded database schema for an e-commerce platform',
    createdAt: new Date('2024-02-25'),
    isOpen: true,
  },
  {
    id: 'clan-003',
    name: 'Full Stack Warriors',
    description: 'Build real products. Ship code. Get feedback from experienced developers.',
    theme: 'creative',
    mentorId: 'mentor-003',
    memberCount: 28,
    maxMembers: 50,
    totalXP: 67300,
    weeklyFocus: 'React Server Components',
    weeklyGoal: 'Refactor existing project to use RSC architecture',
    createdAt: new Date('2024-03-15'),
    isOpen: true,
  },
  {
    id: 'clan-004',
    name: 'Competitive Forge',
    description: 'Train like champions. Daily problem solving, weekly virtual contests, monthly rankings.',
    theme: 'competitive',
    mentorId: 'mentor-005',
    memberCount: 50,
    maxMembers: 50,
    totalXP: 234500,
    weeklyFocus: 'Graph Algorithms - Advanced',
    weeklyGoal: 'Solve 5 graph problems rated 2000+, participate in Codeforces round',
    createdAt: new Date('2024-01-05'),
    isOpen: false,
  },
];

// Mock Clan Members
export const mockClanMembers: ClanMember[] = [
  {
    id: 'member-001',
    clanId: 'clan-001',
    username: 'CodeWarrior',
    avatar: 'CW',
    xp: 4500,
    joinedAt: new Date('2024-02-01'),
    lastActive: new Date(),
    streak: 15,
  },
  {
    id: 'member-002',
    clanId: 'clan-001',
    username: 'AlgoNinja',
    avatar: 'AN',
    xp: 3800,
    joinedAt: new Date('2024-02-10'),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    streak: 8,
  },
  {
    id: 'member-003',
    clanId: 'clan-001',
    username: 'DataDriven',
    avatar: 'DD',
    xp: 5200,
    joinedAt: new Date('2024-01-25'),
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    streak: 22,
  },
  {
    id: 'member-004',
    clanId: 'clan-001',
    username: 'RecursiveRex',
    avatar: 'RR',
    xp: 2900,
    joinedAt: new Date('2024-03-01'),
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
    streak: 5,
  },
  {
    id: 'member-005',
    clanId: 'clan-001',
    username: 'BinaryBoss',
    avatar: 'BB',
    xp: 6100,
    joinedAt: new Date('2024-01-22'),
    lastActive: new Date(),
    streak: 30,
  },
];

// Mock Class Sessions
export const mockClassSessions: ClassSession[] = [
  {
    id: 'class-001',
    clanId: 'clan-001',
    mentorId: 'mentor-001',
    title: 'Advanced DP: Bitmask Optimization',
    description: 'Deep dive into bitmask DP techniques. Bring your questions from this week\'s problems.',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    duration: 90,
    meetLink: 'https://meet.google.com/abc-defg-hij',
    status: 'upcoming',
    attendees: 0,
  },
  {
    id: 'class-002',
    clanId: 'clan-001',
    mentorId: 'mentor-001',
    title: 'Weekly Problem Review',
    description: 'Review solutions from this week\'s practice problems. Q&A session.',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 60,
    meetLink: 'https://zoom.us/j/123456789',
    status: 'upcoming',
    attendees: 0,
  },
  {
    id: 'class-003',
    clanId: 'clan-001',
    mentorId: 'mentor-001',
    title: 'Graph Theory Fundamentals',
    description: 'Covered BFS, DFS, and topological sorting.',
    scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    duration: 75,
    meetLink: 'https://meet.google.com/xyz-uvwx-yz',
    status: 'ended',
    attendees: 38,
  },
];

// Mock Chat Messages
export const mockClanMessages: ClanMessage[] = [
  {
    id: 'msg-001',
    clanId: 'clan-001',
    userId: 'system',
    username: 'System',
    avatar: 'SY',
    content: 'Welcome to Algorithm Elite! Remember: we rise together.',
    type: 'system',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'msg-002',
    clanId: 'clan-001',
    userId: 'user-mentor-001',
    username: 'AlgorithmMaster',
    avatar: 'AM',
    content: 'Great work on this week\'s DP problems everyone. I\'m seeing real improvement in your solution approaches. Keep pushing!',
    type: 'mentor',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'msg-003',
    clanId: 'clan-001',
    userId: 'member-001',
    username: 'CodeWarrior',
    avatar: 'CW',
    content: 'Anyone else stuck on problem 4? The state transition is confusing me.',
    type: 'message',
    createdAt: new Date(Date.now() - 90 * 60 * 1000),
  },
  {
    id: 'msg-004',
    clanId: 'clan-001',
    userId: 'member-005',
    username: 'BinaryBoss',
    avatar: 'BB',
    content: 'Try thinking about it as a DAG. The dependencies become clearer.',
    type: 'message',
    createdAt: new Date(Date.now() - 85 * 60 * 1000),
  },
  {
    id: 'msg-005',
    clanId: 'clan-001',
    userId: 'member-003',
    username: 'DataDriven',
    avatar: 'DD',
    content: 'The key insight is that you only need to track the last two states. Reduces space complexity significantly.',
    type: 'message',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: 'msg-006',
    clanId: 'clan-001',
    userId: 'system',
    username: 'System',
    avatar: 'SY',
    content: 'Class reminder: "Advanced DP: Bitmask Optimization" starts in 2 hours',
    type: 'system',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'msg-007',
    clanId: 'clan-001',
    userId: 'member-001',
    username: 'CodeWarrior',
    avatar: 'CW',
    content: 'Thanks @BinaryBoss and @DataDriven! That DAG perspective really helped. Solved it!',
    type: 'message',
    createdAt: new Date(Date.now() - 20 * 60 * 1000),
  },
  {
    id: 'msg-008',
    clanId: 'clan-001',
    userId: 'user-mentor-001',
    username: 'AlgorithmMaster',
    avatar: 'AM',
    content: '📢 ANNOUNCEMENT: This week\'s focus is Dynamic Programming Optimization. I\'ve uploaded 5 practice problems. Target: solve at least 3 before Saturday\'s class.',
    type: 'announcement',
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
  },
];

// Mock Announcements
export const mockAnnouncements: ClanAnnouncement[] = [
  {
    id: 'ann-001',
    clanId: 'clan-001',
    mentorId: 'mentor-001',
    title: 'Weekly Focus: DP Optimization',
    content: 'This week we\'re diving deep into DP optimization techniques. I\'ve curated 5 problems of increasing difficulty. Try to solve at least 3 before our Saturday session. Remember: understanding > speed.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isPinned: true,
  },
  {
    id: 'ann-002',
    clanId: 'clan-001',
    mentorId: 'mentor-001',
    title: 'Congratulations to Our Top Performers',
    content: 'Shoutout to BinaryBoss and DataDriven for completing all challenge problems this month. Your consistency is inspiring the whole clan!',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isPinned: false,
  },
];

// Helper functions
export function getMentorById(id: string): Mentor | undefined {
  return mockMentors.find(m => m.id === id);
}

export function getClanById(id: string): Clan | undefined {
  return mockClans.find(c => c.id === id);
}

export function getClanByMentorId(mentorId: string): Clan | undefined {
  return mockClans.find(c => c.mentorId === mentorId);
}

export function getClanMembers(clanId: string): ClanMember[] {
  return mockClanMembers.filter(m => m.clanId === clanId);
}

export function getClanSessions(clanId: string): ClassSession[] {
  return mockClassSessions.filter(s => s.clanId === clanId);
}

export function getClanMessages(clanId: string): ClanMessage[] {
  return mockClanMessages.filter(m => m.clanId === clanId);
}

export function getClanAnnouncements(clanId: string): ClanAnnouncement[] {
  return mockAnnouncements.filter(a => a.clanId === clanId);
}

export function getMentorRoleLabel(role: MentorRole): string {
  switch (role) {
    case 'trial': return 'Trial Mentor';
    case 'verified': return 'Verified Mentor';
    case 'elite': return 'Elite Mentor';
  }
}

export function getMentorRoleColor(role: MentorRole): string {
  switch (role) {
    case 'trial': return 'text-muted-foreground';
    case 'verified': return 'text-primary';
    case 'elite': return 'text-status-warning';
  }
}

export function getFocusColor(focus: TeachingFocus): string {
  switch (focus) {
    case 'DSA': return 'bg-primary/20 text-primary border-primary/30';
    case 'Competitive Programming': return 'bg-destructive/20 text-destructive border-destructive/30';
    case 'Web Development': return 'bg-success/20 text-success border-success/30';
    case 'System Design': return 'bg-accent/20 text-accent border-accent/30';
    case 'Machine Learning': return 'bg-status-warning/20 text-status-warning border-status-warning/30';
  }
}
