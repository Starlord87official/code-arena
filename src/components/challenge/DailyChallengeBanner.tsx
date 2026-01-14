import { Link } from 'react-router-dom';
import { Flame, Clock, Zap, Trophy, ChevronRight, Check, Sparkles, Shield, AlertTriangle, Crown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DailyChallengeInfo } from '@/hooks/useDailyChallenge';
import { getRiskLevel, getRiskLabel, getRiskColor } from '@/hooks/useChallenges';

interface DailyChallengeBannerProps {
  dailyChallenge: DailyChallengeInfo;
  streak: number;
}

function getRiskIcon(risk: 'safe' | 'moderate' | 'high' | 'legendary') {
  switch (risk) {
    case 'safe': return <Shield className="h-3.5 w-3.5" />;
    case 'moderate': return <AlertTriangle className="h-3.5 w-3.5" />;
    case 'high': return <Flame className="h-3.5 w-3.5" />;
    case 'legendary': return <Crown className="h-3.5 w-3.5" />;
  }
}

export function DailyChallengeBanner({ dailyChallenge, streak }: DailyChallengeBannerProps) {
  const { 
    challenge, 
    timeRemaining, 
    hoursRemaining, 
    isCompleted, 
    isExpired,
    solvedBy,
    attemptCount,
    successRate 
  } = dailyChallenge;

  if (!challenge) return null;

  const riskLevel = getRiskLevel(challenge.rank_impact_loss);
  const riskLabel = getRiskLabel(riskLevel);
  const riskColorClass = getRiskColor(riskLevel);
  const urgencyLevel = hoursRemaining <= 2 ? 'critical' : hoursRemaining <= 6 ? 'warning' : 'normal';

  return (
    <div className={`relative overflow-hidden rounded-xl border mb-6 ${
      isCompleted 
        ? 'bg-status-success/5 border-status-success/30' 
        : isExpired
          ? 'bg-muted/50 border-border'
          : 'bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-primary/30'
    }`}>
      {/* Animated background glow for active daily */}
      {!isCompleted && !isExpired && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-pulse" />
      )}
      
      <div className="relative p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-5">
          {/* Left: Badge & Info */}
          <div className="flex-1">
            {/* Top Badges Row */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {/* Daily Challenge Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-heading font-bold text-sm uppercase ${
                isCompleted 
                  ? 'bg-status-success/20 text-status-success' 
                  : 'bg-primary/20 text-primary'
              }`}>
                <Flame className={`h-4 w-4 ${!isCompleted && !isExpired ? 'animate-pulse' : ''}`} />
                Daily Challenge
              </div>
              
              {/* Timer Badge */}
              {!isCompleted && !isExpired && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  urgencyLevel === 'critical' 
                    ? 'bg-destructive/20 text-destructive animate-pulse' 
                    : urgencyLevel === 'warning'
                      ? 'bg-status-warning/20 text-status-warning'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  <Clock className="h-4 w-4" />
                  Expires in {timeRemaining}
                </div>
              )}

              {isCompleted && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-status-success/20 text-status-success">
                  <Check className="h-4 w-4" />
                  Completed!
                </div>
              )}

              {isExpired && !isCompleted && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-muted text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Expired
                </div>
              )}
            </div>

            {/* Challenge Title & Description */}
            <Link to={`/solve/${challenge.slug}`} className="group block mb-4">
              <h3 className="font-heading font-bold text-2xl mb-2 group-hover:text-primary transition-colors">
                {challenge.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {challenge.description}
              </p>
            </Link>

            {/* Metadata Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Difficulty Badge */}
              <Badge variant="outline" className={`text-xs font-semibold uppercase ${
                challenge.difficulty === 'easy' ? 'border-status-success/50 text-status-success bg-status-success/10' :
                challenge.difficulty === 'medium' ? 'border-status-warning/50 text-status-warning bg-status-warning/10' :
                challenge.difficulty === 'hard' ? 'border-destructive/50 text-destructive bg-destructive/10' :
                'border-rank-legend/50 text-rank-legend bg-rank-legend/10'
              }`}>
                {challenge.difficulty}
              </Badge>
              
              {/* Risk Badge */}
              <Badge variant="outline" className={`text-xs font-semibold uppercase flex items-center gap-1 ${riskColorClass.replace('bg-', 'border-').replace('/10', '/50')}`}>
                {getRiskIcon(riskLevel)}
                {riskLabel}
              </Badge>
              
              {/* Time Limit Badge */}
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {challenge.time_limit} min
              </Badge>
              
              {/* Topic Tags */}
              {challenge.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Global Stats Row */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" />
                {solvedBy === 0 ? (
                  <span className="text-muted-foreground/70">No solves yet</span>
                ) : (
                  <span>{solvedBy.toLocaleString()} solved</span>
                )}
              </div>
              
              {/* Success Rate */}
              <div className="flex items-center gap-2">
                {successRate !== null && attemptCount > 0 ? (
                  <>
                    <span className="text-muted-foreground">{successRate}% success</span>
                    <Progress value={successRate} className="w-16 h-1.5" />
                  </>
                ) : (
                  <span className="text-muted-foreground/60 text-xs">No data yet</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Stats & CTA */}
          <div className="flex flex-col items-start lg:items-end gap-4 lg:min-w-[200px]">
            {/* Rewards Row */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-bold text-primary text-lg">+{challenge.xp_reward}</span>
                  <span className="text-muted-foreground text-xs ml-1">XP</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-status-warning/10">
                  <Trophy className="h-4 w-4 text-status-warning" />
                </div>
                <div>
                  <span className="font-bold text-status-warning text-lg">+{challenge.rank_impact_win}</span>
                  <span className="text-muted-foreground text-xs ml-1">Rank</span>
                </div>
              </div>
            </div>

            {/* Streak Display */}
            {streak > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold text-primary">{streak} Day Streak</span>
              </div>
            )}

            {/* CTA Button */}
            <Link to={`/solve/${challenge.slug}`} className="w-full lg:w-auto">
              <Button 
                variant={isCompleted ? 'outline' : 'arena'} 
                size="lg"
                className="w-full lg:min-w-[180px] font-heading"
                disabled={isExpired && !isCompleted}
              >
                {isCompleted ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    View Solution
                  </>
                ) : isExpired ? (
                  'Expired'
                ) : (
                  <>
                    Accept Challenge
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress bar for urgency (only when < 6 hours remaining) */}
        {!isCompleted && !isExpired && hoursRemaining <= 6 && (
          <div className="mt-5 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Time remaining</span>
              <span className={urgencyLevel === 'critical' ? 'text-destructive font-semibold' : ''}>
                {timeRemaining}
              </span>
            </div>
            <Progress 
              value={(hoursRemaining / 24) * 100} 
              className={`h-2 ${urgencyLevel === 'critical' ? '[&>div]:bg-destructive' : ''}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
