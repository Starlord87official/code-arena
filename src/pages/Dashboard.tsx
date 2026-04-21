import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RivalsSection } from '@/components/dashboard/RivalsSection';
import { LiveActivityFeed } from '@/components/dashboard/LiveActivityFeed';
import { DivisionProgress } from '@/components/dashboard/DivisionProgress';
import { RoadmapCard } from '@/components/roadmap/RoadmapCard';
import { RevisionSummaryCard } from '@/components/revision/RevisionSummaryCard';
import { TargetCard } from '@/components/dashboard/TargetCard';
import { RevisionQueueCard } from '@/components/dashboard/RevisionQueueCard';
import { AreasToImproveCard } from '@/components/dashboard/AreasToImproveCard';
import { InterviewReadinessCard } from '@/components/dashboard/InterviewReadinessCard';
import { getXpProgress, User as MockUser } from '@/lib/mockData';
import {
  ChevronRight,
  Flame,
  Target,
  Trophy,
  Zap,
  AlertTriangle,
  TrendingUp,
  Loader2,
  Swords,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/bl/PageHeader';
import { StatTile } from '@/components/bl/StatTile';
import { GlassPanel } from '@/components/bl/GlassPanel';
import { SectionHeader } from '@/components/bl/SectionHeader';

export default function Dashboard() {
  const { profile, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const userForComponents: MockUser = {
    uid: profile?.id || '',
    username: profile?.username || 'User',
    email: '',
    avatar: profile?.avatar_url || profile?.username?.[0] || 'U',
    xp: profile?.xp || 0,
    level: Math.floor((profile?.xp || 0) / 500) + 1,
    streak: profile?.streak || 0,
    rank: 0,
    division: (profile?.division as any) || 'bronze',
    elo: 1200,
    joinedAt: new Date(profile?.created_at || Date.now()),
    solvedChallenges: 0,
  };

  const xpProgress = getXpProgress(userForComponents.xp, userForComponents.level);
  const xpToNextLevel = userForComponents.level * 500 - userForComponents.xp;
  const streakAtRisk = new Date().getHours() >= 20;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Hero header */}
        <PageHeader
          sector="001"
          title={
            (
              <>
                Welcome to the arena,{' '}
                <span className="relative inline-block text-neon text-glow bl-glitch">
                  {profile?.username || 'Warrior'}
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon to-transparent" />
                </span>
              </>
            ) as unknown as string
          }
          subtitle="You're among the first warriors. Build your foundation and rise. Every challenge is another kill. Only the Egoists make it to the top."
          right={
            <>
              <Badge className="bg-neon/10 text-neon border-neon/40 font-display tracking-[0.2em] text-[11px]">
                <Sparkles className="h-3 w-3 mr-1" />
                EARLY ADOPTER
              </Badge>
              {streakAtRisk && userForComponents.streak > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 border border-destructive/40 bg-destructive/10 animate-pulse">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-xs font-semibold text-destructive">Streak expires soon</span>
                </div>
              )}
            </>
          }
        />

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatTile
            label="Total XP"
            value={userForComponents.xp.toLocaleString()}
            sub={xpToNextLevel > 0 ? `${xpToNextLevel} to Level ${userForComponents.level + 1}` : 'Keep going!'}
            icon={Zap}
            accent="neon"
            index={0}
          />
          <StatTile
            label="Streak"
            value={userForComponents.streak}
            sub={
              userForComponents.streak === 0
                ? 'Complete a challenge to ignite'
                : streakAtRisk
                  ? 'Complete 1 today!'
                  : 'Keep it burning'
            }
            icon={Flame}
            accent="ember"
            index={1}
          />
          <StatTile
            label="Level"
            value={String(userForComponents.level).padStart(2, '0')}
            sub="Keep solving to rank up"
            icon={Trophy}
            accent="gold"
            index={2}
          />
          <StatTile
            label="Division"
            value={userForComponents.division.toUpperCase()}
            sub="Climb with consistent kills"
            icon={TrendingUp}
            accent="electric"
            index={3}
            compact
          />
        </div>

        {/* Recommendation banner */}
        <GlassPanel padding="md" className="mb-8 bl-side-stripe">
          <div className="flex items-start gap-3 pl-2">
            <div className="p-2 bg-neon/15 border border-neon/30 flex-shrink-0">
              <BookOpen className="h-5 w-5 text-neon" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-text mb-1 tracking-wide">
                RECOMMENDED NEXT STEP
              </h3>
              <p className="text-sm text-text-dim">
                Start with the first unlocked topic in your roadmap to begin building strong fundamentals.
              </p>
            </div>
          </div>
        </GlassPanel>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Level / XP progress */}
            <GlassPanel padding="lg" className="overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon to-transparent" />
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-neon/30 blur-lg" />
                    <div className="relative flex h-12 w-12 items-center justify-center bg-gradient-to-br from-neon/20 to-electric/20 border border-neon/50 bl-clip-notch">
                      <Zap className="h-5 w-5 text-neon" />
                    </div>
                  </div>
                  <div>
                    <span className="font-display text-[10px] font-bold tracking-[0.3em] text-neon/80">
                      RANK PROGRESS
                    </span>
                    <h3 className="font-display text-3xl font-bold tracking-tight leading-none mt-1 text-text">
                      Level <span className="text-neon text-glow">{String(userForComponents.level).padStart(2, '0')}</span>
                    </h3>
                    <p className="mt-1.5 font-mono text-[12px] text-text-dim">
                      {userForComponents.xp.toLocaleString()} XP total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-4xl md:text-5xl font-bold leading-none tabular-nums text-neon text-glow">
                    {Math.round(xpProgress)}%
                  </div>
                  <div className="mt-2 font-display text-[11px] font-bold tracking-[0.2em] text-text-dim">
                    TO LEVEL {String(userForComponents.level + 1).padStart(2, '0')}
                  </div>
                </div>
              </div>

              <div className="mt-6 relative">
                <div className="h-3 bl-bar-track overflow-hidden">
                  <div className="relative h-full bl-shimmer" style={{ width: `${xpProgress}%` }}>
                    <div className="absolute inset-y-0 right-0 w-1 bg-white shadow-[0_0_16px_#ffffff,0_0_32px_hsl(var(--neon))]" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center pointer-events-none">
                  {[25, 50, 75].map((m) => (
                    <div key={m} className="absolute h-3 w-px bg-void/80" style={{ left: `${m}%` }} />
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between font-mono text-[11px]">
                <span className="text-text-mute">CURRENT: <span className="text-neon">{userForComponents.xp.toLocaleString()} XP</span></span>
                <span className="text-text-mute">NEXT: <span className="text-neon">{(userForComponents.level * 500).toLocaleString()} XP</span></span>
              </div>
            </GlassPanel>

            {/* Roadmap */}
            <div>
              <SectionHeader tag="LEARNING PATH ACTIVE" />
              <RoadmapCard roadmapId="dsa" />
            </div>

            {/* Rivals */}
            <RivalsSection currentUser={userForComponents} rivals={[]} />

            {/* Practice CTA */}
            <div>
              <SectionHeader
                tag="PRACTICE GROUNDS"
                right={
                  <Link to="/challenges" className="text-xs text-neon hover:text-neon-soft flex items-center gap-1 font-display tracking-wide">
                    BROWSE ALL <ChevronRight className="h-3 w-3" />
                  </Link>
                }
              />
              <GlassPanel padding="lg" className="text-center">
                <div className="inline-flex items-center justify-center p-3 bg-neon/10 border border-neon/30 bl-clip-notch mb-3">
                  <Target className="h-6 w-6 text-neon" />
                </div>
                <h3 className="font-display font-semibold text-text mb-2 tracking-wide">READY TO PRACTICE?</h3>
                <p className="text-text-dim text-sm mb-4">
                  Follow your roadmap and solve challenges to earn XP and build your skills.
                </p>
                <Link to="/roadmap">
                  <Button variant="egoist">
                    <BookOpen className="h-4 w-4" />
                    Continue Learning Path
                  </Button>
                </Link>
              </GlassPanel>
            </div>

            {/* Contests CTA */}
            <div>
              <SectionHeader
                tag="CONTESTS"
                right={
                  <Link to="/contests" className="text-xs text-neon hover:text-neon-soft flex items-center gap-1 font-display tracking-wide">
                    VIEW ALL <ChevronRight className="h-3 w-3" />
                  </Link>
                }
              />
              <GlassPanel padding="lg" className="text-center">
                <Badge className="mb-3 bg-ember/15 text-ember border-ember/40 font-display tracking-[0.2em] text-[10px]">
                  COMING SOON
                </Badge>
                <h3 className="font-display font-semibold text-text mb-2 tracking-wide">CONTESTS ARE BREWING</h3>
                <p className="text-text-dim text-sm">
                  Weekly contests will be announced soon. Focus on your roadmap for now!
                </p>
              </GlassPanel>
            </div>
          </div>

          {/* Sidebar column */}
          <div className="space-y-6">
            <InterviewReadinessCard />
            <TargetCard />
            <RevisionSummaryCard />
            <AreasToImproveCard />
            <RevisionQueueCard />
            <DivisionProgress user={userForComponents} />
            <LiveActivityFeed />

            {/* Quick actions */}
            <div className="space-y-3">
              <div>
                <Link to="/battle">
                  <Button variant="egoist" className="w-full h-12">
                    <Swords className="h-5 w-5" />
                    Enter Battle Mode
                  </Button>
                </Link>
                <p className="text-xs text-text-mute text-center mt-1.5 font-mono">
                  Practice under pressure — optional and for fun
                </p>
              </div>
              <Link to="/roadmap">
                <Button variant="egoistGhost" className="w-full">
                  <BookOpen className="h-4 w-4" />
                  Continue Roadmap
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="egoistGhost" className="w-full">
                  <Trophy className="h-4 w-4" />
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
