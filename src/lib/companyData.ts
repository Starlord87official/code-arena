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
    challengeCount: 12,
  },
  {
    id: 'meta',
    name: 'Meta',
    slug: 'meta',
    tier: 1,
    description: 'Social media giant building the metaverse. Interviews focus on graphs, dynamic programming, and system design.',
    tags: ['DSA', 'Graphs', 'System Design'],
    challengeCount: 8,
  },
  {
    id: 'amazon',
    name: 'Amazon',
    slug: 'amazon',
    tier: 1,
    description: 'E-commerce and cloud computing leader. Leadership principles matter. Heavy focus on arrays, trees, and optimization.',
    tags: ['DSA', 'Arrays', 'Trees', 'Leadership'],
    challengeCount: 14,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    slug: 'microsoft',
    tier: 1,
    description: 'Enterprise software and cloud powerhouse. Balanced interviews covering DSA, system design, and problem-solving.',
    tags: ['DSA', 'System Design', 'Arrays'],
    challengeCount: 10,
  },
  {
    id: 'apple',
    name: 'Apple',
    slug: 'apple',
    tier: 1,
    description: 'Consumer electronics innovator. Focus on clean code, optimization, and user-centric problem solving.',
    tags: ['DSA', 'Optimization', 'Clean Code'],
    challengeCount: 5,
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
    id: 'flipkart',
    name: 'Flipkart',
    slug: 'flipkart',
    tier: 3,
    description: 'India\'s leading e-commerce platform. Strong focus on DSA, problem-solving, and scalable systems.',
    tags: ['DSA', 'Arrays', 'System Design'],
    challengeCount: 8,
  },
  {
    id: 'startups',
    name: 'Startups & Product Companies',
    slug: 'startups',
    tier: 3,
    description: 'Growing companies looking for versatile engineers. Practical problems with real-world applications.',
    tags: ['DSA', 'Full Stack', 'Problem Solving'],
    challengeCount: 5,
  },
];

// Mapping challenges to companies
export const challengeCompanyMeta: CompanyChallengeMeta[] = [
  { challengeId: 'ch-001', companies: ['google', 'amazon', 'meta', 'microsoft', 'adobe', 'flipkart', 'startups'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-002', companies: ['google', 'amazon', 'microsoft', 'apple'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-003', companies: ['google', 'meta', 'amazon', 'uber', 'flipkart'], frequency: 'medium', lastAskedYear: 2024 },
  { challengeId: 'ch-004', companies: ['uber', 'amazon', 'google', 'netflix'], frequency: 'medium', lastAskedYear: 2024 },
  { challengeId: 'ch-005', companies: ['meta', 'google', 'amazon'], frequency: 'rare', lastAskedYear: 2023 },
  { challengeId: 'ch-006', companies: ['adobe', 'microsoft', 'startups', 'salesforce', 'atlassian'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-007', companies: ['amazon', 'microsoft', 'apple', 'meta', 'flipkart'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-008', companies: ['google', 'amazon', 'uber'], frequency: 'medium', lastAskedYear: 2024 },
  // Arrays
  { challengeId: 'ch-009', companies: ['amazon', 'microsoft', 'google', 'flipkart'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-010', companies: ['amazon', 'google', 'meta', 'microsoft'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-011', companies: ['amazon', 'google', 'flipkart'], frequency: 'medium', lastAskedYear: 2024 },
  { challengeId: 'ch-012', companies: ['microsoft', 'amazon', 'startups'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-013', companies: ['amazon', 'microsoft', 'flipkart'], frequency: 'medium', lastAskedYear: 2024 },
  { challengeId: 'ch-014', companies: ['google', 'amazon', 'meta', 'microsoft', 'flipkart'], frequency: 'frequent', lastAskedYear: 2025 },
  // Strings
  { challengeId: 'ch-015', companies: ['amazon', 'microsoft', 'startups', 'flipkart'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-016', companies: ['amazon', 'microsoft', 'google'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-017', companies: ['amazon', 'meta', 'microsoft'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-018', companies: ['amazon', 'google', 'meta', 'microsoft', 'flipkart'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-019', companies: ['amazon', 'microsoft', 'google', 'flipkart', 'startups'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-020', companies: ['microsoft', 'amazon', 'startups'], frequency: 'medium', lastAskedYear: 2024 },
  // Linked List
  { challengeId: 'ch-021', companies: ['amazon', 'microsoft', 'flipkart'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-022', companies: ['amazon', 'microsoft', 'google', 'flipkart'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-023', companies: ['amazon', 'meta', 'google'], frequency: 'medium', lastAskedYear: 2024 },
  { challengeId: 'ch-024', companies: ['amazon', 'google', 'meta', 'microsoft'], frequency: 'medium', lastAskedYear: 2024 },
  { challengeId: 'ch-025', companies: ['amazon', 'microsoft', 'flipkart'], frequency: 'medium', lastAskedYear: 2024 },
  // Stack & Queue
  { challengeId: 'ch-026', companies: ['amazon', 'microsoft', 'google'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-027', companies: ['amazon', 'google', 'flipkart'], frequency: 'medium', lastAskedYear: 2024 },
  { challengeId: 'ch-028', companies: ['amazon', 'google', 'meta'], frequency: 'medium', lastAskedYear: 2024 },
  { challengeId: 'ch-029', companies: ['amazon', 'microsoft', 'startups'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-030', companies: ['amazon', 'google', 'meta', 'microsoft'], frequency: 'rare', lastAskedYear: 2023 },
  // Binary Search
  { challengeId: 'ch-031', companies: ['amazon', 'microsoft', 'flipkart', 'startups'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-032', companies: ['amazon', 'google', 'meta', 'microsoft', 'flipkart'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-033', companies: ['amazon', 'google', 'meta'], frequency: 'medium', lastAskedYear: 2024 },
  { challengeId: 'ch-034', companies: ['google', 'amazon', 'meta'], frequency: 'rare', lastAskedYear: 2023 },
  { challengeId: 'ch-035', companies: ['google', 'amazon'], frequency: 'medium', lastAskedYear: 2024 },
  // Trees
  { challengeId: 'ch-036', companies: ['google', 'amazon', 'microsoft', 'flipkart'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-037', companies: ['amazon', 'microsoft', 'google', 'meta'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-038', companies: ['amazon', 'google', 'meta', 'microsoft'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-039', companies: ['amazon', 'microsoft', 'google', 'flipkart'], frequency: 'frequent', lastAskedYear: 2025 },
  { challengeId: 'ch-040', companies: ['amazon', 'google', 'meta'], frequency: 'medium', lastAskedYear: 2024 },
  { challengeId: 'ch-041', companies: ['amazon', 'google', 'meta', 'flipkart'], frequency: 'frequent', lastAskedYear: 2025 },
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
