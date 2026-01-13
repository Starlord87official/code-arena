import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Crown, Medal, TrendingUp, TrendingDown, Zap, Flame, ChevronUp, ChevronDown, AlertTriangle, Target, Swords, ShieldAlert, ChevronsUp, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getDivisionColor, getDivisionAura, User } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';

const divisions = ['all', 'legend', 'master', 'diamond', 'platinum', 'gold', 'silver', 'bronze'] as const;

// In Private Beta - no leaderboard data yet
export default function Leaderboard() {
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const { user, profile } = useAuth();

  // Empty state for private beta
  const leaderboardData: User[] = [];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Elite Arena Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <ChevronsUp className="h-6 w-6 text-primary animate-pulse" />
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>
            <Crown className="h-10 w-10 text-rank-gold drop-shadow-[0_0_10px_hsl(var(--rank-gold))]" />
            <h1 className="font-display text-4xl font-bold text-foreground">
              THE <span className="text-primary neon-text">ARENA</span>
            </h1>
            <Crown className="h-10 w-10 text-rank-gold drop-shadow-[0_0_10px_hsl(var(--rank-gold))]" />
            <div className="flex items-center gap-1">
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <ChevronsUp className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Only the <span className="text-primary font-bold">elite</span> rise. Prove your dominance.
          </p>
        </div>

        {/* Division Filter */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {divisions.map((div) => (
            <Button
              key={div}
              variant={selectedDivision === div ? 'arena' : 'outline'}
              size="sm"
              onClick={() => setSelectedDivision(div)}
              className="capitalize"
            >
              {div === 'all' ? 'All Divisions' : div}
            </Button>
          ))}
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
              You're Among the First
            </h2>
            
            <p className="text-muted-foreground mb-6">
              The arena is just opening. As more warriors join and complete challenges, 
              the leaderboard will come alive with fierce competition.
            </p>

            {user && profile && (
              <div className="arena-card p-4 bg-primary/5 border-primary/20 mb-6">
                <div className="flex items-center justify-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                      {profile.username?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold">{profile.username || 'Warrior'}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {profile.xp || 0} XP
                    </p>
                  </div>
                  <Badge className="ml-auto bg-rank-gold/20 text-rank-gold border-rank-gold/50">
                    Early Adopter
                  </Badge>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/challenges">
                <Button variant="arena">
                  <Target className="h-4 w-4 mr-2" />
                  Start Solving Challenges
                </Button>
              </Link>
              <Link to="/roadmap">
                <Button variant="outline">
                  <Trophy className="h-4 w-4 mr-2" />
                  Follow Your Roadmap
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Zone Legend (kept for future reference) */}
        <div className="flex flex-wrap gap-4 justify-center mt-6 text-xs opacity-50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-status-success"></div>
            <span className="text-muted-foreground">Promotion Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-status-warning"></div>
            <span className="text-muted-foreground">Rival (Target)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span className="text-muted-foreground">You / Above You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive"></div>
            <span className="text-muted-foreground">Demotion Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
}
