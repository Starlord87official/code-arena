import { User, getDivisionColor } from '@/lib/mockData';
import { Shield, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface DivisionProgressProps {
  user: User;
}

const divisionThresholds = {
  bronze: { min: 0, max: 1000, next: 'silver' },
  silver: { min: 1000, max: 1400, next: 'gold' },
  gold: { min: 1400, max: 1700, next: 'platinum' },
  platinum: { min: 1700, max: 2000, next: 'diamond' },
  diamond: { min: 2000, max: 2400, next: 'master' },
  master: { min: 2400, max: 2800, next: 'legend' },
  legend: { min: 2800, max: 3500, next: null },
};

export function DivisionProgress({ user }: DivisionProgressProps) {
  const currentDiv = divisionThresholds[user.division];
  const progress = ((user.elo - currentDiv.min) / (currentDiv.max - currentDiv.min)) * 100;
  const eloToNextDivision = currentDiv.max - user.elo;
  const eloDemotion = user.elo - currentDiv.min;
  const isCloseToPromotion = eloToNextDivision <= 100;
  const isCloseToDemotion = eloDemotion <= 100 && user.division !== 'bronze';

  return (
    <div className={`arena-card rounded-xl overflow-hidden ${isCloseToDemotion ? 'at-risk' : ''}`}>
      {/* Division Header */}
      <div className={`p-4 bg-gradient-to-r ${
        isCloseToPromotion 
          ? 'from-status-success/20 to-transparent' 
          : isCloseToDemotion 
            ? 'from-destructive/20 to-transparent'
            : 'from-primary/10 to-transparent'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getDivisionColor(user.division)} bg-current/10`}>
              <Shield className={`h-6 w-6 ${getDivisionColor(user.division)}`} />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg uppercase">{user.division} Division</h3>
              <p className="text-sm text-muted-foreground">ELO: {user.elo}</p>
            </div>
          </div>
          {isCloseToPromotion && currentDiv.next && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-status-success/20 border border-status-success/50">
              <TrendingUp className="h-4 w-4 text-status-success" />
              <span className="text-xs font-semibold text-status-success uppercase">Promotion Zone</span>
            </div>
          )}
          {isCloseToDemotion && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-destructive/20 border border-destructive/50 animate-pulse">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-xs font-semibold text-destructive uppercase">Demotion Zone</span>
            </div>
          )}
        </div>
      </div>

      {/* ELO Progress Bar */}
      <div className="p-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-muted-foreground">{currentDiv.min} ELO</span>
          {currentDiv.next && (
            <span className={getDivisionColor(currentDiv.next as User['division'])}>{currentDiv.next.toUpperCase()} →</span>
          )}
          <span className="text-muted-foreground">{currentDiv.max} ELO</span>
        </div>
        
        <div className="xp-bar-intense h-4 rounded-lg">
          <div 
            className="xp-bar-fill" 
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        {/* Status Messages */}
        <div className="mt-4 space-y-2">
          {isCloseToDemotion && (
            <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">
                Only <span className="font-display font-bold">{eloDemotion} ELO</span> above demotion!
              </p>
            </div>
          )}
          
          {isCloseToPromotion && currentDiv.next && (
            <div className="flex items-center gap-2 p-2 rounded bg-status-success/10 border border-status-success/30">
              <TrendingUp className="h-4 w-4 text-status-success" />
              <p className="text-sm text-status-success">
                <span className="font-display font-bold">{eloToNextDivision} ELO</span> to reach {currentDiv.next}!
              </p>
            </div>
          )}

          {!isCloseToDemotion && !isCloseToPromotion && currentDiv.next && (
            <p className="text-center text-sm text-muted-foreground">
              <span className="font-display font-bold text-primary">{eloToNextDivision}</span> ELO to {currentDiv.next}
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 pb-4 grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded bg-secondary/30">
          <p className="font-display font-bold text-lg text-primary">{user.rank}</p>
          <p className="text-xs text-muted-foreground">Global Rank</p>
        </div>
        <div className="text-center p-2 rounded bg-secondary/30">
          <p className="font-display font-bold text-lg text-status-warning">{user.streak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
        <div className="text-center p-2 rounded bg-secondary/30">
          <p className="font-display font-bold text-lg text-accent">{user.solvedChallenges}</p>
          <p className="text-xs text-muted-foreground">Solved</p>
        </div>
      </div>
    </div>
  );
}