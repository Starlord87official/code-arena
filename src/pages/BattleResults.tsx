import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Crown, Shield, Loader2, AlertCircle, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BattleSession } from '@/hooks/useMatchmaking';

export default function BattleResults() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isReturning, setIsReturning] = useState(false);

  // Fetch the completed session
  const { data: session, isLoading, error } = useQuery({
    queryKey: ['battle-result', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('No session ID');
      const { data, error } = await supabase
        .from('battle_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      if (error) throw error;
      return data as BattleSession;
    },
    enabled: !!sessionId && !!user,
    // No polling — this is a static results page
    refetchInterval: false,
    staleTime: Infinity,
  });

  // Fetch opponent profile
  const opponentId = session?.player_a_id === user?.id ? session?.player_b_id : session?.player_a_id;
  const { data: opponentProfile } = useQuery({
    queryKey: ['profile', opponentId],
    queryFn: async () => {
      if (!opponentId) return null;
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, division')
        .eq('id', opponentId)
        .single();
      return data;
    },
    enabled: !!opponentId,
  });

  // GUARD: If session is NOT completed (still active or doesn't exist), redirect away
  useEffect(() => {
    if (!isLoading && session && session.status !== 'completed') {
      // Active session — send back to the live battle page
      navigate(`/battle/session/${sessionId}`, { replace: true });
    }
  }, [session, isLoading, sessionId, navigate]);

  const handleReturnToLobby = () => {
    if (isReturning) return;
    setIsReturning(true);

    // 1. Clear all battle-related caches
    queryClient.removeQueries({ queryKey: ['battle-session', sessionId] });
    queryClient.removeQueries({ queryKey: ['battle-result', sessionId] });
    queryClient.removeQueries({ queryKey: ['battle-problems', sessionId] });
    queryClient.removeQueries({ queryKey: ['active-battle-session'] });
    queryClient.invalidateQueries({ queryKey: ['user-battle-stats'] });

    // 2. Reset matchmaking state to idle (prevents redirect loop)
    resetState();

    // 3. Hard navigate with replace
    navigate('/battle', { replace: true });
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  // Error / Not found
  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Battle Not Found</h2>
          <p className="text-muted-foreground mb-4">This battle session doesn't exist.</p>
          <Button variant="default" onClick={() => navigate('/battle', { replace: true })}>
            Return to Battle Lobby
          </Button>
        </div>
      </div>
    );
  }

  // Not completed — guard will redirect, show loading in the meantime
  if (session.status !== 'completed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  const isWinner = session.winner_id === user?.id;
  const isDraw = !session.winner_id;
  const myScore = session.player_a_id === user?.id ? session.player_a_score : session.player_b_score;
  const oppScore = session.player_a_id === user?.id ? session.player_b_score : session.player_a_score;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <Card className="arena-card max-w-lg w-full">
        <CardHeader className="text-center pb-2">
          {isDraw ? (
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          ) : isWinner ? (
            <Crown className="h-16 w-16 text-status-warning mx-auto mb-4" />
          ) : (
            <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
          )}
          <CardTitle className="font-display text-3xl">
            {isDraw ? 'Draw!' : isWinner ? 'Victory!' : 'Defeat'}
          </CardTitle>
          {opponentProfile?.username && (
            <p className="text-sm text-muted-foreground mt-1">
              vs <span className="text-accent font-semibold">{opponentProfile.username}</span>
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score */}
          <div className="flex justify-between items-center p-5 bg-muted rounded-lg">
            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground mb-1">Your Score</p>
              <p className={`text-3xl font-bold font-display ${isWinner ? 'text-primary' : 'text-foreground'}`}>
                {myScore}
              </p>
            </div>
            <div className="px-4">
              <Badge variant="outline" className="text-lg font-display px-3 py-1">VS</Badge>
            </div>
            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground mb-1">Opponent</p>
              <p className={`text-3xl font-bold font-display ${!isWinner && !isDraw ? 'text-destructive' : 'text-foreground'}`}>
                {oppScore}
              </p>
            </div>
          </div>

          {/* ELO / XP summary */}
          {(session.elo_change || session.xp_awarded_a || session.xp_awarded_b) && (
            <div className="flex gap-3">
              {session.elo_change != null && session.elo_change !== 0 && (
                <div className={`flex-1 text-center p-3 rounded-lg ${
                  (isWinner ? session.elo_change : -session.elo_change) > 0
                    ? 'bg-status-success/10 text-status-success'
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  <p className="font-display text-xl font-bold">
                    {isWinner ? '+' : '-'}{Math.abs(session.elo_change)}
                  </p>
                  <p className="text-xs uppercase tracking-wider opacity-80">ELO</p>
                </div>
              )}
              {(() => {
                const xp = session.player_a_id === user?.id ? session.xp_awarded_a : session.xp_awarded_b;
                return xp ? (
                  <div className="flex-1 text-center p-3 rounded-lg bg-primary/10 text-primary">
                    <p className="font-display text-xl font-bold">+{xp}</p>
                    <p className="text-xs uppercase tracking-wider opacity-80">XP</p>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Mode badge */}
          <div className="flex items-center justify-center gap-2">
            <Swords className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-xs uppercase">{session.mode} match</Badge>
          </div>

          {/* Return button */}
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={handleReturnToLobby}
            disabled={isReturning}
          >
            {isReturning ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Returning…</>
            ) : (
              'Return to Battle Lobby'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
