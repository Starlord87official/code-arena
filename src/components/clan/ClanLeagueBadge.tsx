import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  getClanLeague, 
  getLeagueProgress, 
  getXPToNextLeague,
  getNextLeague 
} from '@/lib/clanLeagueData';

interface ClanLeagueBadgeProps {
  totalXP: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ClanLeagueBadge({ 
  totalXP, 
  showProgress = false,
  size = 'md' 
}: ClanLeagueBadgeProps) {
  const league = getClanLeague(totalXP);
  const progress = getLeagueProgress(totalXP);
  const xpToNext = getXPToNextLeague(totalXP);
  const nextLeague = getNextLeague(league.league);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <div className="flex flex-col gap-2">
      <Badge 
        className={`${league.bgColor} ${league.color} ${league.borderColor} border font-heading font-bold ${sizeClasses[size]}`}
      >
        <span className="mr-1">{league.icon}</span>
        {league.name} League
      </Badge>
      
      {showProgress && nextLeague && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Progress to {nextLeague.name}
            </span>
            <span className={league.color}>{progress}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full ${league.bgColor.replace('/20', '')} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {xpToNext.toLocaleString()} XP to {nextLeague.name}
          </p>
        </div>
      )}

      {showProgress && !nextLeague && (
        <div className="text-xs text-center">
          <span className={`${league.color} font-bold`}>👑 Maximum League Reached!</span>
        </div>
      )}
    </div>
  );
}
