import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { ChallengeCard } from '@/components/cards/ChallengeCard';
import { ContestCard } from '@/components/cards/ContestCard';
import { Calendar } from '@/components/Calendar';
import { RivalsSection } from '@/components/dashboard/RivalsSection';
import { LiveActivityFeed } from '@/components/dashboard/LiveActivityFeed';
import { DivisionProgress } from '@/components/dashboard/DivisionProgress';
import { mockChallenges, mockContests, mockLeaderboard, getXpProgress, User as MockUser } from '@/lib/mockData';
import { mockBattle } from '@/lib/battleData';
import { ChevronRight, Flame, Target, Trophy, Zap, Clock, AlertTriangle, TrendingUp, Swords, Loader2, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMentorAnywhere } from '@/hooks/useUserRole';

export default function Dashboard() {
  const { profile, user, isAuthenticated, isLoading } = useAuth();
  const { isMentor, isLoading: roleLoading } = useIsMentorAnywhere(user?.id);
  
  if (isLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Create a compatible user object from profile for existing components
  const userForComponents: MockUser = {
    uid: profile?.id || '',
    username: profile?.username || 'User',
    email: profile?.email || '',
    avatar: profile?.avatar_url || profile?.username?.[0] || 'U',
    xp: profile?.xp || 0,
    level: Math.floor((profile?.xp || 0) / 500) + 1,
    streak: profile?.streak || 0,
    rank: 42, // Mock rank for now
    division: (profile?.division as any) || 'bronze',
    elo: 1200,
    joinedAt: new Date(profile?.created_at || Date.now()),
    solvedChallenges: 0,
  };

  const xpProgress = getXpProgress(userForComponents.xp, userForComponents.level);
  const xpToNextLevel = (userForComponents.level * 500) - userForComponents.xp;
  const streakAtRisk = new Date().getHours() >= 20; // After 8 PM
  
  // Check if user's clan is in battle (mock: assume user is in clan "Algorithm Elite")
  const userClanId = 'clan-001'; // Mock user's clan
  const isUserClanInBattle = mockBattle.clanA.id === userClanId || mockBattle.clanB.id === userClanId;
  const isClanBattleLive = mockBattle.status === 'live';

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Arena Header with Live Status */}
        <div className="mb-8 relative">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-3xl font-bold">
                  Return to the arena, <span className="text-gradient-electric">{profile?.username || 'Warrior'}</span>
                </h1>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-status-success"></span>
                </span>
              </div>
              <p className="text-muted-foreground">There is only one #1. Prove your ego.</p>
            </div>
            <div className="flex items-center gap-4">
              {streakAtRisk && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/30 animate-pulse">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">Streak expires soon!</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Next contest in 2h 45m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Clan Battle Alert - NEW */}
        {isUserClanInBattle && isClanBattleLive && (
          <Link to="/battle/clan-vs-clan">
            <div className="mb-8 p-5 rounded-xl bg-gradient-to-r from-neon-purple/20 via-primary/10 to-neon-purple/20 border border-neon-purple/50 flex items-center gap-5 hover:border-primary transition-colors group cursor-pointer animate-pulse-slow">
              <div className="p-3 rounded-xl bg-neon-purple/30">
                <Swords className="h-8 w-8 text-neon-purple animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-neon-purple text-white border-0 text-xs">
                    ⚔️ LIVE CLAN BATTLE
                  </Badge>
                  <span className="text-xs text-muted-foreground">Started 12 minutes ago</span>
                </div>
                <p className="font-display font-bold text-lg text-foreground">
                  {mockBattle.clanA.name} vs {mockBattle.clanB.name}
                </p>
                <p className="text-sm text-muted-foreground">Your clan is fighting! Join and contribute to victory.</p>
              </div>
              <Button variant="arena" className="bg-neon-purple hover:bg-neon-purple/80 font-bold group-hover:scale-105 transition-transform">
                <Swords className="h-4 w-4 mr-2" />
                JOIN BATTLE
              </Button>
            </div>
          </Link>
        )}

        {/* Pressure Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { 
              icon: Zap, 
              label: 'XP Today', 
              value: '+150', 
              subtext: `${xpToNextLevel} to level ${userForComponents.level + 1}`,
              color: 'text-primary',
              urgent: false 
            },
            { 
              icon: Flame, 
              label: 'Streak', 
              value: userForComponents.streak, 
              subtext: streakAtRisk ? 'Complete 1 challenge!' : 'Keep it burning',
              color: 'text-status-warning',
              urgent: streakAtRisk
            },
            { 
              icon: Trophy, 
              label: 'Global Rank', 
              value: `#${userForComponents.rank}`, 
              subtext: '3 players within reach',
              color: 'text-rank-diamond',
              urgent: false
            },
            { 
              icon: TrendingUp, 
              label: 'Division', 
              value: userForComponents.division.toUpperCase(), 
              subtext: '153 ELO to Master',
              color: 'text-rank-master',
              urgent: false
            },
          ].map(({ icon: Icon, label, value, subtext, color, urgent }) => (
            <div 
              key={label} 
              className={`arena-card p-4 rounded-xl relative overflow-hidden ${urgent ? 'border-destructive/50 pressure-high' : ''}`}
            >
              {urgent && (
                <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 to-transparent animate-pulse" />
              )}
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                  <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
                </div>
                <Icon className={`h-5 w-5 ${color} ${urgent ? 'animate-pulse' : ''}`} />
              </div>
              <p className={`text-xs mt-2 ${urgent ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                {subtext}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* XP Progress - Intense Design */}
            <div className="arena-card p-6 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl">Level {userForComponents.level}</h3>
                    <p className="text-sm text-muted-foreground">{userForComponents.xp.toLocaleString()} XP Total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-2xl text-primary">{Math.round(xpProgress)}%</p>
                  <p className="text-xs text-muted-foreground">to Level {userForComponents.level + 1}</p>
                </div>
              </div>
              <div className="xp-bar-intense">
                <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
              </div>
              <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                <span>Current: {userForComponents.xp.toLocaleString()} XP</span>
                <span>Next: {(userForComponents.level * 500).toLocaleString()} XP</span>
              </div>
            </div>

            {/* Rivals Section */}
            <RivalsSection currentUser={userForComponents} rivals={mockLeaderboard} />

            {/* Recommended Challenges */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-xl font-bold">Recommended Challenges</h2>
                </div>
                <Link to="/challenges" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {mockChallenges.slice(0, 3).map(challenge => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            </div>

            {/* Upcoming Contests */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-status-warning" />
                  <h2 className="font-display text-xl font-bold">Upcoming Contests</h2>
                </div>
                <Link to="/contests" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {mockContests.slice(0, 2).map(contest => (
                  <ContestCard key={contest.id} contest={contest} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Division Progress */}
            <DivisionProgress user={userForComponents} />
            
            {/* Live Activity Feed */}
            <LiveActivityFeed />

            {/* Calendar */}
            <Calendar />
            
            {/* Quick Actions */}
            <div className="space-y-3">
              <Link to="/battle">
                <Button variant="arena" className="w-full h-12">
                  <Zap className="h-5 w-5" />
                  ENTER BATTLE MODE
                </Button>
              </Link>
              <Link to="/student/dashboard">
                <Button variant="outline" className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Student Dashboard
                </Button>
              </Link>
              {isMentor && (
                <Link to="/mentor-dashboard">
                  <Button variant="outline" className="w-full">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Mentor Dashboard
                  </Button>
                </Link>
              )}
              <Link to="/challenges">
                <Button variant="outline" className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Browse Challenges
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
