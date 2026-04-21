import { Link } from 'react-router-dom';
import { Building2, ChevronRight, Trophy, Star, Briefcase, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useCompaniesWithCounts, 
  companyDefinitions, 
  getCompanyDefinitionsByTier,
  CompanyWithChallengeCount 
} from '@/hooks/useCompanyChallenges';
import { PageHeader } from '@/components/bl/PageHeader';

function CompanyCard({ company }: { company: CompanyWithChallengeCount }) {
  return (
    <Link to={`/companies/${company.slug}`}>
      <div className="arena-card p-5 rounded-xl hover:border-primary/50 transition-all group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg group-hover:text-primary transition-colors">
                {company.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{company.challengeCount} problems</span>
                {company.tier === 1 && (
                  <Badge className="bg-rank-legend/20 text-rank-legend border-rank-legend/50 text-[10px]">
                    <Star className="h-2.5 w-2.5 mr-1" />
                    Top Tech
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {company.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5">
          {company.tags.slice(0, 4).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}

function CompanyCardSkeleton() {
  return (
    <div className="arena-card p-5 rounded-xl">
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
    </div>
  );
}

function TierSection({ tier, title, icon: Icon, companies, isLoading }: { 
  tier: 1 | 2 | 3; 
  title: string; 
  icon: typeof Trophy;
  companies: CompanyWithChallengeCount[];
  isLoading: boolean;
}) {
  const tierStyles = {
    1: 'from-rank-legend/20 via-rank-gold/10 to-transparent border-rank-legend/30',
    2: 'from-rank-platinum/20 via-rank-silver/10 to-transparent border-rank-platinum/30',
    3: 'from-primary/20 via-primary/5 to-transparent border-primary/30',
  };

  // Get static company list for this tier for skeleton count
  const tierCompanyDefs = getCompanyDefinitionsByTier(tier);

  return (
    <div className="mb-10">
      <div className={`flex items-center gap-3 mb-6 p-4 rounded-lg bg-gradient-to-r ${tierStyles[tier]} border`}>
        <Icon className={`h-6 w-6 ${tier === 1 ? 'text-rank-legend' : tier === 2 ? 'text-rank-platinum' : 'text-primary'}`} />
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <Badge variant="outline" className="ml-auto">
          {companies.length || tierCompanyDefs.length} companies
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          tierCompanyDefs.map(company => (
            <CompanyCardSkeleton key={company.slug} />
          ))
        ) : (
          companies.map(company => (
            <CompanyCard key={company.slug} company={company} />
          ))
        )}
      </div>
    </div>
  );
}

export default function Companies() {
  const { data: companiesWithCounts, isLoading } = useCompaniesWithCounts();

  // Get companies by tier from the data, or use static definitions with 0 count while loading
  const getCompaniesByTier = (tier: 1 | 2 | 3): CompanyWithChallengeCount[] => {
    if (companiesWithCounts) {
      return companiesWithCounts.filter(c => c.tier === tier);
    }
    // While loading, use static definitions with 0 count
    return getCompanyDefinitionsByTier(tier).map(def => ({ ...def, challengeCount: 0 }));
  };

  const tier1 = getCompaniesByTier(1);
  const tier2 = getCompaniesByTier(2);
  const tier3 = getCompaniesByTier(3);

  // Calculate total problems
  const totalProblems = companiesWithCounts?.reduce((sum, c) => sum + c.challengeCount, 0) || 0;
  // Since a challenge can have multiple company_tags, we need unique count from the query
  // For now, show the sum which may include duplicates

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          sector="013"
          tag="COMPANIES"
          title={<>COMPANY-WISE <span className="text-neon text-glow">PROBLEMS</span></>}
          subtitle="Practice problems frequently asked at top companies. Filter by company to ace your interviews."
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="arena-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {companyDefinitions.length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Companies</div>
          </div>
          <div className="arena-card p-4 text-center border-rank-legend/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-rank-legend" />
            </div>
            <div className="text-2xl font-bold text-rank-legend">
              {tier1.length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Top Tech</div>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Briefcase className="h-5 w-5 text-rank-platinum" />
            </div>
            <div className="text-2xl font-bold text-rank-platinum">
              {tier2.length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Tier 2</div>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="h-5 w-5 text-status-success" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? '-' : totalProblems}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Problems</div>
          </div>
        </div>

        {/* Company Tiers */}
        <TierSection 
          tier={1} 
          title="Tier 1: Top Tech Giants" 
          icon={Trophy}
          companies={tier1}
          isLoading={isLoading}
        />
        
        <TierSection 
          tier={2} 
          title="Tier 2: High-Growth Tech" 
          icon={Briefcase}
          companies={tier2}
          isLoading={isLoading}
        />
        
        <TierSection 
          tier={3} 
          title="Tier 3: Startups & Product Companies" 
          icon={Zap}
          companies={tier3}
          isLoading={isLoading}
        />

        {/* Info Note */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border text-center">
          <p className="text-sm text-muted-foreground">
            💡 Problems are mapped based on real interview patterns. The library is expanding during Private Beta.
          </p>
        </div>
      </div>
    </div>
  );
}
