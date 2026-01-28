import { Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { companyDefinitions } from '@/hooks/useCompanyChallenges';

interface CompanyBadgeProps {
  companyTags?: string[];
  maxCompanies?: number;
}

// Helper to get company slug from name
function getCompanySlug(companyName: string): string | null {
  const company = companyDefinitions.find(c => c.name === companyName);
  return company?.slug || null;
}

export function CompanyBadge({ companyTags = [], maxCompanies = 3 }: CompanyBadgeProps) {
  if (companyTags.length === 0) return null;

  const displayCompanies = companyTags.slice(0, maxCompanies);
  const remainingCount = companyTags.length - maxCompanies;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {displayCompanies.map(companyName => {
        const slug = getCompanySlug(companyName);
        
        if (slug) {
          return (
            <Link key={companyName} to={`/companies/${slug}`}>
              <Badge 
                variant="outline" 
                className="text-[10px] gap-1 hover:bg-primary/10 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <Building2 className="h-2.5 w-2.5" />
                {companyName}
              </Badge>
            </Link>
          );
        }

        // Company not in our definitions - show without link
        return (
          <Badge 
            key={companyName}
            variant="outline" 
            className="text-[10px] gap-1"
          >
            <Building2 className="h-2.5 w-2.5" />
            {companyName}
          </Badge>
        );
      })}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-[10px]">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}
