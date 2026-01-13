import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, Calendar, Clock, Users, Zap, ChevronRight, 
  Timer, Star, Filter, Play, Swords, ShieldAlert, ChevronsUp,
  TrendingDown, AlertTriangle, Crown, Target, Flame, BookOpen, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statusFilters = ['all', 'upcoming', 'live', 'ended'] as const;

export default function Contests() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // In private beta, no contests yet
  const contests: any[] = [];

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

        {/* Private Beta Empty State */}
        <div className="arena-card p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-status-warning/20 via-primary/20 to-status-warning/20 blur-3xl rounded-full" />
              <div className="relative inline-flex items-center justify-center p-6 rounded-full bg-gradient-to-br from-status-warning/10 to-primary/10 border border-status-warning/20">
                <Trophy className="h-12 w-12 text-status-warning" />
              </div>
            </div>
            
            <Badge className="mb-4 bg-status-warning/10 text-status-warning border-status-warning/30">
              COMING SOON
            </Badge>
            
            <h2 className="font-display text-2xl font-bold mb-3">
              Contests Are Brewing
            </h2>
            
            <p className="text-muted-foreground mb-6">
              Weekly contests will be announced soon. As an early adopter, you'll be the first to compete when they launch.
            </p>

            <div className="arena-card p-4 bg-primary/5 border-primary/20 mb-6">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Get Notified</p>
                  <p className="text-xs text-muted-foreground">We'll notify you when the first contest is scheduled.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/roadmap">
                <Button variant="arena">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Continue Your Roadmap
                </Button>
              </Link>
              <Link to="/battle">
                <Button variant="outline">
                  <Swords className="h-4 w-4 mr-2" />
                  Practice in Battle Mode
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
