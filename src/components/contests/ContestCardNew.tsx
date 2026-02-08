import { Link } from 'react-router-dom';
import { Calendar, Clock, Trophy, Users, Zap, ChevronRight, Flag, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface ContestCardNewProps {
  contest: {
    id: string;
    title: string;
    description?: string;
    difficulty: string;
    format: string;
    mode: string;
    duration_minutes: number;
    status: string;
    start_time: string;
    end_time: string;
    xp_reward: number;
    is_championship_qualifier: boolean;
    registered_count?: number;
  };
}

export function ContestCardNew({ contest }: ContestCardNewProps) {
  const difficultyColors: Record<string, string> = {
    beginner: 'bg-status-success/20 text-status-success border-status-success/30',
    intermediate: 'bg-status-warning/20 text-status-warning border-status-warning/30',
    elite: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  const formatColors: Record<string, string> = {
    icpc: 'bg-primary/20 text-primary border-primary/30',
    ioi: 'bg-neon-purple/20 text-neon-purple border-neon-purple/30',
    mixed: 'bg-accent/20 text-accent border-accent/30',
  };

  const statusConfig: Record<string, { label: string; class: string; pulse?: boolean }> = {
    upcoming: { label: 'UPCOMING', class: 'bg-primary/20 text-primary border-primary/30' },
    live: { label: '● LIVE', class: 'bg-status-success/20 text-status-success border-status-success/30', pulse: true },
    ended: { label: 'ENDED', class: 'bg-muted text-muted-foreground border-border' },
  };

  const status = statusConfig[contest.status] || statusConfig.upcoming;
  const startDate = new Date(contest.start_time);

  return (
    <Link to={`/contests/${contest.id}`}>
      <div className={cn(
        "arena-card p-5 rounded-xl relative overflow-hidden group cursor-pointer",
        contest.status === 'live' && "border-status-success/40 shadow-[0_0_20px_hsla(142,76%,45%,0.15)]",
        contest.is_championship_qualifier && "ring-1 ring-status-warning/30"
      )}>
        {/* Qualifier badge */}
        {contest.is_championship_qualifier && (
          <div className="absolute top-0 right-0">
            <div className="bg-status-warning/20 text-status-warning text-[9px] font-display font-bold px-2 py-1 rounded-bl-lg border-l border-b border-status-warning/30">
              <Crown className="h-3 w-3 inline mr-1" />
              QUALIFIER
            </div>
          </div>
        )}

        {/* Top row: status + XP */}
        <div className="flex items-center justify-between mb-3">
          <Badge className={cn('border text-[10px] font-display uppercase', status.class, status.pulse && 'animate-pulse')}>
            {status.label}
          </Badge>
          <div className="flex items-center gap-1 text-primary">
            <Zap className="h-3.5 w-3.5" />
            <span className="font-display text-sm font-bold">+{contest.xp_reward}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-lg mb-1 group-hover:text-primary transition-colors">
          {contest.title}
        </h3>
        {contest.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{contest.description}</p>
        )}

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="outline" className={cn('text-[10px] border', difficultyColors[contest.difficulty])}>
            {contest.difficulty}
          </Badge>
          <Badge variant="outline" className={cn('text-[10px] border uppercase', formatColors[contest.format])}>
            {contest.format}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground capitalize">
            {contest.mode}
          </Badge>
        </div>

        {/* Info rows */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(startDate, 'MMM d, yyyy · h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {contest.status === 'upcoming'
                ? `Starts ${formatDistanceToNow(startDate, { addSuffix: true })}`
                : `${contest.duration_minutes} min`}
            </span>
          </div>
          {contest.registered_count !== undefined && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{contest.registered_count} registered</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button
          variant={contest.status === 'live' ? 'default' : contest.status === 'upcoming' ? 'default' : 'outline'}
          size="sm"
          className={cn(
            "w-full group/btn gap-2",
            contest.status === 'live' && "bg-status-success hover:bg-status-success/90 text-primary-foreground"
          )}
        >
          {contest.status === 'live' ? 'Enter Arena' : contest.status === 'upcoming' ? 'View Details' : 'View Results'}
          <ChevronRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </Link>
  );
}
