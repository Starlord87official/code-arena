import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { ChallengeCard } from '@/components/cards/ChallengeCard';
import { ContestCard } from '@/components/cards/ContestCard';
import { Calendar } from '@/components/Calendar';
import { mockChallenges, mockContests, getXpProgress } from '@/lib/mockData';
import { ChevronRight, Flame, Target, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();
  
  if (!user) return null;

  const xpProgress = getXpProgress(user.xp, user.level);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            Welcome back, <span className="text-gradient-electric">{user.username}</span>
          </h1>
          <p className="text-muted-foreground">The arena awaits. Prove your ego.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Zap, label: 'XP Today', value: '+150', color: 'text-primary' },
                { icon: Flame, label: 'Streak', value: user.streak, color: 'text-status-warning' },
                { icon: Target, label: 'Solved', value: user.solvedChallenges, color: 'text-accent' },
                { icon: Trophy, label: 'Rank', value: `#${user.rank}`, color: 'text-rank-diamond' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="arena-card p-4 rounded-xl">
                  <Icon className={`h-5 w-5 ${color} mb-2`} />
                  <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* XP Progress */}
            <div className="arena-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading font-bold">Level {user.level}</h3>
                  <p className="text-sm text-muted-foreground">{user.xp.toLocaleString()} XP</p>
                </div>
                <p className="text-sm text-primary font-semibold">{Math.round(xpProgress)}% to Level {user.level + 1}</p>
              </div>
              <div className="xp-bar progress-glow h-3">
                <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
              </div>
            </div>

            {/* Recommended Challenges */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold">Recommended Challenges</h2>
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
                <h2 className="font-display text-xl font-bold">Upcoming Contests</h2>
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
            <PlayerCard user={user} />
            <Calendar />
            <Link to="/battle">
              <Button variant="arenaOutline" className="w-full">
                <Zap className="h-4 w-4" />
                Quick Battle
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
