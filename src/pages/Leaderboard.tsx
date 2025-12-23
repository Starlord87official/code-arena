import { useState } from 'react';
import { Trophy, Crown, Medal, Star, TrendingUp, Zap, Flame, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockLeaderboard, getDivisionColor, getDivisionAura, User } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';

const divisions = ['all', 'legend', 'master', 'diamond', 'platinum', 'gold', 'silver', 'bronze'] as const;

export default function Leaderboard() {
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const { user } = useAuth();

  const filteredLeaderboard = selectedDivision === 'all' 
    ? mockLeaderboard 
    : mockLeaderboard.filter(u => u.division === selectedDivision);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-rank-gold" />;
      case 2: return <Medal className="h-6 w-6 text-rank-silver" />;
      case 3: return <Medal className="h-6 w-6 text-rank-bronze" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-rank-gold/20 to-transparent border-rank-gold/50';
      case 2: return 'bg-gradient-to-r from-rank-silver/20 to-transparent border-rank-silver/50';
      case 3: return 'bg-gradient-to-r from-rank-bronze/20 to-transparent border-rank-bronze/50';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy className="h-10 w-10 text-primary neon-text" />
            <h1 className="font-display text-4xl font-bold text-foreground">
              GLOBAL <span className="text-primary">RANKINGS</span>
            </h1>
            <Trophy className="h-10 w-10 text-primary neon-text" />
          </div>
          <p className="text-muted-foreground">
            Only one can be #1. Climb the ranks. Prove your ego.
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {/* 2nd Place */}
          <div className="flex flex-col items-center pt-8">
            <div className={`arena-card p-6 text-center w-full ${getDivisionAura(mockLeaderboard[1].division)}`}>
              <div className="relative inline-block mb-4">
                <Avatar className="h-20 w-20 border-4 border-rank-silver">
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
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <Crown className="h-10 w-10 text-rank-gold mb-2 animate-pulse" />
            <div className={`arena-card p-6 text-center w-full border-rank-gold/50 ${getDivisionAura(mockLeaderboard[0].division)}`}>
              <div className="relative inline-block mb-4">
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
              <p className="text-xs text-muted-foreground mt-2 italic">"There is only one #1."</p>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center pt-12">
            <div className={`arena-card p-6 text-center w-full ${getDivisionAura(mockLeaderboard[2].division)}`}>
              <div className="relative inline-block mb-4">
                <Avatar className="h-16 w-16 border-4 border-rank-bronze">
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

        {/* Rankings Table */}
        <div className="arena-card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-2 text-center">Division</div>
            <div className="col-span-1 text-center">Level</div>
            <div className="col-span-2 text-center">XP</div>
            <div className="col-span-1 text-center">Streak</div>
            <div className="col-span-1 text-center">Trend</div>
          </div>

          <div className="divide-y divide-border">
            {filteredLeaderboard.map((player, index) => (
              <div 
                key={player.uid}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-primary/5 transition-colors ${getRankBg(player.rank)} ${
                  player.uid === 'user-001' ? 'bg-primary/10 border-l-2 border-primary' : ''
                }`}
              >
                <div className="col-span-1 flex items-center justify-center">
                  {getRankIcon(player.rank)}
                </div>
                <div className="col-span-4 flex items-center gap-3">
                  <Avatar className={`h-10 w-10 border-2 ${getDivisionColor(player.division).replace('text-', 'border-')}`}>
                    <AvatarFallback className="bg-muted text-foreground font-bold">
                      {player.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">{player.username}</div>
                    <div className="text-xs text-muted-foreground">{player.solvedChallenges} challenges solved</div>
                  </div>
                </div>
                <div className="col-span-2 flex justify-center">
                  <Badge className={`${getDivisionColor(player.division)} border border-current/30 bg-current/10 uppercase`}>
                    {player.division}
                  </Badge>
                </div>
                <div className="col-span-1 text-center">
                  <span className="font-bold text-foreground">{player.level}</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="font-bold text-primary flex items-center justify-center gap-1">
                    <Zap className="h-4 w-4" />
                    {player.xp.toLocaleString()}
                  </span>
                </div>
                <div className="col-span-1 flex justify-center">
                  {player.streak > 0 && (
                    <span className="flex items-center gap-1 text-status-warning">
                      <Flame className="h-4 w-4" />
                      {player.streak}
                    </span>
                  )}
                </div>
                <div className="col-span-1 flex justify-center">
                  {index % 3 === 0 ? (
                    <ChevronUp className="h-5 w-5 text-status-success" />
                  ) : index % 3 === 1 ? (
                    <ChevronDown className="h-5 w-5 text-destructive" />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User's Position (if not in top 10) */}
        {user && (
          <div className="mt-6 arena-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">Your Position</span>
                <span className="font-display text-2xl font-bold text-primary">#156</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">To next rank</div>
                  <div className="font-bold text-foreground">+230 XP</div>
                </div>
                <Button variant="arena" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Climb Ranks
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
