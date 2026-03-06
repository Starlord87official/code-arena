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

import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Empty history — will be populated from real contest data
const HISTORY: { contestId: string; title: string; date: Date; rank: number; score: number; ratingDelta: number; oldRating: number; newRating: number }[] = [];

const EMPTY_RATING = { rating: 1200, max_rating: 1200, contests_played: 0, best_rank: 0, current_streak: 0 };

export default function ContestHistory() {
  const { data: dbRating } = useUserContestRating();
  const rating = dbRating || EMPTY_RATING;

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
