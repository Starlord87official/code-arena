import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, ChevronLeft, TrendingUp, TrendingDown, Clock,
  Target, AlertTriangle, CheckCircle2, BookOpen, Repeat, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useContest } from '@/hooks/useContests';
import { getSeedContests, SEED_PROBLEMS, SEED_USER_RATING } from '@/lib/contestSeedData';
import { cn } from '@/lib/utils';

export default function ContestReport() {
  const { id } = useParams();
  const { data: dbContest } = useContest(id);
  const contest = dbContest || getSeedContests().find(c => c.id === id);

  const reportData = {
    rank: 5,
    score: 400,
    ratingDelta: -10,
    oldRating: SEED_USER_RATING.rating + 10,
    newRating: SEED_USER_RATING.rating,
    timeSpent: [12, 28, 0, 0], // per problem minutes
    attempts: [1, 3, 0, 0],
    mistakes: ['Wrong Answer on B (edge case with empty tokens)', 'TLE on B attempt 2'],
  };

  return (
    <div className="container mx-auto px-4 max-w-4xl py-6 space-y-6">
      <Link to={`/contests/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to Contest
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <Badge className="bg-primary/20 text-primary border-primary/30">Post-Contest Report</Badge>
        <h1 className="font-display text-2xl font-bold">{contest?.title || 'Contest'}</h1>
        <p className="text-sm text-muted-foreground">Deep analysis of your performance</p>
      </motion.div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Rank', value: `#${reportData.rank}`, icon: Trophy, color: 'text-status-warning' },
          { label: 'Score', value: reportData.score, icon: Target, color: 'text-primary' },
          { label: 'Rating', value: `${reportData.ratingDelta > 0 ? '+' : ''}${reportData.ratingDelta}`, icon: reportData.ratingDelta >= 0 ? TrendingUp : TrendingDown, color: reportData.ratingDelta >= 0 ? 'text-status-success' : 'text-destructive' },
          { label: 'New Rating', value: reportData.newRating, icon: Zap, color: 'text-primary' },
        ].map((s, i) => (
          <Card key={i} className="bg-card/80 border-border/50">
            <CardContent className="p-4 text-center">
              <s.icon className={cn("h-5 w-5 mx-auto mb-1", s.color)} />
              <p className="text-[10px] uppercase text-muted-foreground tracking-widest">{s.label}</p>
              <p className={cn("text-xl font-display font-bold", s.color)}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Problem Breakdown */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-display">Problem Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SEED_PROBLEMS.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm",
                  p.status === 'solved' ? "bg-status-success/20 text-status-success" :
                  p.status === 'attempted' ? "bg-status-warning/20 text-status-warning" :
                  "bg-secondary/50 text-muted-foreground"
                )}>
                  {p.label}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{reportData.timeSpent[i]}m spent</span>
                    <span>{reportData.attempts[i]} attempt{reportData.attempts[i] !== 1 ? 's' : ''}</span>
                    <span>{p.points} pts</span>
                  </div>
                </div>
                <div>
                  {p.status === 'solved' ? (
                    <CheckCircle2 className="h-5 w-5 text-status-success" />
                  ) : p.status === 'attempted' ? (
                    <AlertTriangle className="h-5 w-5 text-status-warning" />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mistakes & Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-status-warning" /> Mistake Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reportData.mistakes.map((m, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30 text-sm">
                <span className="text-destructive mt-0.5">•</span>
                <span className="text-muted-foreground">{m}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> What to Practice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { days: '3-day', focus: 'Edge case handling for string problems' },
              { days: '7-day', focus: 'DP on subsets and subsequences' },
              { days: '21-day', focus: 'Advanced graph algorithms (max-flow)' },
            ].map((plan, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-secondary/30">
                <Badge variant="outline" className="text-[9px] mb-1">{plan.days}</Badge>
                <p className="text-sm text-muted-foreground">{plan.focus}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Replay Mode */}
      <Card className="bg-card/80 border-border/50">
        <CardContent className="py-6 text-center">
          <Repeat className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-display text-lg font-bold mb-1">Replay Mode</h3>
          <p className="text-sm text-muted-foreground mb-4">Redo problems with variant testcases. Unrated practice.</p>
          <Button variant="outline" className="gap-2">
            <Repeat className="h-4 w-4" /> Start Replay
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        <Link to={`/contests/${id}/leaderboard`}>
          <Button variant="outline" className="gap-2">
            <Trophy className="h-4 w-4" /> View Leaderboard
          </Button>
        </Link>
        <Link to="/contests/history">
          <Button variant="outline" className="gap-2">
            <TrendingUp className="h-4 w-4" /> Rating History
          </Button>
        </Link>
      </div>
    </div>
  );
}
