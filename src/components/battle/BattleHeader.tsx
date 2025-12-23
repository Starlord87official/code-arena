import { useState, useEffect } from 'react';
import { Shield, Zap, Clock, Flame } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ClanBattle, getTimeRemaining, getBattleMomentum } from '@/lib/battleData';

interface BattleHeaderProps {
  battle: ClanBattle;
}

export function BattleHeader({ battle }: BattleHeaderProps) {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(battle.endTime));
  const [momentum, setMomentum] = useState(getBattleMomentum(battle));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(battle.endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [battle.endTime]);

  useEffect(() => {
    setMomentum(getBattleMomentum(battle));
  }, [battle]);

  const isUrgent = timeRemaining.minutes < 10;

  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-destructive/5" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Animated glow lines */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-accent to-primary animate-electric-flow" 
           style={{ backgroundSize: '200% 100%' }} />
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-accent to-primary animate-electric-flow" 
           style={{ backgroundSize: '200% 100%' }} />

      <div className="relative p-6">
        {/* Live Badge & Timer Row */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Badge 
            variant="destructive" 
            className="px-4 py-1.5 text-sm font-display uppercase tracking-widest animate-pulse"
          >
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive-foreground opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive-foreground"></span>
            </span>
            LIVE BATTLE
          </Badge>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
            isUrgent 
              ? 'border-destructive/50 bg-destructive/10 text-destructive' 
              : 'border-border bg-card/50 text-foreground'
          }`}>
            <Clock className={`w-5 h-5 ${isUrgent ? 'animate-pulse' : ''}`} />
            <span className={`font-display text-2xl font-bold tracking-wider ${isUrgent ? 'text-destructive' : 'neon-text'}`}>
              {String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Clan vs Clan */}
        <div className="flex items-center justify-between gap-8">
          {/* Clan A */}
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-4">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {battle.clanA.name}
                </h2>
                <div className="flex items-center justify-end gap-2 text-muted-foreground">
                  <span className="text-sm">led by</span>
                  <span className="text-primary font-semibold">{battle.clanA.mentorName}</span>
                </div>
                <div className="mt-2 flex items-center justify-end gap-3">
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    <Shield className="w-3 h-3 mr-1" />
                    {battle.clanA.memberCount} warriors
                  </Badge>
                  {battle.clanA.status === 'leading' && (
                    <Badge className="bg-status-success/20 text-status-success border border-status-success/30">
                      LEADING
                    </Badge>
                  )}
                  {battle.clanA.status === 'at-risk' && (
                    <Badge className="bg-destructive/20 text-destructive border border-destructive/30 animate-pulse">
                      AT RISK
                    </Badge>
                  )}
                </div>
              </div>
              <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-primary neon-box">
                <AvatarFallback className="bg-primary/20 text-primary font-display text-xl md:text-2xl">
                  {battle.clanA.mentorAvatar}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-4">
              <div className="text-4xl md:text-5xl font-display font-bold text-primary neon-text">
                {battle.clanA.battleScore.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">BATTLE XP</div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-electric rounded-full blur-xl opacity-30 animate-pulse" />
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-card border-2 border-primary flex items-center justify-center neon-box">
                <Zap className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              </div>
            </div>
            <span className="font-display text-2xl md:text-3xl font-black text-muted-foreground">VS</span>
          </div>

          {/* Clan B */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-accent neon-box" style={{ boxShadow: '0 0 20px hsla(185, 100%, 50%, 0.3)' }}>
                <AvatarFallback className="bg-accent/20 text-accent font-display text-xl md:text-2xl">
                  {battle.clanB.mentorAvatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {battle.clanB.name}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm">led by</span>
                  <span className="text-accent font-semibold">{battle.clanB.mentorName}</span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <Badge variant="outline" className="border-accent/30 text-accent">
                    <Shield className="w-3 h-3 mr-1" />
                    {battle.clanB.memberCount} warriors
                  </Badge>
                  {battle.clanB.status === 'leading' && (
                    <Badge className="bg-status-success/20 text-status-success border border-status-success/30">
                      LEADING
                    </Badge>
                  )}
                  {battle.clanB.status === 'at-risk' && (
                    <Badge className="bg-destructive/20 text-destructive border border-destructive/30 animate-pulse">
                      AT RISK
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-4xl md:text-5xl font-display font-bold text-accent neon-text-cyan">
                {battle.clanB.battleScore.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">BATTLE XP</div>
            </div>
          </div>
        </div>

        {/* Momentum Bar */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span className="font-semibold text-primary">{momentum}%</span>
            <span className="font-display uppercase tracking-wider">Momentum</span>
            <span className="font-semibold text-accent">{100 - momentum}%</span>
          </div>
          <div className="relative h-4 rounded-full bg-secondary overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20" />
            
            {/* Clan A progress */}
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
              style={{ width: `${momentum}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-electric-flow" 
                   style={{ backgroundSize: '200% 100%' }} />
            </div>
            
            {/* Clan B progress */}
            <div 
              className="absolute right-0 top-0 h-full bg-gradient-to-l from-accent to-accent/80 transition-all duration-500 ease-out"
              style={{ width: `${100 - momentum}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-transparent animate-electric-flow" 
                   style={{ backgroundSize: '200% 100%' }} />
            </div>
            
            {/* Center indicator */}
            <div className="absolute left-1/2 top-0 w-1 h-full bg-foreground/50 transform -translate-x-1/2" />
          </div>
          
          {/* Momentum labels */}
          {momentum > 55 && (
            <div className="flex items-center justify-start mt-2">
              <Flame className="w-4 h-4 text-primary mr-1 animate-streak-flame" />
              <span className="text-xs text-primary font-semibold">Clan A momentum surge!</span>
            </div>
          )}
          {momentum < 45 && (
            <div className="flex items-center justify-end mt-2">
              <span className="text-xs text-accent font-semibold">Clan B momentum surge!</span>
              <Flame className="w-4 h-4 text-accent ml-1 animate-streak-flame" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
