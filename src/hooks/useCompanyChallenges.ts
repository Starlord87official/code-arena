import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

export interface ChallengeExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CompanyChallenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  tags: string[];
  company_tags: string[];
  xp_reward: number;
  rank_impact_win: number;
  rank_impact_loss: number;
  time_limit: number;
  problem_statement: string;
  examples: ChallengeExample[];
  constraints: string[];
  hints: string[];
  is_new?: boolean;
  is_beta?: boolean;
}

export interface CompanyWithChallengeCount {
  slug: string;
  name: string;
  tier: 1 | 2 | 3;
  description: string;
  tags: string[];
  challengeCount: number;
}

// Company definitions - these are static metadata about companies
// The challengeCount will be computed from the database
export const companyDefinitions: Omit<CompanyWithChallengeCount, 'challengeCount'>[] = [
  // Tier 1 - Top Tech
  {
    slug: 'google',
    name: 'Google',
    tier: 1,
    description: 'World leader in search, cloud, and AI. Known for highly algorithmic interview questions focusing on optimization and scalability.',
    tags: ['DSA', 'System Design', 'Algorithms'],
  },
  {
    slug: 'meta',
    name: 'Meta',
    tier: 1,
    description: 'Social media giant building the metaverse. Interviews focus on graphs, dynamic programming, and system design.',
    tags: ['DSA', 'Graphs', 'System Design'],
  },
  {
    slug: 'amazon',
    name: 'Amazon',
    tier: 1,
    description: 'E-commerce and cloud computing leader. Leadership principles matter. Heavy focus on arrays, trees, and optimization.',
    tags: ['DSA', 'Arrays', 'Trees', 'Leadership'],
  },
  {
    slug: 'microsoft',
    name: 'Microsoft',
    tier: 1,
    description: 'Enterprise software and cloud powerhouse. Balanced interviews covering DSA, system design, and problem-solving.',
    tags: ['DSA', 'System Design', 'Arrays'],
  },
  {
    slug: 'apple',
    name: 'Apple',
    tier: 1,
    description: 'Consumer electronics innovator. Focus on clean code, optimization, and user-centric problem solving.',
    tags: ['DSA', 'Optimization', 'Clean Code'],
  },
  // Tier 2
  {
    slug: 'uber',
    name: 'Uber',
    tier: 2,
    description: 'Ride-sharing and delivery platform. Strong focus on graphs, shortest paths, and real-time systems.',
    tags: ['Graphs', 'Shortest Path', 'System Design'],
  },
  {
    slug: 'adobe',
    name: 'Adobe',
    tier: 2,
    description: 'Creative software leader. Interviews balance DSA with domain-specific problems.',
    tags: ['DSA', 'Arrays', 'Strings'],
  },
  {
    slug: 'salesforce',
    name: 'Salesforce',
    tier: 2,
    description: 'CRM and cloud platform. Focus on database concepts, APIs, and scalable solutions.',
    tags: ['DSA', 'Databases', 'System Design'],
  },
  {
    slug: 'atlassian',
    name: 'Atlassian',
    tier: 2,
    description: 'Collaboration tools leader. Values-driven interviews with practical DSA problems.',
    tags: ['DSA', 'Collaboration', 'Problem Solving'],
  },
  {
    slug: 'netflix',
    name: 'Netflix',
    tier: 2,
    description: 'Streaming entertainment leader. Focus on distributed systems, caching, and optimization.',
    tags: ['System Design', 'Distributed Systems', 'Optimization'],
  },
  // Tier 3
  {
    slug: 'flipkart',
    name: 'Flipkart',
    tier: 3,
    description: "India's leading e-commerce platform. Strong focus on DSA, problem-solving, and scalable systems.",
    tags: ['DSA', 'Arrays', 'System Design'],
  },
  {
    slug: 'startups',
    name: 'Startups & Product Companies',
    tier: 3,
    description: 'Growing companies looking for versatile engineers. Practical problems with real-world applications.',
    tags: ['DSA', 'Full Stack', 'Problem Solving'],
  },
];

function parseExamples(examples: Json): ChallengeExample[] {
  if (Array.isArray(examples)) {
    return examples.map((ex) => ({
      input: String((ex as Record<string, unknown>)?.input || ''),
      output: String((ex as Record<string, unknown>)?.output || ''),
      explanation: (ex as Record<string, unknown>)?.explanation 
        ? String((ex as Record<string, unknown>).explanation) 
        : undefined,
    }));
  }
  return [];
}

// Hook to fetch challenges for a specific company
export function useCompanyChallenges(companySlug: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['company-challenges', companySlug],
    queryFn: async () => {
      // Convert company slug to the format used in company_tags
      // e.g., 'google' -> 'Google', 'meta' -> 'Meta'
      const companyDef = companyDefinitions.find(c => c.slug === companySlug);
      if (!companyDef) {
        return [];
      }

      // Use cs (contains) for array filtering
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .contains('company_tags', [companyDef.name]);

      if (error) throw error;

      return (data || []).map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        difficulty: row.difficulty as CompanyChallenge['difficulty'],
        tags: row.tags || [],
        company_tags: row.company_tags || [],
        xp_reward: row.xp_reward,
        rank_impact_win: row.rank_impact_win,
        rank_impact_loss: row.rank_impact_loss,
        time_limit: row.time_limit,
        problem_statement: row.problem_statement,
        examples: parseExamples(row.examples),
        constraints: row.constraints || [],
        hints: row.hints || [],
        is_new: row.is_new,
        is_beta: row.is_beta,
      })) as CompanyChallenge[];
    },
    enabled: isAuthenticated && !!companySlug,
  });
}

// Hook to get all companies with their real challenge counts
export function useCompaniesWithCounts() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['companies-with-counts'],
    queryFn: async () => {
      // Fetch all active challenges with company_tags
      const { data, error } = await supabase
        .from('challenges')
        .select('company_tags')
        .eq('is_active', true);

      if (error) throw error;

      // Count challenges per company
      const companyCounts: Record<string, number> = {};
      
      (data || []).forEach(challenge => {
        const tags = challenge.company_tags || [];
        tags.forEach((tag: string) => {
          companyCounts[tag] = (companyCounts[tag] || 0) + 1;
        });
      });

      // Map company definitions with real counts
      return companyDefinitions.map(def => ({
        ...def,
        challengeCount: companyCounts[def.name] || 0,
      }));
    },
    enabled: isAuthenticated,
  });
}

// Helper to get company definition by slug
export function getCompanyDefinition(slug: string) {
  return companyDefinitions.find(c => c.slug === slug);
}

// Helper to get companies by tier
export function getCompanyDefinitionsByTier(tier: 1 | 2 | 3) {
  return companyDefinitions.filter(c => c.tier === tier);
}
