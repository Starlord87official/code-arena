import { Lock, Unlock, CheckCircle2, Zap, Crown, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BattleProblem, BattleFeedMessage, getDifficultyColor } from '@/lib/battleData';
import { useEffect, useState } from 'react';

interface BattleArenaProps {
  problems: BattleProblem[];
  feedMessages: BattleFeedMessage[];
}

export function BattleArena({ problems, feedMessages }: BattleArenaProps) {
  const [visibleMessages, setVisibleMessages] = useState<BattleFeedMessage[]>([]);

  useEffect(() => {
    // Show only recent messages (last 15 seconds simulation)
    const recent = feedMessages.filter(
      msg => Date.now() - msg.timestamp.getTime() < 60000 // Show last minute for demo
    );
    setVisibleMessages(recent.slice(0, 5));
  }, [feedMessages]);

  const getStatusIcon = (status: BattleProblem['status']) => {
    switch (status) {
      case 'locked':
        return <Lock className="w-5 h-5 text-muted-foreground" />;
      case 'unlocked':
        return <Unlock className="w-5 h-5 text-primary animate-pulse" />;
      case 'solved-a':
        return <CheckCircle2 className="w-5 h-5 text-primary" />;
      case 'solved-b':
        return <CheckCircle2 className="w-5 h-5 text-accent" />;
      case 'solved-both':
        return <CheckCircle2 className="w-5 h-5 text-status-success" />;
    }
  };

  const getFeedMessageStyle = (type: BattleFeedMessage['type']) => {
    switch (type) {
      case 'lead-change':
        return 'bg-status-warning/20 border-status-warning/30 text-status-warning';
      case 'solve':
        return 'bg-status-success/20 border-status-success/30 text-status-success';
      case 'streak':
        return 'bg-primary/20 border-primary/30 text-primary';
      case 'clutch':
        return 'bg-neon-purple/20 border-neon-purple/30 text-neon-purple';
      case 'warning':
        return 'bg-destructive/20 border-destructive/30 text-destructive';
      case 'milestone':
        return 'bg-accent/20 border-accent/30 text-accent';
    }
  };

  const getFeedIcon = (type: BattleFeedMessage['type']) => {
    switch (type) {
      case 'lead-change':
        return <Crown className="w-4 h-4" />;
      case 'solve':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'streak':
        return <Zap className="w-4 h-4" />;
      case 'clutch':
        return <Target className="w-4 h-4" />;
      case 'warning':
        return <Lock className="w-4 h-4" />;
      case 'milestone':
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Battle Problems */}
      <Card className="arena-card bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Battle Problems
            </CardTitle>
            <Badge variant="outline" className="border-primary/30 text-primary">
              {problems.filter(p => p.status !== 'locked').length}/{problems.length} Active
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {problems.map((problem, index) => (
            <div 
              key={problem.id}
              className={`relative p-4 rounded-lg border transition-all ${
                problem.status === 'locked' 
                  ? 'bg-secondary/30 border-border opacity-60' 
                  : problem.status === 'unlocked'
                    ? 'bg-card border-primary/50 neon-border'
                    : 'bg-secondary/50 border-border'
              }`}
            >
              {/* First Blood Badge */}
              {problem.firstBlood && (
                <div className={`absolute -top-2 right-4 px-2 py-0.5 rounded text-xs font-bold ${
                  problem.firstBlood === 'A' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-accent text-accent-foreground'
                }`}>
                  FIRST BLOOD
                </div>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(problem.status)}
                  <div>
                    <h4 className="font-semibold text-foreground">{problem.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                        {problem.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        +{problem.xpReward} XP
                      </span>
                    </div>
                  </div>
                </div>
                
                {problem.status !== 'locked' && (
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Solve Progress</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-primary">{problem.solveProgressA}%</span>
                      <span className="text-xs text-muted-foreground">vs</span>
                      <span className="text-xs font-mono text-accent">{problem.solveProgressB}%</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Progress Bars */}
              {problem.status !== 'locked' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Progress 
                      value={problem.solveProgressA} 
                      className="h-2 bg-secondary"
                    />
                  </div>
                  <div>
                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="absolute right-0 top-0 h-full bg-accent rounded-full transition-all"
                        style={{ width: `${problem.solveProgressB}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Live System Messages */}
      <Card className="arena-card bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-status-warning animate-pulse" />
            Live Battle Feed
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {visibleMessages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-4">
                Waiting for action...
              </p>
            ) : (
              visibleMessages.map((msg, index) => (
                <div 
                  key={msg.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-all ${
                    getFeedMessageStyle(msg.type)
                  } ${index === 0 ? 'animate-fade-in' : ''}`}
                  style={{ 
                    opacity: 1 - (index * 0.15),
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {getFeedIcon(msg.type)}
                  <span className="flex-1 font-medium">{msg.message}</span>
                  <span className="text-xs opacity-70">
                    {Math.round((Date.now() - msg.timestamp.getTime()) / 60000)}m ago
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
