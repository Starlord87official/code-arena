import { Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { getCompaniesForChallenge, getChallengeCompanyMeta, getFrequencyBadgeClass } from '@/lib/companyData';

interface CompanyBadgeProps {
  challengeId: string;
  showFrequency?: boolean;
  maxCompanies?: number;
}

export function CompanyBadge({ challengeId, showFrequency = false, maxCompanies = 3 }: CompanyBadgeProps) {
  const companies = getCompaniesForChallenge(challengeId);
  const meta = getChallengeCompanyMeta(challengeId);
  
  if (companies.length === 0) return null;

  const displayCompanies = companies.slice(0, maxCompanies);
  const remainingCount = companies.length - maxCompanies;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {displayCompanies.map(company => (
        <Link key={company.id} to={`/companies/${company.slug}`}>
          <Badge 
            variant="outline" 
            className="text-[10px] gap-1 hover:bg-primary/10 hover:border-primary/50 transition-colors cursor-pointer"
          >
            <Building2 className="h-2.5 w-2.5" />
            {company.name}
          </Badge>
        </Link>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-[10px]">
          +{remainingCount} more
        </Badge>
      )}
      {showFrequency && meta && (
        <Badge className={`${getFrequencyBadgeClass(meta.frequency)} text-[10px] border`}>
          {meta.frequency === 'frequent' ? '🔥' : meta.frequency === 'medium' ? '📊' : '💤'} {meta.frequency}
        </Badge>
      )}
    </div>
  );
}
