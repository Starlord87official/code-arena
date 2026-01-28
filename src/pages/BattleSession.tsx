import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Swords, Clock, Trophy, Shield, Crown, Flame, 
  Target, CheckCircle2, X, Loader2, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMatchmaking, BattleSession } from '@/hooks/useMatchmaking';
import { toast } from 'sonner';

export default function BattleSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { completeBattle } = useMatchmaking();
  
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  // Fetch battle session
  const { data: session, isLoading, error } = useQuery({
    queryKey: ['battle-session', sessionId],
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
    refetchInterval: 5000, // Poll for updates
  });

  // Fetch opponent profile
  const opponentId = session?.player_a_id === user?.id 
    ? session?.player_b_id 
    : session?.player_a_id;

  const { data: opponentProfile } = useQuery({
    queryKey: ['profile', opponentId],
    queryFn: async () => {
      if (!opponentId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, division, xp')
        .eq('id', opponentId)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!opponentId,
  });

  // Calculate time remaining
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const startTime = new Date(session.start_time).getTime();
    const durationMs = session.duration_minutes * 60 * 1000;
    const endTime = startTime + durationMs;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0 && session.status === 'active') {
        // Time's up - end the battle
        handleEndBattle();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // Handle score increment (simulate solving problems)
  const handleScorePoint = useCallback(() => {
    setMyScore(prev => prev + 1);
    toast.success('+1 Point!');
  }, []);

  // Handle end battle
  const handleEndBattle = useCallback(async () => {
    if (!session || !user || isCompleting) return;
    
    setIsCompleting(true);
    
    const isPlayerA = session.player_a_id === user.id;
    const playerAScore = isPlayerA ? myScore : opponentScore;
    const playerBScore = isPlayerA ? opponentScore : myScore;

    try {
      const { data, error } = await supabase.rpc('complete_duo_battle', {
        p_session_id: session.id,
        p_player_a_score: playerAScore,
        p_player_b_score: playerBScore,
      });

      if (error) throw error;

      const result = data as unknown as {
        success: boolean;
        winner_id?: string;
        is_draw: boolean;
        elo_change: number;
        xp_awarded: number;
        error?: string;
      };

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['user-battle-stats'] });
        queryClient.invalidateQueries({ queryKey: ['recent-duo-battles'] });
        
        if (result.is_draw) {
          toast.info(`Battle ended in a draw! +${result.xp_awarded} XP`);
        } else if (result.winner_id === user.id) {
          toast.success(`Victory! +${result.xp_awarded} XP${result.elo_change > 0 ? `, +${result.elo_change} ELO` : ''}`);
        } else {
          toast.error(`Defeat. +${result.xp_awarded} XP${result.elo_change > 0 ? `, -${result.elo_change} ELO` : ''}`);
        }
        
        // Redirect back to battle lobby
        setTimeout(() => navigate('/battle'), 2000);
      } else {
        toast.error(result.error || 'Failed to complete battle');
      }
    } catch (err) {
      console.error('Error completing battle:', err);
      toast.error('Failed to complete battle');
    } finally {
      setIsCompleting(false);
    }
  }, [session, user, myScore, opponentScore, isCompleting, queryClient, navigate]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading battle...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <X className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Battle Not Found</h2>
          <p className="text-muted-foreground mb-4">This battle session doesn't exist or has ended.</p>
          <Button variant="arena" onClick={() => navigate('/battle')}>
            Return to Battle Lobby
          </Button>
        </div>
      </div>
    );
  }

  if (session.status === 'completed') {
    const isWinner = session.winner_id === user?.id;
    const isDraw = !session.winner_id;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="arena-card max-w-md w-full mx-4">
          <CardHeader className="text-center">
            {isDraw ? (
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            ) : isWinner ? (
              <Crown className="h-16 w-16 text-status-warning mx-auto mb-4" />
            ) : (
              <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
            )}
            <CardTitle className="font-display text-2xl">
              {isDraw ? 'Draw!' : isWinner ? 'Victory!' : 'Defeat'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Your Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {session.player_a_id === user?.id ? session.player_a_score : session.player_b_score}
                </p>
              </div>
              <span className="text-muted-foreground">vs</span>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Opponent</p>
                <p className="text-2xl font-bold text-foreground">
                  {session.player_a_id === user?.id ? session.player_b_score : session.player_a_score}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">XP Earned</span>
              <span className="font-bold text-status-success">
                +{session.player_a_id === user?.id ? session.xp_awarded_a : session.xp_awarded_b} XP
              </span>
            </div>

            {session.mode === 'ranked' && session.elo_change > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ELO Change</span>
                <span className={`font-bold ${isWinner ? 'text-status-success' : 'text-destructive'}`}>
                  {isWinner ? '+' : '-'}{session.elo_change}
                </span>
              </div>
            )}

            <Button variant="arena" className="w-full" onClick={() => navigate('/battle')}>
              Return to Battle Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Battle Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Swords className="h-8 w-8 text-destructive" />
            <h1 className="font-display text-3xl font-bold text-foreground">
              BATTLE <span className="text-destructive">IN PROGRESS</span>
            </h1>
            <Swords className="h-8 w-8 text-destructive transform scale-x-[-1]" />
          </div>
          
          {/* Timer */}
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg ${
            timeRemaining < 60 ? 'bg-destructive/20 border border-destructive/50' : 'bg-muted border border-border'
          }`}>
            <Clock className={`h-5 w-5 ${timeRemaining < 60 ? 'text-destructive' : 'text-primary'}`} />
            <span className={`font-mono text-2xl font-bold ${
              timeRemaining < 60 ? 'text-destructive' : 'text-foreground'
            }`}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          <Badge className="ml-4" variant="outline">
            {session.mode.toUpperCase()} MATCH
          </Badge>
        </div>

        {/* Score Display */}
        <Card className="arena-card mb-8">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              {/* You */}
              <div className="flex-1 text-center">
                <Avatar className="h-16 w-16 mx-auto mb-3 border-2 border-primary">
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                    {user?.email?.charAt(0).toUpperCase() || 'Y'}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-foreground mb-1">You</p>
                <p className="text-5xl font-bold text-primary">{myScore}</p>
              </div>

              {/* VS */}
              <div className="px-8">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="font-display text-xl font-bold text-muted-foreground">VS</span>
                </div>
              </div>

              {/* Opponent */}
              <div className="flex-1 text-center">
                <Avatar className="h-16 w-16 mx-auto mb-3 border-2 border-accent">
                  <AvatarFallback className="bg-accent/20 text-accent font-bold text-xl">
                    {opponentProfile?.username?.charAt(0).toUpperCase() || 'O'}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-foreground mb-1">
                  {opponentProfile?.username || 'Opponent'}
                </p>
                <p className="text-5xl font-bold text-accent">{opponentScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Battle Actions */}
        <Card className="arena-card mb-8">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Battle Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              In a full implementation, problems would be displayed here. For now, you can simulate scoring points.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="arena" 
                size="lg" 
                className="w-full"
                onClick={handleScorePoint}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Score Point (+1)
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => setOpponentScore(prev => prev + 1)}
              >
                <User className="h-5 w-5 mr-2" />
                Opponent Scores
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* End Battle */}
        <div className="flex gap-4">
          <Button 
            variant="destructive" 
            size="lg" 
            className="flex-1"
            onClick={handleEndBattle}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <X className="h-5 w-5 mr-2" />
            )}
            End Battle
          </Button>
        </div>
      </div>
    </div>
  );
}
