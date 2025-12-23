import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Trophy, Clock, Users, Zap, ChevronLeft, Play, 
  CheckCircle2, Circle, AlertCircle, TrendingUp, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockChallenges, mockLeaderboard, getDifficultyColor } from '@/lib/mockData';

const contestProblems = mockChallenges.slice(0, 4).map((c, i) => ({
  ...c,
  status: i === 0 ? 'solved' : i === 1 ? 'attempted' : 'unsolved',
  points: (i + 1) * 100,
}));

export default function ContestLive() {
  const { id } = useParams();
  const [timeLeft, setTimeLeft] = useState(5400); // 1h 30m in seconds
  const [currentTab, setCurrentTab] = useState<'problems' | 'standings'>('problems');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalPoints = contestProblems.reduce((sum, p) => sum + p.points, 0);
  const earnedPoints = contestProblems
    .filter(p => p.status === 'solved')
    .reduce((sum, p) => sum + p.points, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'solved': return <CheckCircle2 className="h-5 w-5 text-status-success" />;
      case 'attempted': return <AlertCircle className="h-5 w-5 text-status-warning" />;
      default: return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/contests" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Exit</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h1 className="font-display font-bold text-foreground">Weekly Arena #47</h1>
              <Badge className="bg-status-success/20 text-status-success border-status-success/30 animate-pulse">
                LIVE
              </Badge>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">247 competing</span>
            </div>
            <div className="flex items-center gap-2 bg-destructive/20 px-4 py-2 rounded-lg border border-destructive/30">
              <Clock className="h-5 w-5 text-destructive" />
              <span className="font-mono text-xl font-bold text-destructive">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-background">
          <div 
            className="h-full bg-gradient-to-r from-primary to-status-success transition-all duration-1000"
            style={{ width: `${((5400 - timeLeft) / 5400) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2">
              <Button
                variant={currentTab === 'problems' ? 'arena' : 'outline'}
                onClick={() => setCurrentTab('problems')}
              >
                Problems
              </Button>
              <Button
                variant={currentTab === 'standings' ? 'arena' : 'outline'}
                onClick={() => setCurrentTab('standings')}
              >
                Standings
              </Button>
            </div>

            {currentTab === 'problems' ? (
              /* Problems List */
              <div className="space-y-4">
                {contestProblems.map((problem, index) => (
                  <Link
                    key={problem.id}
                    to={`/solve/${problem.id}`}
                    className="block"
                  >
                    <div className={`arena-card p-6 hover:border-primary/50 transition-all group ${
                      problem.status === 'solved' ? 'border-status-success/30 bg-status-success/5' :
                      problem.status === 'attempted' ? 'border-status-warning/30 bg-status-warning/5' : ''
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(problem.status)}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-muted-foreground font-mono">#{index + 1}</span>
                              <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                {problem.title}
                              </h3>
                              <Badge className={`${getDifficultyColor(problem.difficulty)} border border-current/30 bg-current/10 uppercase text-xs`}>
                                {problem.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{problem.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-xl font-bold text-primary">{problem.points}</div>
                            <span className="text-xs text-muted-foreground">points</span>
                          </div>
                          <Button 
                            variant={problem.status === 'solved' ? 'outline' : 'arena'} 
                            size="sm"
                          >
                            {problem.status === 'solved' ? 'View' : 'Solve'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Standings */
              <div className="arena-card overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border text-sm font-medium text-muted-foreground">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-5">Player</div>
                  <div className="col-span-2 text-center">Solved</div>
                  <div className="col-span-2 text-center">Points</div>
                  <div className="col-span-2 text-center">Time</div>
                </div>
                <div className="divide-y divide-border">
                  {mockLeaderboard.slice(0, 10).map((player, index) => (
                    <div 
                      key={player.uid}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-primary/5 transition-colors ${
                        index < 3 ? 'bg-gradient-to-r from-primary/10 to-transparent' : ''
                      }`}
                    >
                      <div className="col-span-1">
                        <span className={`font-bold ${
                          index === 0 ? 'text-rank-gold' :
                          index === 1 ? 'text-rank-silver' :
                          index === 2 ? 'text-rank-bronze' : 'text-muted-foreground'
                        }`}>
                          #{index + 1}
                        </span>
                      </div>
                      <div className="col-span-5 flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-foreground text-sm">
                            {player.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{player.username}</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-foreground">{Math.min(4, 4 - index)}/4</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="font-bold text-primary">{1000 - index * 50}</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-muted-foreground font-mono">
                          {`${Math.floor(Math.random() * 60)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Progress */}
            <div className="arena-card p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-4">Your Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Points</span>
                    <span className="font-bold text-primary">{earnedPoints}/{totalPoints}</span>
                  </div>
                  <Progress value={(earnedPoints / totalPoints) * 100} className="h-2" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Problems Solved</span>
                  <span className="font-bold text-foreground">1/4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Rank</span>
                  <span className="font-bold text-status-warning flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    #47
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="arena-card p-6">
              <h2 className="font-display text-lg font-bold text-foreground mb-4">Contest Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-foreground">2 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Participants</span>
                  <span className="text-foreground">247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">XP Reward</span>
                  <span className="text-primary font-bold flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    500
                  </span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="arena-card p-6 border-primary/30 bg-primary/5">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Flame className="h-4 w-4 text-status-warning" />
                Pro Tip
              </h3>
              <p className="text-sm text-muted-foreground">
                Start with easier problems to build momentum. Time management is key to victory.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
