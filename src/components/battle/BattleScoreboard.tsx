import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, XCircle, Zap, Swords } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlayerScore {
  userId: string;
  username: string;
  score: number;
  problemsSolved: number;
  wrongSubmissions: number;
  lastSolveTime: string | null;
}

interface BattleEvent {
  id: string;
  message: string;
  type: 'solve' | 'wrong' | 'info';
  timestamp: Date;
}

interface BattleScoreboardProps {
  matchId: string;
  myUserId: string;
  myScore: PlayerScore;
  opponentScore: PlayerScore;
  events: BattleEvent[];
}

export function BattleScoreboard({ matchId, myUserId, myScore, opponentScore, events }: BattleScoreboardProps) {
  const isWinning = myScore.score > opponentScore.score;
  const isTied = myScore.score === opponentScore.score;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border">
        <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Swords className="h-3 w-3" /> Live Score
        </h3>
      </div>

      {/* Score Cards */}
      <div className="p-3 space-y-2">
        {/* You */}
        <div className={`p-3 rounded-lg border transition-all ${
          isWinning ? 'border-status-success/50 bg-status-success/5' : isTied ? 'border-border bg-card/50' : 'border-destructive/30 bg-destructive/5'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 border border-primary">
                <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
                  {myScore.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-foreground">You</span>
              <Badge variant="outline" className="text-[9px]">
                {isWinning ? 'LEADING' : isTied ? 'TIED' : 'BEHIND'}
              </Badge>
            </div>
            <span className="text-xl font-bold font-mono text-primary">{myScore.score}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-status-success" /> {myScore.problemsSolved} solved
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-destructive" /> {myScore.wrongSubmissions} wrong
            </span>
          </div>
        </div>

        {/* Opponent */}
        <div className="p-3 rounded-lg border border-border bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 border border-accent">
                <AvatarFallback className="text-[10px] bg-accent/20 text-accent font-bold">
                  {opponentScore.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-foreground">{opponentScore.username}</span>
            </div>
            <span className="text-xl font-bold font-mono text-accent">{opponentScore.score}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-status-success" /> {opponentScore.problemsSolved} solved
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-destructive" /> {opponentScore.wrongSubmissions} wrong
            </span>
          </div>
        </div>
      </div>

      {/* Event Feed */}
      <div className="flex-1 min-h-0 border-t border-border">
        <div className="px-3 py-2 border-b border-border">
          <h4 className="font-display text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
            <Zap className="h-3 w-3 text-status-warning animate-pulse" /> Battle Feed
          </h4>
        </div>
        <div className="overflow-y-auto p-2 space-y-1 max-h-48">
          {events.length === 0 ? (
            <p className="text-[10px] text-muted-foreground text-center py-4">Waiting for action…</p>
          ) : (
            events.slice(0, 10).map((evt) => (
              <div
                key={evt.id}
                className={`p-2 rounded text-[10px] border ${
                  evt.type === 'solve'
                    ? 'bg-status-success/10 border-status-success/30 text-status-success'
                    : evt.type === 'wrong'
                    ? 'bg-destructive/10 border-destructive/30 text-destructive'
                    : 'bg-secondary/50 border-border text-muted-foreground'
                }`}
              >
                {evt.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
