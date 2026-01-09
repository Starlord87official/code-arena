// Company data for the Company-Wise Problems feature

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  tier: 1 | 2 | 3;
  description: string;
  tags: string[];
  challengeCount: number;
}

export type AskedFrequency = 'rare' | 'medium' | 'frequent';

export interface CompanyChallengeMeta {
  challengeId: string;
  companies: string[]; // company slugs
  frequency: AskedFrequency;
  lastAskedYear?: number;
}

// Company definitions
export const companies: Company[] = [
  // Tier 1 - Top Tech
  {
    id: 'google',
    name: 'Google',
    slug: 'google',
    tier: 1,
    description: 'World leader in search, cloud, and AI. Known for highly algorithmic interview questions focusing on optimization and scalability.',
    tags: ['DSA', 'System Design', 'Algorithms'],
    challengeCount: 3,
  },
  {
    id: 'meta',
    name: 'Meta',
    slug: 'meta',
    tier: 1,
    description: 'Social media giant building the metaverse. Interviews focus on graphs, dynamic programming, and system design.',
    tags: ['DSA', 'Graphs', 'System Design'],
    challengeCount: 2,
  },
  {
    id: 'amazon',
    name: 'Amazon',
    slug: 'amazon',
    tier: 1,
    description: 'E-commerce and cloud computing leader. Leadership principles matter. Heavy focus on arrays, trees, and optimization.',
    tags: ['DSA', 'Arrays', 'Trees', 'Leadership'],
    challengeCount: 4,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    slug: 'microsoft',
    tier: 1,
    description: 'Enterprise software and cloud powerhouse. Balanced interviews covering DSA, system design, and problem-solving.',
    tags: ['DSA', 'System Design', 'Arrays'],
    challengeCount: 3,
  },
  {
    id: 'apple',
    name: 'Apple',
    slug: 'apple',
    tier: 1,
    description: 'Consumer electronics innovator. Focus on clean code, optimization, and user-centric problem solving.',
    tags: ['DSA', 'Optimization', 'Clean Code'],
    challengeCount: 2,
  },
  // Tier 2
  {
    id: 'uber',
    name: 'Uber',
    slug: 'uber',
    tier: 2,
    description: 'Ride-sharing and delivery platform. Strong focus on graphs, shortest paths, and real-time systems.',
    tags: ['Graphs', 'Shortest Path', 'System Design'],
    challengeCount: 2,
  },
  {
    id: 'adobe',
    name: 'Adobe',
    slug: 'adobe',
    tier: 2,
    description: 'Creative software leader. Interviews balance DSA with domain-specific problems.',
    tags: ['DSA', 'Arrays', 'Strings'],
    challengeCount: 2,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    slug: 'salesforce',
    tier: 2,
    description: 'CRM and cloud platform. Focus on database concepts, APIs, and scalable solutions.',
    tags: ['DSA', 'Databases', 'System Design'],
    challengeCount: 1,
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    slug: 'atlassian',
    tier: 2,
    description: 'Collaboration tools leader. Values-driven interviews with practical DSA problems.',
    tags: ['DSA', 'Collaboration', 'Problem Solving'],
    challengeCount: 1,
  },
  {
    id: 'netflix',
    name: 'Netflix',
    slug: 'netflix',
    tier: 2,
    description: 'Streaming entertainment leader. Focus on distributed systems, caching, and optimization.',
    tags: ['System Design', 'Distributed Systems', 'Optimization'],
    challengeCount: 1,
  },
  // Tier 3
  {
    id: 'startups',
    name: 'Startups & Product Companies',
    slug: 'startups',
    tier: 3,
    description: 'Growing companies looking for versatile engineers. Practical problems with real-world applications.',
    tags: ['DSA', 'Full Stack', 'Problem Solving'],
    challengeCount: 2,
  },
];

// Mapping challenges to companies
export const challengeCompanyMeta: CompanyChallengeMeta[] = [
  // ch-001: Two Sum - Classic, asked everywhere
  {
    challengeId: 'ch-001',
    companies: ['google', 'amazon', 'meta', 'microsoft', 'adobe', 'startups'],
    frequency: 'frequent',
    lastAskedYear: 2025,
  },
  // ch-002: Binary Tree - Tree problems
  {
    challengeId: 'ch-002',
    companies: ['google', 'amazon', 'microsoft', 'apple'],
    frequency: 'frequent',
    lastAskedYear: 2025,
  },
  // ch-003: DP - Classic optimization
  {
    challengeId: 'ch-003',
    companies: ['google', 'meta', 'amazon', 'uber'],
    frequency: 'medium',
    lastAskedYear: 2024,
  },
  // ch-004: Graph - Dijkstra
  {
    challengeId: 'ch-004',
    companies: ['uber', 'amazon', 'google', 'netflix'],
    frequency: 'medium',
    lastAskedYear: 2024,
  },
  // ch-005: Word Break - Advanced
  {
    challengeId: 'ch-005',
    companies: ['meta', 'google', 'amazon'],
    frequency: 'rare',
    lastAskedYear: 2023,
  },
  // ch-006: String Reverse - Basic
  {
    challengeId: 'ch-006',
    companies: ['adobe', 'microsoft', 'startups', 'salesforce', 'atlassian'],
    frequency: 'frequent',
    lastAskedYear: 2025,
  },
  // ch-007: Linked List Reverse
  {
    challengeId: 'ch-007',
    companies: ['amazon', 'microsoft', 'apple', 'meta'],
    frequency: 'frequent',
    lastAskedYear: 2025,
  },
  // ch-008: Heap/Priority Queue
  {
    challengeId: 'ch-008',
    companies: ['google', 'amazon', 'uber'],
    frequency: 'medium',
    lastAskedYear: 2024,
  },
];

// Helper functions
export function getCompanyBySlug(slug: string): Company | undefined {
  return companies.find(c => c.slug === slug);
}

export function getCompaniesByTier(tier: 1 | 2 | 3): Company[] {
  return companies.filter(c => c.tier === tier);
}

export function getChallengeCompanyMeta(challengeId: string): CompanyChallengeMeta | undefined {
  return challengeCompanyMeta.find(m => m.challengeId === challengeId);
}

export function getChallengesForCompany(companySlug: string): CompanyChallengeMeta[] {
  return challengeCompanyMeta.filter(m => m.companies.includes(companySlug));
}

export function getCompaniesForChallenge(challengeId: string): Company[] {
  const meta = getChallengeCompanyMeta(challengeId);
  if (!meta) return [];
  return companies.filter(c => meta.companies.includes(c.slug));
}

export function getFrequencyLabel(frequency: AskedFrequency): string {
  switch (frequency) {
    case 'frequent': return 'Frequently Asked';
    case 'medium': return 'Sometimes Asked';
    case 'rare': return 'Rarely Asked';
  }
}

export function getFrequencyColor(frequency: AskedFrequency): string {
  switch (frequency) {
    case 'frequent': return 'text-status-success';
    case 'medium': return 'text-status-warning';
    case 'rare': return 'text-muted-foreground';
  }
}

export function getFrequencyBadgeClass(frequency: AskedFrequency): string {
  switch (frequency) {
    case 'frequent': return 'bg-status-success/20 text-status-success border-status-success/50';
    case 'medium': return 'bg-status-warning/20 text-status-warning border-status-warning/50';
    case 'rare': return 'bg-secondary text-muted-foreground border-border';
  }
}
