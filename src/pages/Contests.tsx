import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, Calendar, Clock, Users, Zap, ChevronRight, 
  Timer, Star, Filter, Play, Swords, ShieldAlert, ChevronsUp,
  TrendingDown, AlertTriangle, Crown, Target, Flame, BookOpen, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/bl/PageHeader';
import { GlassPanel } from '@/components/bl/GlassPanel';

const statusFilters = ['all', 'upcoming', 'live', 'ended'] as const;

export default function Contests() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          sector="007"
          tag="SURVIVAL_ARENA"
          title={<>SURVIVAL <span className="text-neon text-glow">ARENA</span></>}
          subtitle="Every contest is a test of survival. Miss one, and you fall behind."
        />

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
        <GlassPanel corners padding="lg" className="text-center">
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

            <GlassPanel padding="md" className="bg-neon/5 border-neon/20 mb-6">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 rounded-lg bg-neon/20">
                  <Clock className="h-5 w-5 text-neon" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Get Notified</p>
                  <p className="text-xs text-text-dim">We'll notify you when the first contest is scheduled.</p>
                </div>
              </div>
            </GlassPanel>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/roadmap">
                <Button variant="egoist">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Continue Your Roadmap
                </Button>
              </Link>
              <Link to="/battle">
                <Button variant="egoistGhost">
                  <Swords className="h-4 w-4 mr-2" />
                  Practice in Battle Mode
                </Button>
              </Link>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
