import { User, getDivisionColor } from '@/lib/mockData';
import { ArrowUp, ArrowDown, Swords, AlertTriangle } from 'lucide-react';

interface RivalsSectionProps {
  currentUser: User;
  rivals: User[];
}

export function RivalsSection({ currentUser, rivals }: RivalsSectionProps) {
  // Find players immediately above and below current user
  const sortedRivals = [...rivals].sort((a, b) => a.rank - b.rank);
  const userRankIndex = sortedRivals.findIndex(r => r.rank > currentUser.rank);
  
  const playersAhead = sortedRivals.filter(r => r.rank < currentUser.rank).slice(-3);
  const playersBehind = sortedRivals.filter(r => r.rank > currentUser.rank).slice(0, 2);

  const xpToNextRank = playersAhead.length > 0 
    ? playersAhead[playersAhead.length - 1].xp - currentUser.xp 
    : 0;

  const xpLeadOverNext = playersBehind.length > 0
    ? currentUser.xp - playersBehind[0].xp
    : 0;

  const isAtRisk = xpLeadOverNext < 200; // At risk if lead is less than 200 XP

  return (
    <div className="arena-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-destructive/10 via-transparent to-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-status-warning" />
            <h3 className="font-display font-bold">RIVALS NEARBY</h3>
          </div>
          {isAtRisk && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-destructive/20 border border-destructive/50 animate-pulse">
              <AlertTriangle className="h-3 w-3 text-destructive" />
              <span className="text-xs font-semibold text-destructive uppercase">At Risk</span>
            </div>
          )}
        </div>
      </div>

      {/* Players Ahead */}
      <div className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
          <ArrowUp className="h-3 w-3 inline mr-1" />
          Ahead of you
        </p>
        
        {playersAhead.map((player, index) => (
          <div 
            key={player.uid} 
            className={`flex items-center justify-between p-3 rounded-lg bg-secondary/30 player-ahead transition-all hover:bg-secondary/50 ${
              index === playersAhead.length - 1 ? 'rival-card' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`font-display font-bold text-lg w-8 ${getDivisionColor(player.division)}`}>
                #{player.rank}
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center font-display text-sm font-bold">
                {player.username[0]}
              </div>
              <div>
                <p className="font-heading font-semibold text-sm">{player.username}</p>
                <p className={`text-xs ${getDivisionColor(player.division)}`}>{player.division}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-primary">{player.xp.toLocaleString()}</p>
              <p className="text-xs text-destructive">+{(player.xp - currentUser.xp).toLocaleString()} XP ahead</p>
            </div>
          </div>
        ))}

        {playersAhead.length > 0 && (
          <div className="mt-3 p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5">
            <p className="text-center text-sm">
              <span className="text-muted-foreground">Need </span>
              <span className="font-display font-bold text-primary">{xpToNextRank.toLocaleString()} XP</span>
              <span className="text-muted-foreground"> to overtake</span>
            </p>
          </div>
        )}
      </div>

      {/* Current User Position */}
      <div className="px-4">
        <div className="p-3 rounded-lg bg-primary/20 border border-primary/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-pulse" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="font-display font-bold text-xl text-primary">#{currentUser.rank}</div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold shadow-neon">
                {currentUser.username[0]}
              </div>
              <div>
                <p className="font-heading font-bold">{currentUser.username}</p>
                <p className="text-xs text-primary">YOU</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-lg text-primary">{currentUser.xp.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Players Behind */}
      <div className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
          <ArrowDown className="h-3 w-3 inline mr-1" />
          Chasing you
        </p>
        
        {playersBehind.map((player, index) => (
          <div 
            key={player.uid} 
            className={`flex items-center justify-between p-3 rounded-lg bg-secondary/30 player-behind transition-all hover:bg-secondary/50 ${
              index === 0 && isAtRisk ? 'at-risk' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`font-display font-bold text-lg w-8 ${getDivisionColor(player.division)}`}>
                #{player.rank}
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center font-display text-sm font-bold">
                {player.username[0]}
              </div>
              <div>
                <p className="font-heading font-semibold text-sm">{player.username}</p>
                <p className={`text-xs ${getDivisionColor(player.division)}`}>{player.division}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-muted-foreground">{player.xp.toLocaleString()}</p>
              <p className="text-xs text-status-success">
                {index === 0 && isAtRisk ? (
                  <span className="text-destructive">Only {xpLeadOverNext} XP lead!</span>
                ) : (
                  `${(currentUser.xp - player.xp).toLocaleString()} XP behind`
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}