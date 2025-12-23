import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, Calendar, Clock, Users, Zap, ChevronRight, 
  Timer, Star, Filter, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockContests, Contest } from '@/lib/mockData';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';

const statusFilters = ['all', 'upcoming', 'live', 'ended'] as const;

export default function Contests() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Add some variety to contest status
  const contestsWithStatus: Contest[] = [
    { ...mockContests[0], status: 'live', startTime: new Date(Date.now() - 30 * 60 * 1000) },
    ...mockContests,
    { 
      id: 'ct-ended-1',
      title: 'Weekly Arena #46',
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      problems: ['ch-001', 'ch-002'],
      participants: 847,
      status: 'ended',
      xpReward: 500,
    },
  ];

  const filteredContests = selectedStatus === 'all' 
    ? contestsWithStatus 
    : contestsWithStatus.filter(c => c.status === selectedStatus);

  const getStatusBadge = (status: Contest['status']) => {
    switch (status) {
      case 'live': return 'bg-status-success/20 text-status-success border-status-success/30 animate-pulse';
      case 'upcoming': return 'bg-primary/20 text-primary border-primary/30';
      case 'ended': return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTimeDisplay = (contest: Contest) => {
    if (contest.status === 'live') {
      const hoursLeft = differenceInHours(contest.endTime, new Date());
      return `${hoursLeft}h remaining`;
    } else if (contest.status === 'upcoming') {
      return formatDistanceToNow(contest.startTime, { addSuffix: true });
    } else {
      return format(contest.startTime, 'MMM d, yyyy');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy className="h-10 w-10 text-primary neon-text" />
            <h1 className="font-display text-4xl font-bold text-foreground">
              CONTEST <span className="text-primary">ARENA</span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            Compete. Dominate. Claim your glory.
          </p>
        </div>

        {/* Live Contest Banner */}
        {contestsWithStatus.some(c => c.status === 'live') && (
          <Link to={`/contest/${contestsWithStatus.find(c => c.status === 'live')?.id}/live`}>
            <div className="arena-card p-6 mb-8 border-status-success/50 bg-gradient-to-r from-status-success/10 to-transparent hover:border-status-success transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-status-success/20 rounded-lg">
                    <Play className="h-6 w-6 text-status-success" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-status-success/20 text-status-success border-status-success/30 animate-pulse">
                        LIVE NOW
                      </Badge>
                      <span className="text-sm text-muted-foreground">1h 30m remaining</span>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground group-hover:text-status-success transition-colors">
                      {contestsWithStatus.find(c => c.status === 'live')?.title}
                    </h2>
                  </div>
                </div>
                <Button variant="arena" className="bg-status-success hover:bg-status-success/80">
                  Enter Arena
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </Link>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="arena-card p-4 text-center">
            <div className="text-2xl font-bold text-primary">{contestsWithStatus.length}</div>
            <div className="text-sm text-muted-foreground">Total Contests</div>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="text-2xl font-bold text-status-success">
              {contestsWithStatus.filter(c => c.status === 'live').length}
            </div>
            <div className="text-sm text-muted-foreground">Live Now</div>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {contestsWithStatus.filter(c => c.status === 'upcoming').length}
            </div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="text-2xl font-bold text-status-warning">12</div>
            <div className="text-sm text-muted-foreground">Your Contests</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Filter className="h-4 w-4 text-muted-foreground mt-2" />
          {statusFilters.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? 'arena' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Contest List */}
        <div className="space-y-4">
          {filteredContests.map((contest) => (
            <Link
              key={contest.id}
              to={contest.status === 'live' ? `/contest/${contest.id}/live` : `/contest/${contest.id}`}
              className="block"
            >
              <div className={`arena-card p-6 hover:border-primary/50 transition-all duration-300 group ${
                contest.status === 'live' ? 'border-status-success/30' : ''
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className={`h-5 w-5 ${
                        contest.status === 'live' ? 'text-status-success' : 'text-primary'
                      }`} />
                      <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {contest.title}
                      </h3>
                      <Badge className={`${getStatusBadge(contest.status)} border uppercase text-xs`}>
                        {contest.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(contest.startTime, 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(contest.startTime, 'h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        <span>{getTimeDisplay(contest)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-foreground">
                        <Star className="h-4 w-4" />
                        <span className="font-bold">{contest.problems.length}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Problems</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{contest.participants}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Joined</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-primary">
                        <Zap className="h-4 w-4" />
                        <span className="font-bold">{contest.xpReward}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">XP</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredContests.length === 0 && (
          <div className="arena-card p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No contests found</h3>
            <p className="text-muted-foreground">Check back later for more competitions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
