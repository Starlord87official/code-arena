import { Link } from 'react-router-dom';
import { Contest } from '@/lib/mockData';
import { Calendar, Clock, Trophy, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, formatDistanceToNow } from 'date-fns';

interface ContestCardProps {
  contest: Contest;
}

export function ContestCard({ contest }: ContestCardProps) {
  const getStatusStyles = () => {
    switch (contest.status) {
      case 'live':
        return 'border-status-success text-status-success bg-status-success/10';
      case 'upcoming':
        return 'border-primary text-primary bg-primary/10';
      case 'ended':
        return 'border-muted-foreground text-muted-foreground bg-muted/10';
    }
  };

  return (
    <div className="arena-card p-6 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-heading uppercase font-semibold border ${getStatusStyles()}`}>
            {contest.status === 'live' && <span className="h-2 w-2 rounded-full bg-current animate-pulse" />}
            {contest.status}
          </span>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <Zap className="h-4 w-4" />
          <span className="font-display font-bold">+{contest.xpReward}</span>
        </div>
      </div>

      <h3 className="font-display font-bold text-xl mb-4">{contest.title}</h3>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(contest.startTime, 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {contest.status === 'upcoming'
              ? `Starts ${formatDistanceToNow(contest.startTime, { addSuffix: true })}`
              : format(contest.startTime, 'h:mm a')}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Trophy className="h-4 w-4" />
          <span>{contest.problems.length} problems</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{contest.participants} registered</span>
        </div>
      </div>

      {contest.status === 'upcoming' && (
        <Button variant="arena" className="w-full">
          Register
        </Button>
      )}
      {contest.status === 'live' && (
        <Link to={`/contest/${contest.id}/live`}>
          <Button variant="arena" className="w-full">
            Enter Arena
          </Button>
        </Link>
      )}
      {contest.status === 'ended' && (
        <Button variant="outline" className="w-full">
          View Results
        </Button>
      )}
    </div>
  );
}
