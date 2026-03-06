import { useParams, Link } from 'react-router-dom';
import { Trophy, ChevronLeft, Search, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useContest, useContestRatingChanges } from '@/hooks/useContests';

import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function ContestLeaderboard() {
  const { id } = useParams();
  const { data: dbContest } = useContest(id);
  const { data: ratingChanges } = useContestRatingChanges(id);
  const contest = dbContest;
  const [search, setSearch] = useState('');

  const leaderboard: { rank: number; username: string; score: number; penalty: number; problems_solved: number; rating_delta: number }[] = [];

  return (
    <div className="container mx-auto px-4 max-w-4xl py-6 space-y-6">
      <Link to={`/contests/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to Contest
      </Link>

      <div className="text-center space-y-2">
        <Trophy className="h-10 w-10 text-status-warning mx-auto" />
        <h1 className="font-display text-2xl font-bold">{contest?.title || 'Contest'} — Leaderboard</h1>
        <p className="text-sm text-muted-foreground">Final standings & rating changes</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search participants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 py-4">
        {[1, 0, 2].map(idx => {
          const entry = leaderboard[idx];
          if (!entry) return null;
          const heights = ['h-28', 'h-20', 'h-16'];
          const colors = ['text-status-warning', 'text-rank-silver', 'text-rank-bronze'];
          const bgColors = ['bg-status-warning/10', 'bg-rank-silver/10', 'bg-rank-bronze/10'];
          const realIdx = [1, 0, 2][idx] === 0 ? 0 : [1, 0, 2][idx] === 1 ? 1 : 2;
          return (
            <div key={entry.rank} className="flex flex-col items-center gap-2">
              <Medal className={cn("h-6 w-6", colors[realIdx])} />
              <p className="text-sm font-medium truncate max-w-[80px]">{entry.username}</p>
              <div className={cn(
                "w-20 rounded-t-lg flex items-end justify-center pb-2",
                heights[realIdx],
                bgColors[realIdx],
                "border border-b-0",
                realIdx === 0 ? "border-status-warning/30" : realIdx === 1 ? "border-rank-silver/30" : "border-rank-bronze/30"
              )}>
                <span className={cn("font-display font-bold text-lg", colors[realIdx])}>
                  #{entry.rank}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Table */}
      <Card className="bg-card/80 border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="p-3 text-left font-heading">Rank</th>
                  <th className="p-3 text-left font-heading">Username</th>
                  <th className="p-3 text-right font-heading">Score</th>
                  <th className="p-3 text-right font-heading">Penalty</th>
                  <th className="p-3 text-right font-heading">Solved</th>
                  <th className="p-3 text-right font-heading">Rating Δ</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(entry => (
                  <tr key={entry.rank} className={cn(
                    "border-b border-border/50 hover:bg-secondary/20 transition-colors",
                    entry.rank <= 3 && "bg-secondary/10"
                  )}>
                    <td className="p-3">
                      <span className={cn(
                        "font-display font-bold",
                        entry.rank === 1 && "text-status-warning",
                        entry.rank === 2 && "text-rank-silver",
                        entry.rank === 3 && "text-rank-bronze"
                      )}>#{entry.rank}</span>
                    </td>
                    <td className="p-3 font-medium text-sm">{entry.username}</td>
                    <td className="p-3 text-right font-display text-primary text-sm">{entry.score}</td>
                    <td className="p-3 text-right text-xs text-muted-foreground">{entry.penalty}m</td>
                    <td className="p-3 text-right text-sm">{entry.problems_solved}</td>
                    <td className="p-3 text-right">
                      <span className={cn(
                        "font-display text-sm font-bold",
                        entry.rating_delta > 0 ? "text-status-success" : "text-destructive"
                      )}>
                        {entry.rating_delta > 0 ? '+' : ''}{entry.rating_delta}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link to={`/contests/${id}/report`}>
          <Button variant="outline" className="gap-2">
            View Your Report <ChevronLeft className="h-4 w-4 rotate-180" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
