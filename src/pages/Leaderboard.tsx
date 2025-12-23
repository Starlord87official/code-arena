import { useState } from 'react';
import { Trophy, Crown, Medal, TrendingUp, TrendingDown, Zap, Flame, ChevronUp, ChevronDown, AlertTriangle, Target, Swords, ShieldAlert, ChevronsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockLeaderboard, getDivisionColor, getDivisionAura, User } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';

const divisions = ['all', 'legend', 'master', 'diamond', 'platinum', 'gold', 'silver', 'bronze'] as const;

// Mock current user's rank for demo
const CURRENT_USER_RANK = 156;
const PROMOTION_ZONE_SIZE = 3; // Top 3 get promoted
const DEMOTION_ZONE_SIZE = 5; // Bottom 5 at risk

// Mock pressure data
const getPressureData = (rank: number) => {
  const pressures = [
    { status: 'climbing', change: +5, label: 'CLIMBING FAST', icon: TrendingUp },
    { status: 'stable', change: 0, label: 'HOLDING', icon: null },
    { status: 'falling', change: -3, label: 'FALLING', icon: TrendingDown },
    { status: 'at-risk', change: -7, label: 'AT RISK', icon: AlertTriangle },
    { status: 'hunting', change: +2, label: 'HUNTING', icon: Target },
  ];
  return pressures[rank % pressures.length];
};

