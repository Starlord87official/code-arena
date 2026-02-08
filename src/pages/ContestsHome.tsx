import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, Clock, Users, Zap, Flag, Filter, Swords, Star,
  TrendingUp, ChevronRight, Crown, Timer, Target, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ContestCardNew } from '@/components/contests/ContestCardNew';
import { useContests, useUserContestRating } from '@/hooks/useContests';
import { getSeedContests, SEED_USER_RATING } from '@/lib/contestSeedData';
import { cn } from '@/lib/utils';

const difficultyFilters = ['all', 'beginner', 'intermediate', 'elite'] as const;
const modeFilters = ['all', 'solo', 'duo', 'clan'] as const;

export default function ContestsHome() {
  const [diffFilter, setDiffFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const { data: dbContests, isLoading } = useContests();
  const { data: dbRating } = useUserContestRating();

  // Use DB data if available, else seed data
  const seedContests = useMemo(() => getSeedContests(), []);
  const contests = dbContests && dbContests.length > 0
    ? dbContests.map(c => ({ ...c, registered_count: 0 }))
    : seedContests;

  const rating = dbRating || SEED_USER_RATING;

  const filtered = contests.filter(c => {
    if (diffFilter !== 'all' && c.difficulty !== diffFilter) return false;
    if (modeFilter !== 'all' && c.mode !== modeFilter) return false;
    return true;
  });

  const liveContests = filtered.filter(c => c.status === 'live');
  const upcomingContests = filtered.filter(c => c.status === 'upcoming');
  const endedContests = filtered.filter(c => c.status === 'ended');

  return (
    <div className="container mx-auto px-4 max-w-6xl py-6 space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-neon-purple/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 blur-[120px] rounded-full" />

        <div className="relative px-6 py-10 md:py-14 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Badge className="bg-primary/20 text-primary border-primary/30">Rated Contests</Badge>
              <Badge className="bg-status-warning/20 text-status-warning border-status-warning/30">Original Problems</Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
              <span className="text-gradient-electric">Compete under pressure.</span>
              <br />
              <span className="text-foreground">Earn your rank.</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              Original problems. Timed rounds. Live leaderboard. Deep analysis.
            </p>

            <div className="flex flex-wrap gap-3 justify-center pt-2">
              {liveContests.length > 0 && (
                <Link to={`/contests/${liveContests[0].id}`}>
                  <Button className="gap-2 bg-status-success hover:bg-status-success/90 text-primary-foreground">
                    <Flame className="h-4 w-4" />
                    Join Live Contest
                  </Button>
                </Link>
              )}
              <Button variant="outline" className="gap-2" onClick={() => {
                document.getElementById('upcoming')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <Clock className="h-4 w-4" />
                Upcoming Schedule
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1.5">
              {difficultyFilters.map(d => (
                <Button
                  key={d}
                  variant={diffFilter === d ? 'default' : 'outline'}
                  size="sm"
                  className="capitalize text-xs"
                  onClick={() => setDiffFilter(d)}
                >
                  {d}
                </Button>
              ))}
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex gap-1.5">
              {modeFilters.map(m => (
                <Button
                  key={m}
                  variant={modeFilter === m ? 'default' : 'outline'}
                  size="sm"
                  className="capitalize text-xs"
                  onClick={() => setModeFilter(m)}
                >
                  {m}
                </Button>
              ))}
            </div>
          </div>

          {/* Live Now */}
          {liveContests.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-heading text-xs uppercase tracking-widest text-status-success flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
                Live Now
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveContests.map(c => <ContestCardNew key={c.id} contest={c} />)}
              </div>
            </div>
          )}

          {/* Upcoming */}
          <div id="upcoming" className="space-y-3">
            <h2 className="font-heading text-xs uppercase tracking-widest text-primary flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Upcoming Contests
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
              </div>
            ) : upcomingContests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingContests.map(c => <ContestCardNew key={c.id} contest={c} />)}
              </div>
            ) : (
              <Card className="bg-card/80 border-border/50">
                <CardContent className="py-8 text-center">
                  <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No upcoming contests match your filters.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Past */}
          <div className="space-y-3">
            <h2 className="font-heading text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5" />
              Past Contests
            </h2>
            {endedContests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {endedContests.map(c => <ContestCardNew key={c.id} contest={c} />)}
              </div>
            ) : (
              <Card className="bg-card/80 border-border/50">
                <CardContent className="py-8 text-center">
                  <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No past contests yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar: Your Stats */}
        <div className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-secondary/30">
                <p className="text-[10px] uppercase text-muted-foreground tracking-widest mb-1">Current Rating</p>
                <p className="text-3xl font-display font-bold text-primary">{rating.rating}</p>
                <p className="text-xs text-muted-foreground mt-1">Max: {rating.max_rating}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                  <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Contests</p>
                  <p className="text-xl font-display font-bold">{rating.contests_played}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                  <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Best Rank</p>
                  <p className="text-xl font-display font-bold text-status-warning">#{rating.best_rank}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <span className="text-xs text-muted-foreground">Contest Streak</span>
                <span className="font-display font-bold text-status-warning flex items-center gap-1">
                  <Flame className="h-4 w-4" />
                  {rating.current_streak}
                </span>
              </div>

              <Link to="/contests/history">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <TrendingUp className="h-3.5 w-3.5" />
                  View Rating History
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Preset Templates */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-heading uppercase tracking-widest text-muted-foreground">
                Contest Presets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: 'Sprint 30', desc: '30 min · 2 problems · Mixed', icon: Zap },
                { name: 'Standard 60', desc: '60 min · 3 problems · ICPC', icon: Timer },
                { name: 'Elite 90', desc: '90 min · 4 problems · IOI', icon: Star },
                { name: 'Championship', desc: 'Feeds into Championship', icon: Crown },
              ].map(p => (
                <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors">
                  <p.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
