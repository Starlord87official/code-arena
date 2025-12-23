import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, Calendar, Clock, Users, Zap, ChevronRight, 
  Timer, Star, Filter, Play, Swords, ShieldAlert, ChevronsUp,
  TrendingDown, AlertTriangle, Crown, Target, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockContests, Contest } from '@/lib/mockData';
import { mockBattle } from '@/lib/battleData';
import { format, formatDistanceToNow, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

const statusFilters = ['all', 'upcoming', 'live', 'ended'] as const;

// Risk levels for contests
type RiskLevel = 'extreme' | 'high' | 'medium' | 'low';

interface EnhancedContest extends Contest {
  riskLevel: RiskLevel;
  rankGain: number;
  rankLoss: number;
  isMandatory?: boolean;
  threatLevel?: string;
}

const getRiskData = (contest: Contest, index: number): EnhancedContest => {
  const risks: { riskLevel: RiskLevel; rankGain: number; rankLoss: number; isMandatory?: boolean; threatLevel?: string }[] = [
    { riskLevel: 'extreme', rankGain: 15, rankLoss: 8, isMandatory: true, threatLevel: 'SURVIVAL MATCH' },
    { riskLevel: 'high', rankGain: 10, rankLoss: 5, threatLevel: 'ELIMINATION ROUND' },
    { riskLevel: 'medium', rankGain: 5, rankLoss: 2, threatLevel: 'RANKED BATTLE' },
    { riskLevel: 'low', rankGain: 3, rankLoss: 0, threatLevel: 'PRACTICE ARENA' },
  ];
  return { ...contest, ...risks[index % risks.length] };
};

// Live countdown component
function CountdownTimer({ targetDate, isLive }: { targetDate: Date; isLive?: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const isUrgent = timeLeft.hours < 1 && !isLive;

  return (
    <div className={`flex items-center gap-1 font-mono ${isUrgent ? 'text-destructive animate-pulse' : isLive ? 'text-status-success' : 'text-primary'}`}>
      <span className="bg-background/50 px-2 py-1 rounded text-lg font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
      <span className="text-muted-foreground">:</span>
      <span className="bg-background/50 px-2 py-1 rounded text-lg font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
      <span className="text-muted-foreground">:</span>
      <span className="bg-background/50 px-2 py-1 rounded text-lg font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
    </div>
  );
}

export default function Contests() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Add some variety to contest status with risk levels
  const contestsWithStatus: EnhancedContest[] = [
    getRiskData({ ...mockContests[0], status: 'live', startTime: new Date(Date.now() - 30 * 60 * 1000), endTime: new Date(Date.now() + 90 * 60 * 1000) }, 0),
    ...mockContests.map((c, i) => getRiskData(c, i + 1)),
    getRiskData({ 
      id: 'ct-ended-1',
      title: 'Weekly Arena #46',
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      problems: ['ch-001', 'ch-002'],
      participants: 847,
      status: 'ended',
      xpReward: 500,
    }, 3),
  ];

  const filteredContests = selectedStatus === 'all' 
    ? contestsWithStatus 
    : contestsWithStatus.filter(c => c.status === selectedStatus);

  const getRiskBadgeStyle = (risk: RiskLevel) => {
    switch (risk) {
      case 'extreme': return 'bg-destructive/20 text-destructive border-destructive/50 animate-pulse';
      case 'high': return 'bg-status-warning/20 text-status-warning border-status-warning/50';
      case 'medium': return 'bg-primary/20 text-primary border-primary/50';
      case 'low': return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusBadge = (status: Contest['status']) => {
    switch (status) {
      case 'live': return 'bg-status-success/20 text-status-success border-status-success/30';
      case 'upcoming': return 'bg-primary/20 text-primary border-primary/30';
      case 'ended': return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCardStyle = (contest: EnhancedContest) => {
    if (contest.status === 'live') {
      return 'border-status-success/50 bg-gradient-to-r from-status-success/10 via-transparent to-transparent';
    }
    if (contest.riskLevel === 'extreme') {
      return 'border-destructive/30 bg-gradient-to-r from-destructive/5 via-transparent to-transparent at-risk-pulse';
    }
    if (contest.riskLevel === 'high') {
      return 'border-status-warning/30 bg-gradient-to-r from-status-warning/5 via-transparent to-transparent';
    }
    return '';
  };

  const liveContest = contestsWithStatus.find(c => c.status === 'live');
  const upcomingUrgent = contestsWithStatus.filter(c => c.status === 'upcoming' && differenceInHours(c.startTime, new Date()) < 24);
  const isClanBattleLive = mockBattle.status === 'live';

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Intense Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <ChevronsUp className="h-6 w-6 text-primary animate-pulse" />
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>
            <Swords className="h-10 w-10 text-primary drop-shadow-[0_0_15px_hsl(var(--primary))]" />
            <h1 className="font-display text-4xl font-bold text-foreground">
              SURVIVAL <span className="text-primary neon-text">ARENA</span>
            </h1>
            <Swords className="h-10 w-10 text-primary drop-shadow-[0_0_15px_hsl(var(--primary))]" />
            <div className="flex items-center gap-1">
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <ChevronsUp className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Every contest is a <span className="text-destructive font-bold">test of survival</span>. Miss one, and you <span className="text-status-warning font-semibold">fall behind</span>.
          </p>
        </div>

        {/* Threat Warning Banner */}
        {upcomingUrgent.length > 0 && (
          <div className="arena-card p-4 mb-6 border-status-warning/50 bg-gradient-to-r from-status-warning/10 to-transparent">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-status-warning animate-pulse" />
              <span className="text-status-warning font-semibold">
                {upcomingUrgent.length} contest{upcomingUrgent.length > 1 ? 's' : ''} starting within 24 hours
              </span>
              <span className="text-muted-foreground text-sm">— Missing these will cost you ranks</span>
            </div>
          </div>
        )}

        {/* Clan vs Clan Battle Card */}
        {isClanBattleLive && (
          <Link to="/battle/clan-vs-clan">
            <div className="arena-card p-6 mb-8 border-neon-purple/50 bg-gradient-to-r from-neon-purple/15 via-primary/5 to-neon-purple/15 hover:border-neon-purple transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 via-transparent to-neon-purple/5 animate-pulse"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-neon-purple/20 rounded-lg relative">
                    <Swords className="h-8 w-8 text-neon-purple" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-purple rounded-full animate-ping"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-neon-purple text-background border-0 font-bold">
                        ⚔️ CLAN BATTLE LIVE
                      </Badge>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground group-hover:text-neon-purple transition-colors mb-2">
                      {mockBattle.clanA.name} vs {mockBattle.clanB.name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Score:</span>
                        <span className="font-bold text-primary">{mockBattle.clanA.battleScore}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="font-bold text-accent">{mockBattle.clanB.battleScore}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{mockBattle.clanA.memberCount + mockBattle.clanB.memberCount} warriors</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="arena" className="bg-neon-purple hover:bg-neon-purple/80 font-bold">
                  SPECTATE BATTLE
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </Link>
        )}

        {/* Live Contest Banner - High Intensity */}
        {liveContest && (
          <Link to={`/contest/${liveContest.id}/live`}>
            <div className="arena-card p-6 mb-8 border-status-success/50 bg-gradient-to-r from-status-success/15 via-status-success/5 to-transparent hover:border-status-success transition-all group relative overflow-hidden">
              {/* Animated background pulse */}
              <div className="absolute inset-0 bg-gradient-to-r from-status-success/10 to-transparent animate-pulse"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-status-success/20 rounded-lg relative">
                    <Play className="h-8 w-8 text-status-success" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-status-success rounded-full animate-ping"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-status-success text-background border-0 font-bold">
                        ⚡ LIVE NOW
                      </Badge>
                      <Badge className={getRiskBadgeStyle(liveContest.riskLevel)}>
                        {liveContest.threatLevel}
                      </Badge>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground group-hover:text-status-success transition-colors mb-2">
                      {liveContest.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Time remaining:</span>
                        <CountdownTimer targetDate={liveContest.endTime} isLive />
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{liveContest.participants} competing</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-status-success">
                        <ChevronsUp className="h-4 w-4" />
                        <span className="font-bold">+{liveContest.rankGain}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">RANK GAIN</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-destructive">
                        <TrendingDown className="h-4 w-4" />
                        <span className="font-bold">-{liveContest.rankLoss}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">IF MISSED</span>
                    </div>
                  </div>
                  <Button variant="arena" className="bg-status-success hover:bg-status-success/80 font-bold">
                    ENTER BATTLE
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Stakes Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="arena-card p-4 text-center border-destructive/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <div className="text-2xl font-bold text-destructive">
              {contestsWithStatus.filter(c => c.riskLevel === 'extreme' && c.status !== 'ended').length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Survival Matches</div>
            <div className="text-[10px] text-destructive mt-1">High elimination risk</div>
          </div>
          <div className="arena-card p-4 text-center border-status-success/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-status-success" />
            </div>
            <div className="text-2xl font-bold text-status-success">
              {contestsWithStatus.filter(c => c.status === 'live').length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Live Now</div>
            <div className="text-[10px] text-status-success mt-1">Battle in progress</div>
          </div>
          <div className="arena-card p-4 text-center border-status-warning/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="h-5 w-5 text-status-warning" />
            </div>
            <div className="text-2xl font-bold text-status-warning">
              {upcomingUrgent.length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Starting Soon</div>
            <div className="text-[10px] text-status-warning mt-1">Within 24 hours</div>
          </div>
          <div className="arena-card p-4 text-center border-primary/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">+47</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Your Rank Gain</div>
            <div className="text-[10px] text-primary mt-1">This season</div>
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

        {/* Risk Legend */}
        <div className="flex flex-wrap gap-4 justify-center mb-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive"></div>
            <span className="text-muted-foreground">Extreme Risk (Mandatory)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-status-warning"></div>
            <span className="text-muted-foreground">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span className="text-muted-foreground">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted-foreground"></div>
            <span className="text-muted-foreground">Practice (No Loss)</span>
          </div>
        </div>

        {/* Contest List */}
        <div className="space-y-4">
          {filteredContests.map((contest) => (
            <Link
              key={contest.id}
              to={contest.status === 'live' ? `/contest/${contest.id}/live` : `/contest/${contest.id}`}
              className="block"
            >
              <div className={`arena-card p-6 hover:border-primary/50 transition-all duration-300 group ${getCardStyle(contest)}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {contest.riskLevel === 'extreme' ? (
                        <ShieldAlert className="h-5 w-5 text-destructive" />
                      ) : contest.status === 'live' ? (
                        <Play className="h-5 w-5 text-status-success" />
                      ) : (
                        <Trophy className="h-5 w-5 text-primary" />
                      )}
                      <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {contest.title}
                      </h3>
                      <Badge className={`${getStatusBadge(contest.status)} border uppercase text-xs ${contest.status === 'live' ? 'animate-pulse' : ''}`}>
                        {contest.status === 'live' ? '⚡ LIVE' : contest.status}
                      </Badge>
                      <Badge className={`${getRiskBadgeStyle(contest.riskLevel)} border uppercase text-[10px]`}>
                        {contest.threatLevel}
                      </Badge>
                      {contest.isMandatory && (
                        <Badge className="bg-destructive/20 text-destructive border-destructive/50 text-[10px]">
                          MANDATORY
                        </Badge>
                      )}
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
                      {contest.status === 'upcoming' && (
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4" />
                          <span className={differenceInHours(contest.startTime, new Date()) < 6 ? 'text-destructive font-semibold' : ''}>
                            Starts {formatDistanceToNow(contest.startTime, { addSuffix: true })}
                          </span>
                        </div>
                      )}
                      {contest.status === 'live' && (
                        <CountdownTimer targetDate={contest.endTime} isLive />
                      )}
                    </div>

                    {/* Pressure Warning */}
                    {contest.status === 'upcoming' && contest.riskLevel === 'extreme' && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Missing this match results in automatic rank demotion</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Risk/Reward Display */}
                    <div className="text-center border-r border-border pr-4">
                      <div className="flex items-center gap-1 text-status-success">
                        <ChevronsUp className="h-4 w-4" />
                        <span className="font-bold text-lg">+{contest.rankGain}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase">Win</span>
                    </div>
                    <div className="text-center border-r border-border pr-4">
                      <div className="flex items-center gap-1 text-destructive">
                        <TrendingDown className="h-4 w-4" />
                        <span className="font-bold text-lg">-{contest.rankLoss}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase">Miss</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-foreground">
                        <Star className="h-4 w-4" />
                        <span className="font-bold">{contest.problems.length}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">Problems</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{contest.participants}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">Warriors</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-primary">
                        <Zap className="h-4 w-4" />
                        <span className="font-bold">{contest.xpReward}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">XP</span>
                    </div>
                    <Button 
                      variant={contest.status === 'live' ? 'arena' : 'outline'} 
                      size="sm"
                      className={contest.status === 'live' ? 'bg-status-success hover:bg-status-success/80' : 'group-hover:bg-primary group-hover:text-primary-foreground'}
                    >
                      {contest.status === 'live' ? 'ENTER' : contest.status === 'upcoming' ? 'PREPARE' : 'VIEW'}
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredContests.length === 0 && (
          <div className="arena-card p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No battles found</h3>
            <p className="text-muted-foreground">The arena is quiet... for now.</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-10 arena-card p-6 text-center border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <Target className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            The Strong <span className="text-primary">Survive</span>. The Weak <span className="text-destructive">Fall</span>.
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Every contest you skip is ground you lose. Every battle you win is a step toward the top.
          </p>
          <Button variant="arena" size="lg">
            View Your Battle Schedule
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
