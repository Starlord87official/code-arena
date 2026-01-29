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
  MOCK_SEASON_2026, 
  MOCK_SOLO_STANDINGS,
  MOCK_DUO_STANDINGS,
  MOCK_CLAN_STANDINGS,
  TRACKS,
  FRAMES,
  TrackType,
  StandingEntry,
  formatTimeMs
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

      {/* Rows */}
      {filteredEntries.map((entry, idx) => {
        const frameConfig = entry.frame ? FRAMES[entry.frame] : null;
        const isTop3 = entry.rank <= 3;
        
        return (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.02 }}
            className={cn(
              "grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-lg transition-colors",
              "hover:bg-secondary/30",
              entry.rank === 1 && "bg-yellow-500/10 border border-yellow-500/20",
              entry.rank === 2 && "bg-slate-400/10 border border-slate-400/20",
              entry.rank === 3 && "bg-amber-600/10 border border-amber-600/20",
              !isTop3 && "bg-secondary/10"
            )}
          >
            {/* Rank */}
            <div className="col-span-1">
              <span className={cn(
                "font-display font-bold text-lg",
                entry.rank === 1 && "text-yellow-400",
                entry.rank === 2 && "text-slate-400",
                entry.rank === 3 && "text-amber-600",
                !isTop3 && "text-muted-foreground"
              )}>
                {entry.rank}
              </span>
            </div>

            {/* Player Info */}
            <div className="col-span-5 flex items-center gap-3">
              <AvatarWithFrame
                username={entry.username}
                size="sm"
                frame={entry.frame}
                crown={entry.isPastChampion ? { track, year: entry.championYears?.[0] || 2025 } : undefined}
                showHoverCard={true}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{entry.username}</span>
                  {entry.verified && (
                    <Verified className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  )}
                </div>
                {track === 'duo' && entry.partnerUsername && (
                  <p className="text-xs text-muted-foreground truncate">
                    + {entry.partnerUsername}
                  </p>
                )}
                {track === 'clan' && entry.clanName && (
                  <p className="text-xs text-muted-foreground truncate">
                    {entry.clanName}
                  </p>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="col-span-3 text-right">
              <span className="font-display font-bold text-primary">
                {entry.score.toLocaleString()}
              </span>
            </div>

            {/* Time */}
            <div className="col-span-3 text-right text-sm text-muted-foreground">
              {formatTimeMs(entry.timeMs)}
            </div>
          </motion.div>
        );
      })}

      {filteredEntries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No standings to display yet.</p>
        </div>
      )}
    </div>
  );
}

// Top 3 Podium Component
function TopPodium({ entries, track }: { entries: StandingEntry[]; track: TrackType }) {
  const top3 = entries.slice(0, 3);
  if (top3.length < 3) return null;

  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd

  return (
    <div className="flex items-end justify-center gap-4 mb-8 pt-8">
      {podiumOrder.map((entry, idx) => {
        const isFirst = idx === 1;
        const rank = entry.rank;
        
        return (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "flex flex-col items-center",
              isFirst && "order-2",
              idx === 0 && "order-1",
              idx === 2 && "order-3"
            )}
          >
            {/* Avatar with Crown for #1 */}
            <div className="relative mb-3">
              {isFirst && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2"
                >
                  <Crown className="h-8 w-8 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_hsla(45,90%,55%,0.8)]" />
                </motion.div>
              )}
              <AvatarWithFrame
                username={entry.username}
                size={isFirst ? "xl" : "lg"}
                frame={entry.frame}
                showHoverCard={true}
              />
            </div>

            {/* Name */}
            <p className={cn(
              "font-semibold text-center truncate max-w-[100px]",
              isFirst && "text-yellow-400"
            )}>
              {entry.username}
            </p>

            {/* Score */}
            <p className="text-sm text-primary font-display font-bold">
              {entry.score.toLocaleString()}
            </p>

            {/* Podium Block */}
            <div 
              className={cn(
                "mt-3 rounded-t-lg flex items-center justify-center font-display font-bold text-2xl",
                isFirst && "w-24 h-24 bg-gradient-to-t from-yellow-600 to-yellow-400 text-yellow-900",
                rank === 2 && "w-20 h-16 bg-gradient-to-t from-slate-500 to-slate-400 text-slate-900",
                rank === 3 && "w-20 h-12 bg-gradient-to-t from-amber-700 to-amber-600 text-amber-900"
              )}
            >
              {rank}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Main Standings Page
export default function ChampionshipStandings() {
  const [activeTrack, setActiveTrack] = useState<TrackType>('solo');
  const [filter, setFilter] = useState<'all' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const season = MOCK_SEASON_2026;
  const activeStage = season.stages.find(s => s.status === 'active');
  
  const getStandings = () => {
    switch (activeTrack) {
      case 'solo': return MOCK_SOLO_STANDINGS;
      case 'duo': return MOCK_DUO_STANDINGS;
      case 'clan': return MOCK_CLAN_STANDINGS;
      default: return [];
    }
  };

  const standings = getStandings().filter(entry => 
    entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.partnerUsername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.clanName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFrozen = false; // Would be true near finals end

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
          {/* Top 3 Podium */}
          <div className="border-b border-border/50 bg-gradient-to-b from-yellow-500/5 to-transparent">
            <TopPodium entries={standings} track={activeTrack} />
          </div>

          {/* Full Standings */}
          <CardContent className="pt-6">
            <StandingsTable 
              entries={standings.slice(3)} 
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
