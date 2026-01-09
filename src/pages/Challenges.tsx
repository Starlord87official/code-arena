import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Zap, Trophy, Users, TrendingUp, ChevronRight, 
  Target, AlertTriangle, Clock, ChevronsUp, Flame, ShieldAlert,
  TrendingDown, Crown, Swords
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockChallenges, getDifficultyColor, Challenge } from '@/lib/mockData';
import { MarkForRevisionButton } from '@/components/revision/MarkForRevisionButton';

const difficultyOrder = { easy: 1, medium: 2, hard: 3, extreme: 4 };

export default function Challenges() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = [...new Set(mockChallenges.flatMap(c => c.tags))];

  const filteredChallenges = mockChallenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = !selectedDifficulty || challenge.difficulty === selectedDifficulty;
    const matchesTag = !selectedTag || challenge.tags.includes(selectedTag);
    return matchesSearch && matchesDifficulty && matchesTag;
  }).sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

  const getDifficultyStyle = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return {
        bg: 'bg-status-success/10 border-status-success/30',
        badge: 'bg-status-success/20 text-status-success border-status-success/50',
        icon: null,
        label: 'SAFE ZONE',
      };
      case 'medium': return {
        bg: 'bg-status-warning/10 border-status-warning/30',
        badge: 'bg-status-warning/20 text-status-warning border-status-warning/50',
        icon: Target,
        label: 'RANKED BATTLE',
      };
      case 'hard': return {
        bg: 'bg-destructive/10 border-destructive/30 at-risk-pulse',
        badge: 'bg-destructive/20 text-destructive border-destructive/50',
        icon: ShieldAlert,
        label: 'HIGH RISK',
      };
      case 'extreme': return {
        bg: 'bg-gradient-to-r from-rank-legend/20 via-destructive/10 to-rank-legend/20 border-rank-legend/50',
        badge: 'bg-rank-legend/20 text-rank-legend border-rank-legend/50 animate-pulse',
        icon: Crown,
        label: 'LEGENDARY',
      };
    }
  };

  const getDangerIndicator = (difficulty: Challenge['difficulty'], successRate: number) => {
    if (difficulty === 'extreme') {
      return { level: 'EXTREME', color: 'text-rank-legend', message: '92% fail rate. Are you ready?' };
    }
    if (difficulty === 'hard') {
      return { level: 'HIGH', color: 'text-destructive', message: 'High failure rate. Proceed with caution.' };
    }
    if (successRate < 50) {
      return { level: 'MEDIUM', color: 'text-status-warning', message: 'Challenging. Stay focused.' };
    }
    return null;
  };

  const dailyChallenge = mockChallenges.find(c => c.isDaily);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Intense Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <ChevronsUp className="h-6 w-6 text-primary animate-pulse" />
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>
            <Swords className="h-10 w-10 text-primary drop-shadow-[0_0_15px_hsl(var(--primary))]" />
            <h1 className="font-display text-4xl font-bold text-foreground">
              CHALLENGE <span className="text-primary neon-text">ARENA</span>
            </h1>
            <Swords className="h-10 w-10 text-primary drop-shadow-[0_0_15px_hsl(var(--primary))]" />
            <div className="flex items-center gap-1">
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <ChevronsUp className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Every challenge is a <span className="text-primary font-semibold">step up</span> or a <span className="text-destructive font-semibold">fall down</span>. Choose wisely.
          </p>
        </div>

        {/* Daily Challenge Banner */}
        {dailyChallenge && (
          <Link to={`/solve/${dailyChallenge.id}`}>
            <div className="arena-card p-6 mb-8 border-status-warning/50 bg-gradient-to-r from-status-warning/15 via-status-warning/5 to-transparent hover:border-status-warning transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-status-warning/10 blur-3xl rounded-full"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-status-warning/20 rounded-lg relative">
                    <Flame className="h-8 w-8 text-status-warning animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-status-warning text-background border-0 font-bold">
                        🔥 DAILY CHALLENGE
                      </Badge>
                      <Badge className="bg-destructive/20 text-destructive border-destructive/50">
                        EXPIRES IN {dailyChallenge.expiresIn}H
                      </Badge>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground group-hover:text-status-warning transition-colors">
                      {dailyChallenge.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Complete to maintain your streak. Missing this breaks your momentum.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-primary">
                        <Zap className="h-4 w-4" />
                        <span className="font-bold text-lg">+{dailyChallenge.xpReward}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">XP REWARD</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-status-success">
                        <ChevronsUp className="h-4 w-4" />
                        <span className="font-bold">+{dailyChallenge.rankImpact.win}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">RANK</span>
                    </div>
                  </div>
                  <Button variant="arena" className="bg-status-warning hover:bg-status-warning/80 font-bold">
                    ACCEPT CHALLENGE
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Stats with Pressure */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="arena-card p-4 text-center border-status-success/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-status-success" />
            </div>
            <div className="text-2xl font-bold text-status-success">
              {mockChallenges.filter(c => c.difficulty === 'easy').length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Safe Zone</div>
            <div className="text-[10px] text-status-success mt-1">No rank risk</div>
          </div>
          <div className="arena-card p-4 text-center border-status-warning/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="h-5 w-5 text-status-warning" />
            </div>
            <div className="text-2xl font-bold text-status-warning">
              {mockChallenges.filter(c => c.difficulty === 'medium').length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Ranked Battles</div>
            <div className="text-[10px] text-status-warning mt-1">Moderate risk</div>
          </div>
          <div className="arena-card p-4 text-center border-destructive/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <div className="text-2xl font-bold text-destructive">
              {mockChallenges.filter(c => c.difficulty === 'hard').length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">High Risk</div>
            <div className="text-[10px] text-destructive mt-1">Rank at stake</div>
          </div>
          <div className="arena-card p-4 text-center border-rank-legend/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Crown className="h-5 w-5 text-rank-legend" />
            </div>
            <div className="text-2xl font-bold text-rank-legend">
              {mockChallenges.filter(c => c.difficulty === 'extreme').length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Legendary</div>
            <div className="text-[10px] text-rank-legend mt-1">Elite only</div>
          </div>
        </div>

        {/* Filters */}
        <div className="arena-card p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex gap-2 flex-wrap">
              {['easy', 'medium', 'hard', 'extreme'].map((diff) => {
                const style = getDifficultyStyle(diff as Challenge['difficulty']);
                return (
                  <Button
                    key={diff}
                    variant={selectedDifficulty === diff ? 'arena' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                    className={`capitalize ${selectedDifficulty === diff ? '' : style.badge.split(' ').slice(1).join(' ')}`}
                  >
                    {diff}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap mt-4">
            <Filter className="h-4 w-4 text-muted-foreground mt-1" />
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${
                  selectedTag === tag ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/20'
                }`}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Risk Legend */}
        <div className="flex flex-wrap gap-4 justify-center mb-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-status-success"></div>
            <span className="text-muted-foreground">Safe (No Rank Loss)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-status-warning"></div>
            <span className="text-muted-foreground">Moderate Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive"></div>
            <span className="text-muted-foreground">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-rank-legend"></div>
            <span className="text-muted-foreground">Legendary (Elite Only)</span>
          </div>
        </div>

        {/* Challenges List */}
        <div className="space-y-4">
          {filteredChallenges.map((challenge, index) => {
            const style = getDifficultyStyle(challenge.difficulty);
            const danger = getDangerIndicator(challenge.difficulty, challenge.successRate);
            const IconComponent = style.icon;

            return (
              <Link
                key={challenge.id}
                to={`/solve/${challenge.id}`}
                className="block"
              >
                <div className={`arena-card p-6 hover:border-primary/50 transition-all duration-300 group ${style.bg}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-muted-foreground font-mono text-sm">#{index + 1}</span>
                        <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {challenge.title}
                        </h3>
                        <Badge className={`${style.badge} border uppercase text-xs font-bold`}>
                          {challenge.difficulty}
                        </Badge>
                        <Badge className={`${style.badge} border uppercase text-[10px]`}>
                          {style.label}
                        </Badge>
                        {challenge.isDaily && (
                          <Badge className="bg-status-warning/20 text-status-warning border-status-warning/50 text-[10px]">
                            🔥 DAILY
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{challenge.description}</p>
                      
                      {/* Danger Warning */}
                      {danger && (
                        <div className={`flex items-center gap-2 text-xs ${danger.color} mb-3`}>
                          <AlertTriangle className="h-3 w-3" />
                          <span className="font-semibold">{danger.level} DIFFICULTY:</span>
                          <span>{danger.message}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {challenge.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Risk/Reward */}
                      <div className="text-center border-r border-border pr-4">
                        <div className="flex items-center gap-1 text-status-success">
                          <ChevronsUp className="h-4 w-4" />
                          <span className="font-bold">+{challenge.rankImpact.win}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase">Win</span>
                      </div>
                      <div className="text-center border-r border-border pr-4">
                        <div className="flex items-center gap-1 text-destructive">
                          <TrendingDown className="h-4 w-4" />
                          <span className="font-bold">-{challenge.rankImpact.loss}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase">Fail</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-primary">
                          <Zap className="h-4 w-4" />
                          <span className="font-bold">{challenge.xpReward}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">XP</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{challenge.solvedBy.toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Solved</span>
                      </div>
                      <div className="text-center">
                        <div className={`flex items-center gap-1 ${
                          challenge.successRate < 30 ? 'text-destructive' : 
                          challenge.successRate < 50 ? 'text-status-warning' : 'text-status-success'
                        }`}>
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-medium">{challenge.successRate}%</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Success</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">{challenge.timeLimit}m</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Limit</span>
                      </div>
                      <MarkForRevisionButton
                        problemId={challenge.id}
                        problemTitle={challenge.title}
                        topic={challenge.tags[0]}
                        variant="compact"
                      />
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  {/* Success Rate Bar */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Global Success Rate</span>
                      <span className={`font-semibold ${
                        challenge.successRate < 30 ? 'text-destructive' : 
                        challenge.successRate < 50 ? 'text-status-warning' : 'text-status-success'
                      }`}>
                        {challenge.successRate}% pass
                      </span>
                    </div>
                    <Progress 
                      value={challenge.successRate} 
                      className={`h-1.5 ${
                        challenge.successRate < 30 ? '[&>div]:bg-destructive' : 
                        challenge.successRate < 50 ? '[&>div]:bg-status-warning' : '[&>div]:bg-status-success'
                      }`}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="arena-card p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No challenges found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-10 arena-card p-6 text-center border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <Target className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            The <span className="text-status-success">stronger</span> you become, the <span className="text-destructive">harder</span> you must push.
          </h3>
          <p className="text-muted-foreground text-sm">
            Easy challenges build foundation. Hard challenges build legends.
          </p>
        </div>
      </div>
    </div>
  );
}
