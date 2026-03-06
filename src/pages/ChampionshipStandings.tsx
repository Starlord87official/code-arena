import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Crown, Trophy, User, Users, Shield, ChevronRight, Verified,
  Filter, Search, Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarWithFrame, AvatarWithCrown } from "@/components/championship/AvatarWithFrame";
import { 
  TRACKS,
  FRAMES,
  TrackType,
  StandingEntry,
  formatTimeMs,
  getRefreshedSeasonData
} from "@/lib/championshipData";
import { cn } from "@/lib/utils";

// Standings Table Component
function StandingsTable({ 
  entries, 
  track,
  showVerifiedOnly 
}: { 
  entries: StandingEntry[];
  track: TrackType;
  showVerifiedOnly: boolean;
}) {
  const filteredEntries = showVerifiedOnly 
    ? entries.filter(e => e.verified)
    : entries;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="col-span-1">#</div>
        <div className="col-span-5">Player</div>
        <div className="col-span-3 text-right">Score</div>
        <div className="col-span-3 text-right">Time</div>
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Leaderboard will appear once competitions begin.</p>
        </div>
      )}
    </div>
  );
}

// Main Standings Page
export default function ChampionshipStandings() {
  const [activeTrack, setActiveTrack] = useState<TrackType>('solo');
  const [filter, setFilter] = useState<'all' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const season = getRefreshedSeasonData();
  const activeStage = season.stages.find(s => s.status === 'active');
  
  // No mock data — real standings will come from Supabase
  const standings: StandingEntry[] = [];

  const isFrozen = false;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <section className="border-b border-border/50 bg-gradient-to-b from-yellow-500/5 to-transparent">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link to="/championship" className="hover:text-primary transition-colors">
                  Championship
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span>Standings</span>
              </div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-400" />
                Live Standings
              </h1>
              <p className="text-muted-foreground mt-1">
                {activeStage?.name || 'Qualifier'} • {season.title}
              </p>
            </div>

            {/* Frozen indicator */}
            {isFrozen && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1">
                <Lock className="h-3 w-3" />
                Scoreboard Frozen
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Tabs value={activeTrack} onValueChange={(v) => setActiveTrack(v as TrackType)}>
            <TabsList>
              <TabsTrigger value="solo" className="gap-2">
                <User className="h-4 w-4" />
                Solo
              </TabsTrigger>
              <TabsTrigger value="duo" className="gap-2">
                <Users className="h-4 w-4" />
                Duo
              </TabsTrigger>
              <TabsTrigger value="clan" className="gap-2">
                <Shield className="h-4 w-4" />
                Clan
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as 'all' | 'verified')}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Participants</SelectItem>
                <SelectItem value="verified">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-400" />
                    Crown Lane Only
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden">
          {/* Full Standings — empty */}
          <CardContent className="pt-6">
            <StandingsTable 
              entries={standings} 
              track={activeTrack}
              showVerifiedOnly={filter === 'verified'}
            />
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Verified className="h-4 w-4 text-primary" />
            <span>Verified (Crown Lane)</span>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-400" />
            <span>Past Champion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500" />
            <span>Champion Frame</span>
          </div>
        </div>
      </div>
    </div>
  );
}
