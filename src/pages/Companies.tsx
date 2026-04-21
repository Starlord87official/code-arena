import { Link } from 'react-router-dom';
import { Building2, ChevronRight, Trophy, Star, Briefcase, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCompaniesWithCounts,
  companyDefinitions,
  getCompanyDefinitionsByTier,
  CompanyWithChallengeCount,
} from '@/hooks/useCompanyChallenges';
import { PageHeader } from '@/components/bl/PageHeader';
import { SectionHeader } from '@/components/bl/SectionHeader';
import { GlassPanel } from '@/components/bl/GlassPanel';

function CompanyCard({ company }: { company: CompanyWithChallengeCount }) {
  const isTier1 = company.tier === 1;
  return (
    <Link to={`/companies/${company.slug}`} className="block">
      <GlassPanel
        padding="md"
        corners
        sideStripe={isTier1 ? 'ember' : false}
        className="group transition-all duration-300 hover:-translate-y-0.5 hover:border-neon/40"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon/15 to-electric/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-neon" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-text group-hover:text-neon transition-colors">
                {company.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-text-mute">
                <span>
                  <span className="font-mono">{company.challengeCount}</span> problems
                </span>
                {isTier1 && (
                  <Badge className="bg-rank-legend/20 text-rank-legend border-rank-legend/50 text-[10px]">
                    <Star className="h-2.5 w-2.5 mr-1" />
                    Top Tech
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-text-mute group-hover:text-neon group-hover:translate-x-1 transition-all" />
        </div>

        <p className="text-sm text-text-dim line-clamp-2 mb-3">
          {company.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {company.tags.slice(0, 4).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs text-text-dim">
              {tag}
            </Badge>
          ))}
        </div>
      </GlassPanel>
    </Link>
  );
}

function CompanyCardSkeleton() {
  return (
    <GlassPanel padding="md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-3" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-16" />
      </div>
    </GlassPanel>
  );
}

function TierSection({
  tier,
  title,
  companies,
  isLoading,
}: {
  tier: 1 | 2 | 3;
  title: string;
  companies: CompanyWithChallengeCount[];
  isLoading: boolean;
}) {
  const tierCompanyDefs = getCompanyDefinitionsByTier(tier);
  const count = companies.length || tierCompanyDefs.length;
  const tag = `TIER ${String(tier).padStart(2, '0')} // ${title}`;

  const badgeClass =
    tier === 1
      ? 'border-rank-legend/50 text-rank-legend'
      : tier === 2
      ? 'border-rank-platinum/50 text-rank-platinum'
      : 'border-neon/40 text-neon';

  return (
    <div className="mb-10">
      <SectionHeader
        tag={tag}
        right={
          <Badge variant="outline" className={`font-mono ${badgeClass}`}>
            {count} companies
          </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? tierCompanyDefs.map(company => <CompanyCardSkeleton key={company.slug} />)
          : companies.map(company => <CompanyCard key={company.slug} company={company} />)}
      </div>
    </div>
  );
}

export default function Companies() {
  const { data: companiesWithCounts, isLoading } = useCompaniesWithCounts();

  const getCompaniesByTier = (tier: 1 | 2 | 3): CompanyWithChallengeCount[] => {
    if (companiesWithCounts) {
      return companiesWithCounts.filter(c => c.tier === tier);
    }
    return getCompanyDefinitionsByTier(tier).map(def => ({ ...def, challengeCount: 0 }));
  };

  const tier1 = getCompaniesByTier(1);
  const tier2 = getCompaniesByTier(2);
  const tier3 = getCompaniesByTier(3);

  const totalProblems = companiesWithCounts?.reduce((sum, c) => sum + c.challengeCount, 0) || 0;

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          sector="013"
          tag="COMPANIES"
          title={<>COMPANY-WISE <span className="text-neon text-glow">PROBLEMS</span></>}
          subtitle="Practice problems frequently asked at top companies. Filter by company to ace your interviews."
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <GlassPanel padding="md" corners className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-neon" />
            </div>
            <div className="font-mono text-2xl font-bold text-text">
              {companyDefinitions.length}
            </div>
            <div className="text-[10px] text-text-mute uppercase tracking-wide">Companies</div>
          </GlassPanel>

          <GlassPanel padding="md" corners sideStripe="ember" className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-rank-legend" />
            </div>
            <div className="font-mono text-2xl font-bold text-rank-legend">
              {tier1.length}
            </div>
            <div className="text-[10px] text-text-mute uppercase tracking-wide">Top Tech</div>
          </GlassPanel>

          <GlassPanel padding="md" corners className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Briefcase className="h-5 w-5 text-rank-platinum" />
            </div>
            <div className="font-mono text-2xl font-bold text-rank-platinum">
              {tier2.length}
            </div>
            <div className="text-[10px] text-text-mute uppercase tracking-wide">Tier 2</div>
          </GlassPanel>

          <GlassPanel padding="md" corners className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="h-5 w-5 text-status-success" />
            </div>
            <div className="font-mono text-2xl font-bold text-text">
              {isLoading ? '—' : totalProblems}
            </div>
            <div className="text-[10px] text-text-mute uppercase tracking-wide">Total Problems</div>
          </GlassPanel>
        </div>

        {/* Company Tiers */}
        <TierSection
          tier={1}
          title="TOP TECH GIANTS"
          companies={tier1}
          isLoading={isLoading}
        />

        <TierSection
          tier={2}
          title="HIGH-GROWTH TECH"
          companies={tier2}
          isLoading={isLoading}
        />

        <TierSection
          tier={3}
          title="STARTUPS & PRODUCT"
          companies={tier3}
          isLoading={isLoading}
        />

        {/* Info Note */}
        <GlassPanel padding="md" className="mt-8">
          <div className="flex items-center gap-3 justify-center">
            <span className="h-2 w-2 rounded-full bg-neon shadow-[0_0_8px_hsl(var(--neon))]" />
            <p className="text-sm text-text-dim text-center">
              Problems are mapped based on real interview patterns. The library is expanding during Private Beta.
            </p>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
