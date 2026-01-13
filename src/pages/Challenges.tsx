import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Zap, Trophy, Users, TrendingUp, ChevronRight, 
  Target, AlertTriangle, Clock, ChevronsUp, Flame, ShieldAlert,
  TrendingDown, Crown, Swords, BookOpen, Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getDifficultyColor, Challenge } from '@/lib/mockData';

export default function Challenges() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // In private beta, challenges will come from real data sources
  const challenges: Challenge[] = [];
  const allTags: string[] = [];

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

        {/* Private Beta Empty State */}
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
              Challenges Coming Soon
            </h2>
            
            <p className="text-muted-foreground mb-6">
              Our challenge library is being curated. In the meantime, follow your roadmap to build a strong foundation.
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
                  <Target className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
