import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { ChallengeCard } from '@/components/cards/ChallengeCard';
import { ContestCard } from '@/components/cards/ContestCard';
import { RivalsSection } from '@/components/dashboard/RivalsSection';
import { LiveActivityFeed } from '@/components/dashboard/LiveActivityFeed';
import { DivisionProgress } from '@/components/dashboard/DivisionProgress';
import { RoadmapCard } from '@/components/roadmap/RoadmapCard';
import { RevisionSummaryCard } from '@/components/revision/RevisionSummaryCard';
import { TargetCard } from '@/components/dashboard/TargetCard';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { RevisionQueueCard } from '@/components/dashboard/RevisionQueueCard';
import { AreasToImproveCard } from '@/components/dashboard/AreasToImproveCard';
import { InterviewReadinessCard } from '@/components/dashboard/InterviewReadinessCard';
import { mockChallenges, mockContests, mockLeaderboard, getXpProgress, User as MockUser } from '@/lib/mockData';
import { ChevronRight, Flame, Target, Trophy, Zap, Clock, AlertTriangle, TrendingUp, Loader2, Swords, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Dashboard: Navigation and data aggregation layer only
// - No business logic (role checks, feature gating)
// - All features handle their own access internally
// - Battle Mode always visible to all authenticated users
export default function Dashboard() {
  const { profile, user, isAuthenticated, isLoading } = useAuth();
  
  // Show loading while auth is in progress
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to onboarding if not completed
  if (profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
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

        {/* First-Time Guidance Card */}
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm mb-1">Recommended Next Step</h3>
              <p className="text-sm text-muted-foreground">
                Start with the first unlocked topic in your roadmap to begin building strong fundamentals.
              </p>
            </div>
          </div>
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

            {/* DSA Roadmap Progress */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Your Learning Path</h2>
              </div>
              <RoadmapCard roadmapId="dsa" />
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
            {/* Interview Readiness Score */}
            <InterviewReadinessCard />

            {/* Target & Streak Card */}
            <TargetCard />

            {/* Activity Heatmap */}
            <ActivityHeatmap />

            {/* Revision Summary */}
            <RevisionSummaryCard />

            {/* Areas to Improve */}
            <AreasToImproveCard />

            {/* Revision Queue */}
            <RevisionQueueCard />

            {/* Division Progress */}
            <DivisionProgress user={userForComponents} />
            
            {/* Live Activity Feed */}
            <LiveActivityFeed />
            
            {/* Quick Actions */}
            <div className="space-y-3">
              <div>
                <Link to="/battle">
                  <Button variant="arena" className="w-full h-12">
                    <Swords className="h-5 w-5 mr-2" />
                    ENTER BATTLE MODE
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground text-center mt-1.5">
                  Practice under pressure — optional and for fun
                </p>
              </div>
              <Link to="/challenges">
                <Button variant="outline" className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Solve Challenges
                </Button>
              </Link>
              <Link to="/contests">
                <Button variant="outline" className="w-full">
                  <Trophy className="h-4 w-4 mr-2" />
                  Join Contests
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
