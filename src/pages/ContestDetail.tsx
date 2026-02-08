import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Clock, Users, Zap, Calendar, ChevronLeft, Shield,
  Crown, Timer, CheckCircle2, AlertCircle, Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useContest, useMyRegistration, useRegisterForContest, useContestRegistrations } from '@/hooks/useContests';
import { getSeedContests } from '@/lib/contestSeedData';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      }
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  return (
    <div className="flex gap-3">
      {Object.entries(timeLeft).map(([unit, val]) => (
        <div key={unit} className="text-center">
          <div className="bg-secondary/50 rounded-lg px-3 py-2 min-w-[50px]">
            <span className="font-display text-xl font-bold text-primary">
              {val.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] uppercase text-muted-foreground mt-1">{unit}</span>
        </div>
      ))}
    </div>
  );
}

export default function ContestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: dbContest, isLoading } = useContest(id);
  const { data: myReg } = useMyRegistration(id);
  const { data: regs } = useContestRegistrations(id);
  const registerMut = useRegisterForContest();

  const seedContests = getSeedContests();
  const contest = dbContest || seedContests.find(c => c.id === id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 max-w-4xl py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="container mx-auto px-4 max-w-4xl py-8 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Contest not found.</p>
        <Link to="/contests"><Button variant="outline" className="mt-4">Back to Contests</Button></Link>
      </div>
    );
  }

  const startDate = new Date(contest.start_time);
  const endDate = new Date(contest.end_time);
  const isRegistered = !!myReg;
  const regCount = regs?.length || (contest as any).registered_count || 0;

  const handleRegister = () => {
    if (!id) return;
    registerMut.mutate({ contestId: id }, {
      onSuccess: () => toast({ title: 'Registered!', description: 'You are now registered for this contest.' }),
      onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
    });
  };

  const diffColors: Record<string, string> = {
    beginner: 'text-status-success',
    intermediate: 'text-status-warning',
    elite: 'text-destructive',
  };

  return (
    <div className="container mx-auto px-4 max-w-4xl py-6 space-y-6">
      {/* Back */}
      <Link to="/contests" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" />
        All Contests
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
          {contest.status === 'live' && (
            <div className="h-1 bg-gradient-to-r from-status-success via-primary to-status-success animate-electric-flow bg-[length:200%_100%]" />
          )}
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={cn(
                    'border text-[10px] font-display uppercase',
                    contest.status === 'live' ? 'bg-status-success/20 text-status-success border-status-success/30 animate-pulse' :
                    contest.status === 'upcoming' ? 'bg-primary/20 text-primary border-primary/30' :
                    'bg-muted text-muted-foreground border-border'
                  )}>
                    {contest.status === 'live' ? '● LIVE' : contest.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className={cn('text-[10px] capitalize border', diffColors[contest.difficulty] || 'text-muted-foreground')}>
                    {contest.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] uppercase border-border">
                    {contest.format}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] capitalize border-border">
                    {contest.mode}
                  </Badge>
                  {contest.is_championship_qualifier && (
                    <Badge className="bg-status-warning/20 text-status-warning border-status-warning/30 text-[10px]">
                      <Crown className="h-3 w-3 mr-1" /> QUALIFIER
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-display font-bold">{contest.title}</h1>
                {contest.description && <p className="text-sm text-muted-foreground max-w-lg">{contest.description}</p>}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{format(startDate, 'MMM d, yyyy · h:mm a')}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{contest.duration_minutes} min</span>
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{regCount} registered</span>
                  <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" />+{contest.xp_reward} XP</span>
                </div>
              </div>

              {/* Countdown / CTA */}
              <div className="flex flex-col items-center gap-4">
                {contest.status === 'upcoming' && (
                  <>
                    <CountdownTimer targetDate={contest.start_time} />
                    {isRegistered ? (
                      <Badge className="bg-status-success/20 text-status-success border-status-success/30 gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Registered
                      </Badge>
                    ) : (
                      <Button onClick={handleRegister} disabled={registerMut.isPending} className="gap-2">
                        <Flag className="h-4 w-4" />
                        {registerMut.isPending ? 'Registering...' : 'Register Now'}
                      </Button>
                    )}
                  </>
                )}
                {contest.status === 'live' && (
                  <Link to={`/contests/${contest.id}/lobby`}>
                    <Button className="gap-2 bg-status-success hover:bg-status-success/90 text-primary-foreground">
                      Enter Arena
                    </Button>
                  </Link>
                )}
                {contest.status === 'ended' && (
                  <Link to={`/contests/${contest.id}/leaderboard`}>
                    <Button variant="outline" className="gap-2">
                      <Trophy className="h-4 w-4" /> View Results
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rules & Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Rules & Scoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {contest.format === 'icpc' ? (
              <>
                <p>• <span className="text-foreground font-medium">ICPC Format:</span> Binary scoring (AC or not).</p>
                <p>• Penalty: +10 min per wrong submission.</p>
                <p>• Tiebreaker: Lower penalty wins.</p>
              </>
            ) : (
              <>
                <p>• <span className="text-foreground font-medium">IOI Format:</span> Partial scoring by testcases.</p>
                <p>• No penalty for wrong submissions.</p>
                <p>• Maximize your score on each problem.</p>
              </>
            )}
            <p>• Fullscreen recommended. Tab switches are tracked.</p>
            <p>• Autosave every 5 seconds.</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Trophy className="h-4 w-4 text-status-warning" /> Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• <span className="text-foreground font-medium">XP Reward:</span> +{contest.xp_reward} XP</p>
            <p>• <span className="text-foreground font-medium">Rating Impact:</span> {contest.rating_impact ? 'Yes (Rated)' : 'No (Unrated)'}</p>
            {contest.is_championship_qualifier && (
              <p>• <span className="text-status-warning font-medium">Championship Qualifier:</span> Top performers qualify for the next Championship stage.</p>
            )}
            <p>• Top 3 earn exclusive contest badges.</p>
            <p>• Clan XP contribution (capped daily).</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
