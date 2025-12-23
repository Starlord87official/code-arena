import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { ChallengeCard } from '@/components/cards/ChallengeCard';
import { ContestCard } from '@/components/cards/ContestCard';
import { Calendar } from '@/components/Calendar';
import { RivalsSection } from '@/components/dashboard/RivalsSection';
import { LiveActivityFeed } from '@/components/dashboard/LiveActivityFeed';
import { DivisionProgress } from '@/components/dashboard/DivisionProgress';
import { mockChallenges, mockContests, mockLeaderboard, getXpProgress } from '@/lib/mockData';
import { ChevronRight, Flame, Target, Trophy, Zap, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();
  
  if (!user) return null;

  const xpProgress = getXpProgress(user.xp, user.level);
  const xpToNextLevel = (user.level * 500) - user.xp;
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
                  Return to the arena, <span className="text-gradient-electric">{user.username}</span>
                </h1>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-status-success"></span>
                </span>
              </div>
              <p className="text-muted-foreground">There is only one #1. Prove your ego.</p>
            </div>
            
            {/* Quick Status Indicators */}
            <div className="flex items-center gap-3">
              {streakAtRisk && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/20 border border-destructive/50 animate-pulse">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">Streak at risk!</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-status-success/20 border border-status-success/50">
                <div className="relative">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-status-success animate-ping opacity-50"></span>
                  <span className="relative h-2 w-2 rounded-full bg-status-success inline-block"></span>
                </div>
                <span className="text-sm font-semibold text-status-success">Arena Live</span>
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
              subtext: `${xpToNextLevel} to level ${user.level + 1}`,
              color: 'text-primary',
              urgent: false 
            },
            { 
              icon: Flame, 
              label: 'Streak', 
              value: user.streak, 
              subtext: streakAtRisk ? 'Complete 1 challenge!' : 'Keep it burning',
              color: 'text-status-warning',
              urgent: streakAtRisk
            },
            { 
              icon: Trophy, 
              label: 'Global Rank', 
              value: `#${user.rank}`, 
              subtext: '3 players within reach',
              color: 'text-rank-diamond',
              urgent: false
            },
            { 
              icon: TrendingUp, 
              label: 'Division', 
              value: user.division.toUpperCase(), 
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
              <div className="relative">
                <Icon className={`h-5 w-5 ${color} mb-2 ${label === 'Streak' ? 'streak-flame' : ''}`} />
                <p className={`font-display text-2xl font-bold ${color} stat-value`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-xs mt-1 ${urgent ? 'text-destructive' : 'text-muted-foreground'}`}>{subtext}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* XP Progress - Enhanced */}
            <div className="arena-card p-6 rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xl">Level {user.level}</h3>
                      <p className="text-sm text-muted-foreground">{user.xp.toLocaleString()} XP Total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-2xl text-primary">{Math.round(xpProgress)}%</p>
                    <p className="text-xs text-muted-foreground">to Level {user.level + 1}</p>
                  </div>
                </div>
                <div className="xp-bar-intense">
                  <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
                </div>
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>Current: {user.xp.toLocaleString()} XP</span>
                  <span>Next: {(user.level * 500).toLocaleString()} XP</span>
                </div>
              </div>
            </div>

            {/* Rivals Section - NEW */}
            <RivalsSection currentUser={user} rivals={mockLeaderboard} />

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
            <DivisionProgress user={user} />
            
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
              <Link to="/challenges">
                <Button variant="arenaOutline" className="w-full">
                  <Target className="h-4 w-4" />
                  Find Challenge
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}