import { Trophy, Flame, TrendingUp, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BattleClan, BattleContributor, getStatusColor } from '@/lib/battleData';

interface ClanBattlePanelProps {
  clan: BattleClan;
  contributors: BattleContributor[];
  side: 'A' | 'B';
}

export function ClanBattlePanel({ clan, contributors, side }: ClanBattlePanelProps) {
  const isLeft = side === 'A';
  const accentColor = isLeft ? 'primary' : 'accent';
  const borderClass = isLeft ? 'border-l-4 border-l-primary' : 'border-r-4 border-r-accent';

  return (
    <Card className={`arena-card ${borderClass} bg-card/80 backdrop-blur-sm`}>
      <CardHeader className="pb-3">
        <div className={`flex items-center gap-3 ${isLeft ? '' : 'flex-row-reverse'}`}>
          <Avatar className={`w-12 h-12 border-2 ${isLeft ? 'border-primary' : 'border-accent'}`}>
            <AvatarFallback className={`${isLeft ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'} font-display`}>
              {clan.mentorAvatar}
            </AvatarFallback>
          </Avatar>
          <div className={isLeft ? '' : 'text-right'}>
            <CardTitle className="font-display text-lg">{clan.name}</CardTitle>
            <p className={`text-sm ${isLeft ? 'text-primary' : 'text-accent'}`}>{clan.mentorName}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score & Status */}
        <div className={`flex items-center justify-between p-3 rounded-lg bg-secondary/50 ${isLeft ? '' : 'flex-row-reverse'}`}>
          <div className={isLeft ? '' : 'text-right'}>
            <div className={`text-3xl font-display font-bold ${isLeft ? 'text-primary neon-text' : 'text-accent neon-text-cyan'}`}>
              {clan.battleScore.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Battle XP</p>
          </div>
          <div className={`flex flex-col items-${isLeft ? 'end' : 'start'} gap-1`}>
            <Badge 
              variant="outline" 
              className={`${
                clan.status === 'leading' 
                  ? 'bg-status-success/20 text-status-success border-status-success/30' 
                  : clan.status === 'at-risk'
                    ? 'bg-destructive/20 text-destructive border-destructive/30 animate-pulse'
                    : 'bg-secondary text-muted-foreground border-border'
              }`}
            >
              {clan.status === 'leading' && <TrendingUp className="w-3 h-3 mr-1" />}
              {clan.status === 'at-risk' && <AlertTriangle className="w-3 h-3 mr-1" />}
              {clan.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Top Contributors */}
        <div>
          <div className={`flex items-center gap-2 mb-3 ${isLeft ? '' : 'flex-row-reverse'}`}>
            <Trophy className={`w-4 h-4 ${isLeft ? 'text-primary' : 'text-accent'}`} />
            <span className="text-sm font-semibold text-foreground uppercase tracking-wider">Top Contributors</span>
          </div>
          
          <div className="space-y-2">
            {contributors.map((contributor, index) => (
              <div 
                key={contributor.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-secondary/50 ${
                  isLeft ? '' : 'flex-row-reverse'
                } ${index === 0 ? 'bg-secondary/30' : ''}`}
              >
                {/* Rank */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 
                    ? 'bg-rank-gold/20 text-rank-gold' 
                    : index === 1 
                      ? 'bg-rank-silver/20 text-rank-silver'
                      : index === 2
                        ? 'bg-rank-bronze/20 text-rank-bronze'
                        : 'bg-secondary text-muted-foreground'
                }`}>
                  {contributor.rank}
                </div>
                
                {/* Avatar */}
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-secondary text-foreground text-xs">
                    {contributor.avatar}
                  </AvatarFallback>
                </Avatar>
                
                {/* Info */}
                <div className={`flex-1 ${isLeft ? '' : 'text-right'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{contributor.username}</span>
                    {contributor.streak && (
                      <Flame className="w-3 h-3 text-status-warning animate-streak-flame" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {contributor.problemsSolved} solved • +{contributor.xpGained} XP
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <div className={`text-center p-2 rounded-lg bg-secondary/30 ${isLeft ? '' : 'order-2'}`}>
            <div className={`text-lg font-display font-bold ${isLeft ? 'text-primary' : 'text-accent'}`}>
              {contributors.reduce((sum, c) => sum + c.problemsSolved, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Problems</p>
          </div>
          <div className={`text-center p-2 rounded-lg bg-secondary/30 ${isLeft ? '' : 'order-1'}`}>
            <div className={`text-lg font-display font-bold ${isLeft ? 'text-primary' : 'text-accent'}`}>
              {contributors.filter(c => c.streak).length}
            </div>
            <p className="text-xs text-muted-foreground">On Streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
