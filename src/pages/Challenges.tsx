import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Zap, Trophy, Users, TrendingUp, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockChallenges, getDifficultyColor, Challenge } from '@/lib/mockData';

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

  const getDifficultyBg = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-status-success/20 border-status-success/50';
      case 'medium': return 'bg-status-warning/20 border-status-warning/50';
      case 'hard': return 'bg-destructive/20 border-destructive/50';
      case 'extreme': return 'bg-rank-legend/20 border-rank-legend/50';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            CHALLENGE <span className="text-primary">ARENA</span>
          </h1>
          <p className="text-muted-foreground">
            Select your battlefield. Only the strongest survive.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="arena-card p-4 text-center">
            <div className="text-2xl font-bold text-primary">{mockChallenges.length}</div>
            <div className="text-sm text-muted-foreground">Total Challenges</div>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="text-2xl font-bold text-status-success">
              {mockChallenges.filter(c => c.difficulty === 'easy').length}
            </div>
            <div className="text-sm text-muted-foreground">Easy</div>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="text-2xl font-bold text-destructive">
              {mockChallenges.filter(c => c.difficulty === 'hard' || c.difficulty === 'extreme').length}
            </div>
            <div className="text-sm text-muted-foreground">Hard+</div>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="text-2xl font-bold text-rank-legend">
              {mockChallenges.filter(c => c.difficulty === 'extreme').length}
            </div>
            <div className="text-sm text-muted-foreground">Extreme</div>
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

        {/* Challenges List */}
        <div className="space-y-4">
          {filteredChallenges.map((challenge, index) => (
            <Link
              key={challenge.id}
              to={`/solve/${challenge.id}`}
              className="block"
            >
              <div className={`arena-card p-6 hover:border-primary/50 transition-all duration-300 group ${
                challenge.difficulty === 'extreme' ? 'border-rank-legend/30 hover:border-rank-legend/70' : ''
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-muted-foreground font-mono text-sm">#{index + 1}</span>
                      <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {challenge.title}
                      </h3>
                      <Badge className={`${getDifficultyBg(challenge.difficulty)} ${getDifficultyColor(challenge.difficulty)} border uppercase text-xs font-bold`}>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{challenge.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {challenge.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-primary">
                        <Zap className="h-4 w-4" />
                        <span className="font-bold">{challenge.xpReward}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">XP</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{challenge.solvedBy.toLocaleString()}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Solved</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">{challenge.successRate}%</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Success</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="arena-card p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No challenges found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
