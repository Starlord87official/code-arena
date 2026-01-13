import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Search, Zap, Users, ChevronRight, 
  ChevronsUp, Swords, BookOpen, Sparkles, Check, Loader2, 
  Clock, Shield, AlertTriangle, Flame, Crown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useChallenges, ChallengeWithStats, getRiskLevel, getRiskLabel, getRiskColor } from '@/hooks/useChallenges';
import { useDailyChallenge, useDailyStreak } from '@/hooks/useDailyChallenge';
import { MarkForRevisionButton } from '@/components/revision/MarkForRevisionButton';
import { DailyChallengeBanner } from '@/components/challenge/DailyChallengeBanner';

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'easy': return 'text-status-success';
    case 'medium': return 'text-status-warning';
    case 'hard': return 'text-destructive';
    case 'extreme': return 'text-rank-legend';
    default: return 'text-muted-foreground';
  }
}

function getDifficultyBg(difficulty: string) {
  switch (difficulty) {
    case 'easy': return 'bg-status-success/10';
    case 'medium': return 'bg-status-warning/10';
    case 'hard': return 'bg-destructive/10';
    case 'extreme': return 'bg-rank-legend/10';
    default: return 'bg-muted';
  }
}

function getRiskIcon(risk: 'safe' | 'moderate' | 'high' | 'legendary') {
  switch (risk) {
    case 'safe': return <Shield className="h-3 w-3" />;
    case 'moderate': return <AlertTriangle className="h-3 w-3" />;
    case 'high': return <Flame className="h-3 w-3" />;
    case 'legendary': return <Crown className="h-3 w-3" />;
  }
}

function ChallengeCard({ challenge }: { challenge: ChallengeWithStats }) {
  const riskLevel = getRiskLevel(challenge.rank_impact_loss);
  const riskLabel = getRiskLabel(riskLevel);
  const riskColorClass = getRiskColor(riskLevel);

  return (
    <div className="arena-card p-5 rounded-xl group">
      <div className="flex items-start justify-between">
        <Link to={`/solve/${challenge.slug}`} className="flex-1">
          {/* Badges Row */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {/* Difficulty Badge */}
            <span className={`text-xs font-heading uppercase font-semibold px-2 py-1 rounded ${getDifficultyColor(challenge.difficulty)} ${getDifficultyBg(challenge.difficulty)}`}>
              {challenge.difficulty}
            </span>
            
            {/* Risk Badge */}
            <span className={`text-xs font-heading uppercase font-semibold px-2 py-1 rounded flex items-center gap-1 ${riskColorClass}`}>
              {getRiskIcon(riskLevel)}
              {riskLabel}
            </span>
            
            {/* Solved Badge */}
            {challenge.isSolved && (
              <span className="flex items-center gap-1 text-xs text-status-success bg-status-success/10 px-2 py-1 rounded">
                <Check className="h-3 w-3" />
                Solved
              </span>
            )}
            
            {/* Daily Badge */}
            {challenge.is_daily && (
              <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                <Clock className="h-3 w-3 mr-1" />
                Daily
              </Badge>
            )}
          </div>
          
          <h3 className="font-heading font-bold text-lg mb-2 group-hover:text-primary transition-colors">
            {challenge.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {challenge.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {challenge.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </Link>
        <div className="flex items-center gap-2 flex-shrink-0">
          <MarkForRevisionButton
            problemId={challenge.id}
            problemTitle={challenge.title}
            topic={challenge.tags[0]}
            variant="compact"
          />
          <Link to={`/solve/${challenge.slug}`}>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
      
      {/* Stats Footer */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-semibold text-primary">+{challenge.xp_reward}</span> XP
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {challenge.solvedBy === 0 ? (
            <span className="text-muted-foreground/70">No solves yet</span>
          ) : (
            <span>{challenge.solvedBy.toLocaleString()} solved</span>
          )}
        </div>
        
        {/* Success Rate */}
        <div className="flex items-center gap-2 ml-auto text-sm">
          {challenge.successRate !== null && challenge.attemptCount > 0 ? (
            <>
              <span className="text-muted-foreground">{challenge.successRate}% success</span>
              <Progress value={challenge.successRate} className="w-16 h-1.5" />
            </>
          ) : (
            <span className="text-muted-foreground/60 text-xs">No data yet</span>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {challenge.time_limit} min
        </div>
      </div>
    </div>
  );
}

export default function Challenges() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { challenges, allTags, isLoading, error } = useChallenges();
  const { dailyChallenge, isLoading: dailyLoading } = useDailyChallenge();
  const { streak } = useDailyStreak();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Filter challenges (exclude the daily challenge from regular list to avoid duplication)
  const filteredChallenges = challenges.filter(challenge => {
    // Don't show daily challenge in the regular grid - it's in the banner
    if (dailyChallenge.challenge?.id === challenge.id) return false;
    
    const matchesSearch = !searchQuery || 
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDifficulty = !selectedDifficulty || challenge.difficulty === selectedDifficulty;
    const matchesTag = !selectedTag || challenge.tags.includes(selectedTag);
    
    return matchesSearch && matchesDifficulty && matchesTag;
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
              {['easy', 'medium', 'hard', 'extreme'].map((diff) => (
                <Button
                  key={diff}
                  variant={selectedDifficulty === diff ? 'arena' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                  className="capitalize"
                >
                  {diff}
                </Button>
              ))}
            </div>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-4 pt-4 border-t border-border">
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'arena' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className="text-xs"
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}
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

        {/* Daily Challenge Banner */}
        {!isLoading && !authLoading && dailyChallenge.challenge && (
          <DailyChallengeBanner dailyChallenge={dailyChallenge} streak={streak} />
        )}

        {/* Loading State */}
        {(isLoading || authLoading || dailyLoading) && (
          <div className="arena-card p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading challenges...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="arena-card p-12 text-center">
            <p className="text-destructive mb-4">Failed to load challenges</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Challenges Grid */}
        {!isLoading && !authLoading && !error && filteredChallenges.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        )}

        {/* Empty State - No challenges match filters */}
        {!isLoading && !authLoading && !error && filteredChallenges.length === 0 && challenges.length > 0 && (
          <div className="arena-card p-12 text-center">
            <div className="max-w-md mx-auto">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold mb-3">
                No Matching Challenges
              </h2>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search query.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDifficulty(null);
                  setSelectedTag(null);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Empty State - No challenges exist yet */}
        {!isLoading && !authLoading && !error && challenges.length === 0 && (
          <div className="arena-card p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl rounded-full" />
                <div className="relative inline-flex items-center justify-center p-6 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
              </div>
              
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
                PRIVATE BETA
              </Badge>
              
              <h2 className="font-display text-2xl font-bold mb-3">
                You're Among the First
              </h2>
              
              <p className="text-muted-foreground mb-6">
                Challenges are being added. In the meantime, follow your roadmap to build a strong foundation.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/roadmap">
                  <Button variant="arena">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Follow Your Roadmap
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
