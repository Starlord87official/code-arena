import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, TrendingUp, TrendingDown, Clock, ChevronRight,
  Target, Flame, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContests, useUserContestRating } from '@/hooks/useContests';
import { getSeedContests, SEED_USER_RATING } from '@/lib/contestSeedData';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Mock history entries
const HISTORY = [
  { contestId: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000004', title: 'Weekly Blitz #11', date: new Date(Date.now() - 7 * 86400000), rank: 5, score: 400, ratingDelta: -10, oldRating: 1295, newRating: 1285 },
  { contestId: 'a1b2c3d4-e5f6-4a7b-8c9d-000000000005', title: 'Clan Championship Qualifier', date: new Date(Date.now() - 14 * 86400000), rank: 3, score: 800, ratingDelta: 35, oldRating: 1260, newRating: 1295 },
  { contestId: 'mock-3', title: 'Weekly Blitz #10', date: new Date(Date.now() - 21 * 86400000), rank: 8, score: 200, ratingDelta: -20, oldRating: 1280, newRating: 1260 },
  { contestId: 'mock-4', title: 'Sprint Beta', date: new Date(Date.now() - 28 * 86400000), rank: 2, score: 300, ratingDelta: 50, oldRating: 1230, newRating: 1280 },
  { contestId: 'mock-5', title: 'Weekly Blitz #9', date: new Date(Date.now() - 35 * 86400000), rank: 12, score: 100, ratingDelta: -30, oldRating: 1260, newRating: 1230 },
];

export default function ContestHistory() {
  const { data: dbRating } = useUserContestRating();
  const rating = dbRating || SEED_USER_RATING;

  // Simple rating graph data points
  const graphPoints = HISTORY.slice().reverse().map(h => h.newRating);
  const maxR = Math.max(...graphPoints) + 50;
  const minR = Math.min(...graphPoints) - 50;
  const range = maxR - minR;

  return (
    <div className="container mx-auto px-4 max-w-4xl py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <BarChart3 className="h-8 w-8 text-primary mx-auto" />
        <h1 className="font-display text-2xl font-bold">Contest History</h1>
        <p className="text-sm text-muted-foreground">Your journey through rated contests</p>
      </motion.div>

      {/* Rating Overview */}
      <Card className="bg-card/80 border-border/50">
        <CardContent className="py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Current Rating</p>
              <p className="text-2xl font-display font-bold text-primary">{rating.rating}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Max Rating</p>
              <p className="text-2xl font-display font-bold text-status-warning">{rating.max_rating}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Contests</p>
              <p className="text-2xl font-display font-bold">{rating.contests_played}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground tracking-widest">Streak</p>
              <p className="text-2xl font-display font-bold text-status-warning flex items-center justify-center gap-1">
                <Flame className="h-5 w-5" />{rating.current_streak}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simple Rating Graph */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-heading uppercase tracking-widest text-muted-foreground">Rating Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-end gap-1">
            {graphPoints.map((r, i) => {
              const height = ((r - minR) / range) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-muted-foreground">{r}</span>
                  <div
                    className={cn(
                      "w-full rounded-t transition-all",
                      i === graphPoints.length - 1 ? "bg-primary" : "bg-primary/40"
                    )}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">Simplified rating (MVP)</p>
        </CardContent>
      </Card>

      {/* History List */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-heading uppercase tracking-widest text-muted-foreground">Past Contests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {HISTORY.map((h, i) => (
              <Link to={`/contests/${h.contestId}/report`} key={i} className="flex items-center gap-4 p-4 hover:bg-secondary/20 transition-colors group">
                <div className="text-center min-w-[40px]">
                  <p className={cn(
                    "font-display font-bold",
                    h.rank <= 3 ? "text-status-warning" : "text-foreground"
                  )}>#{h.rank}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{h.title}</p>
                  <p className="text-xs text-muted-foreground">{format(h.date, 'MMM d, yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-display">{h.score} pts</p>
                  <p className={cn(
                    "text-xs font-display font-bold",
                    h.ratingDelta >= 0 ? "text-status-success" : "text-destructive"
                  )}>
                    {h.ratingDelta > 0 ? '+' : ''}{h.ratingDelta}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