export default function Leaderboard() {
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const { user } = useAuth();

  const filteredLeaderboard = selectedDivision === 'all' 
    ? mockLeaderboard 
    : mockLeaderboard.filter(u => u.division === selectedDivision);

  const totalPlayers = filteredLeaderboard.length;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-rank-gold animate-pulse" />;
      case 2: return <Medal className="h-6 w-6 text-rank-silver" />;
      case 3: return <Medal className="h-6 w-6 text-rank-bronze" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const isInPromotionZone = (rank: number) => rank <= PROMOTION_ZONE_SIZE;
  const isInDemotionZone = (rank: number, total: number) => rank > total - DEMOTION_ZONE_SIZE;
  const isRival = (rank: number) => rank === CURRENT_USER_RANK - 1 || rank === CURRENT_USER_RANK - 2;
  const isAboveUser = (rank: number) => rank >= CURRENT_USER_RANK - 5 && rank < CURRENT_USER_RANK;
  const isBelowUser = (rank: number) => rank > CURRENT_USER_RANK && rank <= CURRENT_USER_RANK + 3;

  const getRowStyles = (player: User, index: number) => {
    const rank = player.rank;
    const isCurrentUser = player.uid === 'user-001';
    let classes = 'grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all duration-300 ';
    
    if (isCurrentUser) {
      classes += 'bg-primary/20 border-l-4 border-primary ring-1 ring-primary/50 ';
    } else if (isInPromotionZone(rank)) {
      classes += 'bg-gradient-to-r from-status-success/15 to-transparent border-l-4 border-status-success ';
    } else if (isInDemotionZone(rank, totalPlayers)) {
      classes += 'bg-gradient-to-r from-destructive/15 to-transparent border-l-4 border-destructive at-risk-pulse ';
    } else if (isRival(rank)) {
      classes += 'bg-gradient-to-r from-status-warning/20 to-transparent border-l-4 border-status-warning rival-highlight ';
    } else if (isAboveUser(rank)) {
      classes += 'bg-gradient-to-r from-primary/10 to-transparent border-l-2 border-primary/50 ';
    } else if (isBelowUser(rank)) {
      classes += 'bg-gradient-to-r from-muted/30 to-transparent ';
    } else {
      classes += 'hover:bg-primary/5 ';
    }
    
    return classes;
  };

  const getPressureIndicator = (rank: number) => {
    const pressure = getPressureData(rank);
    const colorClass = pressure.status === 'climbing' || pressure.status === 'hunting' 
      ? 'text-status-success' 
      : pressure.status === 'falling' || pressure.status === 'at-risk'
        ? 'text-destructive'
        : 'text-muted-foreground';
    
    return (
      <div className={`flex flex-col items-center ${colorClass}`}>
        <div className="flex items-center gap-1">
          {pressure.icon && <pressure.icon className="h-4 w-4" />}
          <span className={`text-xs font-bold ${pressure.change > 0 ? '' : pressure.change < 0 ? 'animate-pulse' : ''}`}>
            {pressure.change > 0 ? `+${pressure.change}` : pressure.change}
          </span>
        </div>
        <span className="text-[10px] font-medium tracking-wide">{pressure.label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Elite Arena Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <ChevronsUp className="h-6 w-6 text-primary animate-pulse" />
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>
            <Crown className="h-10 w-10 text-rank-gold drop-shadow-[0_0_10px_hsl(var(--rank-gold))]" />
            <h1 className="font-display text-4xl font-bold text-foreground">
              THE <span className="text-primary neon-text">ARENA</span>
            </h1>
            <Crown className="h-10 w-10 text-rank-gold drop-shadow-[0_0_10px_hsl(var(--rank-gold))]" />
            <div className="flex items-center gap-1">
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <ChevronsUp className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Only the <span className="text-primary font-bold">elite</span> rise. Prove your dominance.
          </p>
        </div>

        {/* Live Threat Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="arena-card p-4 text-center border-status-success/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-status-success" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Promotion Zone</span>
            </div>
            <div className="text-2xl font-display font-bold text-status-success">Top 3</div>
            <div className="text-xs text-muted-foreground">Advance to next division</div>
          </div>
          
          <div className="arena-card p-4 text-center border-destructive/30 at-risk-pulse">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Demotion Zone</span>
            </div>
            <div className="text-2xl font-display font-bold text-destructive">Bottom 5</div>
            <div className="text-xs text-muted-foreground">Face elimination</div>
          </div>

          <div className="arena-card p-4 text-center border-status-warning/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Swords className="h-5 w-5 text-status-warning" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Active Battles</span>
            </div>
            <div className="text-2xl font-display font-bold text-status-warning">47</div>
            <div className="text-xs text-muted-foreground">Players fighting now</div>
          </div>

          <div className="arena-card p-4 text-center border-primary/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Your Targets</span>
            </div>
            <div className="text-2xl font-display font-bold text-primary">2</div>
            <div className="text-xs text-muted-foreground">Within striking distance</div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {/* 2nd Place */}
          <div className="flex flex-col items-center pt-8">
            <div className="arena-card p-6 text-center w-full promotion-zone-glow relative overflow-hidden">
              <div className="absolute top-2 left-2">
                <Badge className="bg-status-success/20 text-status-success border-status-success/50 text-[10px]">
                  PROMOTION ZONE
                </Badge>
              </div>
              <div className="relative inline-block mb-4 mt-4">
                <Avatar className="h-20 w-20 border-4 border-rank-silver ring-4 ring-rank-silver/20">
                  <AvatarFallback className="bg-rank-silver/20 text-rank-silver text-2xl font-bold">
                    {mockLeaderboard[1].username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-rank-silver text-background text-xs font-bold px-2 py-0.5 rounded">
                  #2
                </div>
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">{mockLeaderboard[1].username}</h3>
              <Badge className={`${getDivisionColor(mockLeaderboard[1].division)} border border-current/30 bg-current/10 uppercase mb-3`}>
                {mockLeaderboard[1].division}
              </Badge>
              <div className="text-2xl font-bold text-primary">{mockLeaderboard[1].xp.toLocaleString()} XP</div>
              {getPressureIndicator(2)}
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <Crown className="h-10 w-10 text-rank-gold mb-2 animate-pulse" />
            <div className="arena-card p-6 text-center w-full border-rank-gold/50 promotion-zone-glow relative overflow-hidden">
              <div className="absolute top-2 left-2">
                <Badge className="bg-rank-gold/20 text-rank-gold border-rank-gold/50 text-[10px]">
                  👑 CHAMPION
                </Badge>
              </div>
              <div className="relative inline-block mb-4 mt-4">
                <Avatar className="h-24 w-24 border-4 border-rank-gold ring-4 ring-rank-gold/30">
                  <AvatarFallback className="bg-rank-gold/20 text-rank-gold text-3xl font-bold">
                    {mockLeaderboard[0].username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-rank-gold text-background text-xs font-bold px-3 py-1 rounded">
                  #1
                </div>
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-1">{mockLeaderboard[0].username}</h3>
              <Badge className={`${getDivisionColor(mockLeaderboard[0].division)} border border-current/30 bg-current/10 uppercase mb-3`}>
                {mockLeaderboard[0].division}
              </Badge>
              <div className="text-3xl font-bold text-primary neon-text">{mockLeaderboard[0].xp.toLocaleString()} XP</div>
              <p className="text-xs text-muted-foreground mt-2 italic">"The throne awaits a worthy challenger."</p>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center pt-12">
            <div className="arena-card p-6 text-center w-full promotion-zone-glow relative overflow-hidden">
              <div className="absolute top-2 left-2">
                <Badge className="bg-status-success/20 text-status-success border-status-success/50 text-[10px]">
                  PROMOTION ZONE
                </Badge>
              </div>
              <div className="relative inline-block mb-4 mt-4">
                <Avatar className="h-16 w-16 border-4 border-rank-bronze ring-4 ring-rank-bronze/20">
                  <AvatarFallback className="bg-rank-bronze/20 text-rank-bronze text-xl font-bold">
                    {mockLeaderboard[2].username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-rank-bronze text-background text-xs font-bold px-2 py-0.5 rounded">
                  #3
                </div>
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">{mockLeaderboard[2].username}</h3>
              <Badge className={`${getDivisionColor(mockLeaderboard[2].division)} border border-current/30 bg-current/10 uppercase mb-3`}>
                {mockLeaderboard[2].division}
              </Badge>
              <div className="text-xl font-bold text-primary">{mockLeaderboard[2].xp.toLocaleString()} XP</div>
              {getPressureIndicator(3)}
            </div>
          </div>
        </div>

        {/* Division Filter */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {divisions.map((div) => (
            <Button
              key={div}
              variant={selectedDivision === div ? 'arena' : 'outline'}
              size="sm"
              onClick={() => setSelectedDivision(div)}
              className="capitalize"
            >
              {div === 'all' ? 'All Divisions' : div}
            </Button>
          ))}
        </div>

        {/* Zone Legend */}
        <div className="flex flex-wrap gap-4 justify-center mb-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-status-success"></div>
            <span className="text-muted-foreground">Promotion Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-status-warning"></div>
            <span className="text-muted-foreground">Rival (Target)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span className="text-muted-foreground">You / Above You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive"></div>
            <span className="text-muted-foreground">Demotion Zone</span>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="arena-card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border text-sm font-medium text-muted-foreground bg-muted/30">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">Player</div>
            <div className="col-span-2 text-center">Division</div>
            <div className="col-span-2 text-center">XP</div>
            <div className="col-span-1 text-center">Streak</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          <div className="divide-y divide-border/50">
            {filteredLeaderboard.map((player, index) => {
              const isCurrentUser = player.uid === 'user-001';
              const inDemotion = isInDemotionZone(player.rank, totalPlayers);
              
              return (
                <div 
                  key={player.uid}
                  className={getRowStyles(player, index)}
                >
                  <div className="col-span-1 flex items-center justify-center">
                    {getRankIcon(player.rank)}
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="relative">
                      <Avatar className={`h-10 w-10 border-2 ${getDivisionColor(player.division).replace('text-', 'border-')}`}>
                        <AvatarFallback className="bg-muted text-foreground font-bold">
                          {player.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isRival(player.rank) && (
                        <div className="absolute -top-1 -right-1">
                          <Target className="h-4 w-4 text-status-warning" />
                        </div>
                      )}
                      {inDemotion && (
                        <div className="absolute -top-1 -right-1">
                          <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        {player.username}
                        {isCurrentUser && <Badge className="bg-primary/20 text-primary text-[10px]">YOU</Badge>}
                        {isRival(player.rank) && <Badge className="bg-status-warning/20 text-status-warning text-[10px]">RIVAL</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {player.solvedChallenges} solved • Lv.{player.level}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <Badge className={`${getDivisionColor(player.division)} border border-current/30 bg-current/10 uppercase`}>
                      {player.division}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="font-bold text-primary flex items-center justify-center gap-1">
                      <Zap className="h-4 w-4" />
                      {player.xp.toLocaleString()}
                    </span>
                    {isAboveUser(player.rank) && (
                      <span className="text-[10px] text-status-warning">+{(player.xp - 12340).toLocaleString()} ahead</span>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {player.streak > 0 && (
                      <span className="flex items-center gap-1 text-status-warning">
                        <Flame className="h-4 w-4" />
                        {player.streak}
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    {getPressureIndicator(player.rank)}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {isRival(player.rank) ? (
                      <Button variant="arena" size="sm" className="text-xs h-7 px-2">
                        <Swords className="h-3 w-3 mr-1" />
                        HUNT
                      </Button>
                    ) : !isCurrentUser ? (
                      <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                        View
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User's Threat Assessment */}
        {user && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Your Position */}
            <div className="arena-card p-5 border-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Your Position</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-display text-4xl font-bold text-primary neon-text">#156</span>
                  <span className="text-muted-foreground ml-2">of 2,847</span>
                </div>
                <div className="text-right">
                  <div className="text-status-success flex items-center gap-1 justify-end">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-bold">+12</span>
                  </div>
                  <span className="text-xs text-muted-foreground">this week</span>
                </div>
              </div>
            </div>

            {/* Immediate Threat */}
            <div className="arena-card p-5 border-status-warning/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-status-warning" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Immediate Threat</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground">NinjaCode99</span>
                  <span className="text-muted-foreground ml-2">#155</span>
                </div>
                <div className="text-right">
                  <span className="text-status-warning font-bold">+230 XP</span>
                  <div className="text-xs text-muted-foreground">ahead of you</div>
                </div>
              </div>
              <Button variant="arena" size="sm" className="w-full mt-3">
                <Swords className="h-4 w-4 mr-2" />
                Challenge to Battle
              </Button>
            </div>

            {/* Demotion Warning */}
            <div className="arena-card p-5 border-destructive/30">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Safety Margin</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-display text-2xl font-bold text-foreground">1,240 XP</span>
                  <div className="text-xs text-muted-foreground">above demotion</div>
                </div>
                <Badge className="bg-status-success/20 text-status-success border-status-success/50">
                  SAFE
                </Badge>
              </div>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-status-success to-status-warning rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
