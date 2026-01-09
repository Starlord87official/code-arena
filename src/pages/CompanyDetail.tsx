import { useParams, Link } from 'react-router-dom';
import { 
  Building2, ChevronLeft, ChevronRight, Zap, Users, Star, 
  TrendingUp, Calendar, Clock, ChevronsUp, TrendingDown, Target, Crown, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  getCompanyBySlug, 
  getChallengesForCompany, 
  getFrequencyLabel, 
  getFrequencyBadgeClass,
  CompanyChallengeMeta 
} from '@/lib/companyData';
import { mockChallenges, getDifficultyColor, Challenge } from '@/lib/mockData';
import { MarkForRevisionButton } from '@/components/revision/MarkForRevisionButton';

function CompanyChallengeCard({ 
  challenge, 
  meta 
}: { 
  challenge: Challenge;
  meta: CompanyChallengeMeta;
}) {
  const getDifficultyStyle = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return {
        badge: 'bg-status-success/20 text-status-success border-status-success/50',
        icon: null,
      };
      case 'medium': return {
        badge: 'bg-status-warning/20 text-status-warning border-status-warning/50',
        icon: Target,
      };
      case 'hard': return {
        badge: 'bg-destructive/20 text-destructive border-destructive/50',
        icon: ShieldAlert,
      };
      case 'extreme': return {
        badge: 'bg-rank-legend/20 text-rank-legend border-rank-legend/50',
        icon: Crown,
      };
    }
  };

  const style = getDifficultyStyle(challenge.difficulty);

  return (
    <div className="arena-card p-5 rounded-xl hover:border-primary/50 transition-all group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Link to={`/solve/${challenge.id}`}>
              <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">
                {challenge.title}
              </h3>
            </Link>
            <Badge className={`${style.badge} border uppercase text-xs font-bold`}>
              {challenge.difficulty}
            </Badge>
            <Badge className={`${getFrequencyBadgeClass(meta.frequency)} border text-xs`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {getFrequencyLabel(meta.frequency)}
            </Badge>
            {meta.lastAskedYear && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {meta.lastAskedYear}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {challenge.description}
          </p>
          
          <div className="flex flex-wrap gap-1.5">
            {challenge.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center gap-1 text-status-success">
                <ChevronsUp className="h-4 w-4" />
                <span className="font-bold">+{challenge.rankImpact.win}</span>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase">Win</span>
            </div>
            <div className="text-center">
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
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <MarkForRevisionButton
              problemId={challenge.id}
              problemTitle={challenge.title}
              topic={challenge.tags[0]}
              variant="compact"
            />
            <Link to={`/solve/${challenge.id}`}>
              <Button variant="arena" size="sm" className="gap-1">
                Solve
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompanyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const company = getCompanyBySlug(slug || '');

  if (!company) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Company Not Found</h1>
          <p className="text-muted-foreground mb-6">The company you're looking for doesn't exist.</p>
          <Link to="/companies">
            <Button variant="arena">Back to Companies</Button>
          </Link>
        </div>
      </div>
    );
  }

  const challengeMetas = getChallengesForCompany(company.slug);
  const challenges = challengeMetas
    .map(meta => ({
      challenge: mockChallenges.find(c => c.id === meta.challengeId),
      meta,
    }))
    .filter((item): item is { challenge: Challenge; meta: CompanyChallengeMeta } => 
      item.challenge !== undefined
    );

  // Sort by frequency (frequent first) then by difficulty
  const sortedChallenges = challenges.sort((a, b) => {
    const freqOrder = { frequent: 0, medium: 1, rare: 2 };
    const freqDiff = freqOrder[a.meta.frequency] - freqOrder[b.meta.frequency];
    if (freqDiff !== 0) return freqDiff;
    
    const diffOrder = { easy: 0, medium: 1, hard: 2, extreme: 3 };
    return diffOrder[a.challenge.difficulty] - diffOrder[b.challenge.difficulty];
  });

  const frequentCount = challenges.filter(c => c.meta.frequency === 'frequent').length;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link 
          to="/companies" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Companies
        </Link>

        {/* Company Header */}
        <div className="arena-card p-8 rounded-xl mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="font-display text-3xl font-bold">{company.name}</h1>
                {company.tier === 1 && (
                  <Badge className="bg-rank-legend/20 text-rank-legend border-rank-legend/50">
                    <Star className="h-3 w-3 mr-1" />
                    Top Tech
                  </Badge>
                )}
                {company.tier === 2 && (
                  <Badge className="bg-rank-platinum/20 text-rank-platinum border-rank-platinum/50">
                    Tier 2
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground mb-4 max-w-2xl">
                {company.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {company.tags.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 md:gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{challenges.length}</div>
                <div className="text-xs text-muted-foreground uppercase">Problems</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-status-success">{frequentCount}</div>
                <div className="text-xs text-muted-foreground uppercase">Frequent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequency Legend */}
        <div className="flex flex-wrap gap-4 justify-center mb-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-status-success"></div>
            <span className="text-muted-foreground">Frequently Asked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-status-warning"></div>
            <span className="text-muted-foreground">Sometimes Asked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted"></div>
            <span className="text-muted-foreground">Rarely Asked</span>
          </div>
        </div>

        {/* Challenges List */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Problems Asked at {company.name}
          </h2>
          
          {sortedChallenges.length === 0 ? (
            <div className="arena-card p-8 rounded-xl text-center">
              <p className="text-muted-foreground">No problems mapped to this company yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedChallenges.map(({ challenge, meta }) => (
                <CompanyChallengeCard 
                  key={challenge.id} 
                  challenge={challenge} 
                  meta={meta}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Interview Prep Tip</h4>
              <p className="text-sm text-muted-foreground">
                Focus on "Frequently Asked" problems first. Use the revision feature to schedule follow-up practice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
