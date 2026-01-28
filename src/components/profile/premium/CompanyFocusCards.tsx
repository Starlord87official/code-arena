import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface PatternsPracticedCardProps {
  patterns?: { name: string; count: number; percentage?: number }[];
}

export function PatternsPracticedCard({
  patterns = [
    { name: 'Dynamic Programming', count: 73, percentage: 100 },
    { name: 'Binary Search', count: 63, percentage: 86 },
    { name: 'Prefix Sum', count: 59, percentage: 81 },
    { name: 'Graph BFS', count: 31, percentage: 42 },
    { name: 'Top Pointers', count: 34, percentage: 47 },
  ],
}: PatternsPracticedCardProps) {
  return (
    <div className="arena-card p-4">
      <h4 className="font-display font-bold text-sm text-foreground mb-4">Patterns Practiced</h4>
      
      <div className="space-y-3">
        {patterns.map((pattern, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-muted-foreground text-xs">⊟</span>
              <span className="text-sm text-muted-foreground">{pattern.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="h-2 bg-status-success rounded-full" 
                style={{ width: `${pattern.percentage || 50}px` }}
              />
              <span className="font-bold text-foreground w-8 text-right">{pattern.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MostFocusedCompanyCardProps {
  companies?: {
    name: string;
    badge?: string;
    category?: string;
    problemCount?: number;
    timeSpent?: number;
  }[];
}

export function MostFocusedCompanyCard({
  companies = [
    { name: 'Google', badge: 'Top Tech', category: 'DSA: System Design', problemCount: 75, timeSpent: 167 },
    { name: 'Amazon', badge: 'Adternos', category: 'March-oytwic-Paring', problemCount: 28, timeSpent: 37 },
  ],
}: MostFocusedCompanyCardProps) {
  return (
    <div className="arena-card p-4">
      <h4 className="font-display font-bold text-sm text-foreground mb-4">Most Focused Company</h4>
      
      <div className="space-y-6">
        {companies.map((company, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {company.name === 'Google' ? 'G' : 'a'}
                  </span>
                </div>
                <span className="font-bold text-foreground">{company.name}</span>
              </div>
              {company.badge && (
                <Badge className="bg-status-success text-black text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  {company.badge}
                </Badge>
              )}
            </div>
            
            <div className="pl-10 space-y-1 text-sm">
              <div className="text-muted-foreground">{company.category}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">⊙</span>
                  <span className="text-muted-foreground">{company.problemCount} probiend</span>
                </div>
                <span className="font-bold text-foreground">73</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">⊙</span>
                  <span className="text-muted-foreground">Timernot seered</span>
                </div>
                <span className="text-foreground">{company.timeSpent} ×</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
