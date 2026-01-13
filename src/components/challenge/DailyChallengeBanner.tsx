import { Link } from 'react-router-dom';
import { Flame, Clock, Zap, Trophy, ChevronRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DailyChallengeInfo } from '@/hooks/useDailyChallenge';
import { getRiskLevel, getRiskLabel } from '@/hooks/useChallenges';

interface DailyChallengeBannerProps {
  dailyChallenge: DailyChallengeInfo;
  streak: number;
}

export function DailyChallengeBanner({ dailyChallenge, streak }: DailyChallengeBannerProps) {
  const { challenge, timeRemaining, hoursRemaining, isCompleted, isExpired } = dailyChallenge;

  if (!challenge) return null;

  const riskLevel = getRiskLevel(challenge.rank_impact_loss);
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
      
      <div className="relative p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Left: Badge & Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
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
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  urgencyLevel === 'critical' 
                    ? 'bg-destructive/20 text-destructive animate-pulse' 
                    : urgencyLevel === 'warning'
                      ? 'bg-status-warning/20 text-status-warning'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  <Clock className="h-3.5 w-3.5" />
                  Expires in {timeRemaining}
                </div>
              )}

              {isCompleted && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-status-success/20 text-status-success">
                  <Check className="h-3.5 w-3.5" />
                  Completed!
                </div>
              )}

              {isExpired && !isCompleted && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Expired
                </div>
              )}
            </div>

            {/* Challenge Title & Description */}
            <Link to={`/solve/${challenge.slug}`} className="group">
              <h3 className="font-heading font-bold text-xl mb-1 group-hover:text-primary transition-colors">
                {challenge.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                {challenge.description}
              </p>
            </Link>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`text-xs ${
                challenge.difficulty === 'easy' ? 'border-status-success/50 text-status-success' :
                challenge.difficulty === 'medium' ? 'border-status-warning/50 text-status-warning' :
                challenge.difficulty === 'hard' ? 'border-destructive/50 text-destructive' :
                'border-rank-legend/50 text-rank-legend'
              }`}>
                {challenge.difficulty}
              </Badge>
              {challenge.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Right: Stats & CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4">
            {/* Rewards */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-bold text-primary">+{challenge.xp_reward}</span>
                <span className="text-muted-foreground">XP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-status-warning" />
                <span className="font-bold text-status-warning">+{challenge.rank_impact_win}</span>
                <span className="text-muted-foreground">Rank</span>
              </div>
            </div>

            {/* Streak Display */}
            {streak > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">{streak} Day Streak</span>
              </div>
            )}

            {/* CTA Button */}
            <Link to={`/solve/${challenge.slug}`}>
              <Button 
                variant={isCompleted ? 'outline' : 'arena'} 
                size="sm"
                className="min-w-[140px]"
                disabled={isExpired && !isCompleted}
              >
                {isCompleted ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    View Solution
                  </>
                ) : isExpired ? (
                  'Expired'
                ) : (
                  <>
                    Accept Challenge
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress bar for urgency (only when < 6 hours remaining) */}
        {!isCompleted && !isExpired && hoursRemaining <= 6 && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Time remaining</span>
              <span className={urgencyLevel === 'critical' ? 'text-destructive font-semibold' : ''}>
                {timeRemaining}
              </span>
            </div>
            <Progress 
              value={(hoursRemaining / 24) * 100} 
              className={`h-1.5 ${urgencyLevel === 'critical' ? '[&>div]:bg-destructive' : ''}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
