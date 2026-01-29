import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Crown, Trophy, User, Users, Shield, ChevronRight, Star,
  Calendar, Timer, Target, Medal, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarWithFrame } from "@/components/championship/AvatarWithFrame";
import { 
  MOCK_CHAMPIONS_2025,
  MOCK_SOLO_STANDINGS,
  TRACKS,
  TrackType,
  Champion,
  formatTimeMs
} from "@/lib/championshipData";
import { cn } from "@/lib/utils";

// Champion Spotlight Component
function ChampionSpotlight({ champion }: { champion: Champion }) {
  const trackInfo = TRACKS[champion.track];
  const TrackIcon = champion.track === 'solo' ? User : champion.track === 'duo' ? Users : Shield;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-500/10 via-card to-amber-600/5 border-yellow-500/30">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-4 right-4 opacity-10">
            <Crown className="h-32 w-32 text-yellow-400" />
          </div>
          <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-yellow-500/10 blur-3xl rounded-full" />
        </div>

        <CardContent className="relative pt-8 pb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Champion Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2"
                >
                  <Crown className="h-12 w-12 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_20px_hsla(45,90%,55%,0.8)]" />
                </motion.div>
                <AvatarWithFrame
                  username={champion.username}
                  size="xl"
                  frame="champion"
                  crown={{ track: champion.track, year: champion.year }}
                  showHoverCard={false}
                />
              </div>

              {/* Name & Track */}
              <div className="text-center mt-4">
                <h2 className="text-2xl font-display font-bold text-yellow-400">
                  {champion.username}
                </h2>
                {champion.track === 'duo' && champion.partnerUsername && (
                  <p className="text-lg text-muted-foreground">
                    & {champion.partnerUsername}
                  </p>
                )}
                {champion.track === 'clan' && champion.clanName && (
                  <p className="text-lg text-muted-foreground">
                    {champion.clanName}
                  </p>
                )}
                <Badge 
                  className="mt-2"
                  style={{ 
                    background: `${trackInfo.accentColor}20`,
                    borderColor: `${trackInfo.accentColor}50`,
                    color: trackInfo.accentColor
                  }}
                >
                  <TrackIcon className="h-3 w-3 mr-1" />
                  {trackInfo.title} — India {champion.year}
                </Badge>
              </div>
            </div>

            {/* Champion Details */}
            <div className="flex-1 space-y-6">
              {/* Story */}
              {champion.story && (
                <div className="relative">
                  <Sparkles className="absolute -top-2 -left-2 h-5 w-5 text-yellow-400/50" />
                  <p className="text-muted-foreground italic leading-relaxed pl-4 border-l-2 border-yellow-500/30">
                    "{champion.story}"
                  </p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center py-3 px-4 rounded-lg bg-secondary/30">
                  <p className="text-2xl font-display font-bold text-yellow-400">
                    {champion.stats.totalScore.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Score</p>
                </div>
                <div className="text-center py-3 px-4 rounded-lg bg-secondary/30">
                  <p className="text-2xl font-display font-bold text-primary">
                    {champion.stats.problemsSolved}
                  </p>
                  <p className="text-xs text-muted-foreground">Problems Solved</p>
                </div>
                <div className="text-center py-3 px-4 rounded-lg bg-secondary/30">
                  <p className="text-2xl font-display font-bold text-cyan-400">
                    {champion.stats.avgTimePerProblem}m
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Time/Problem</p>
                </div>
                <div className="text-center py-3 px-4 rounded-lg bg-secondary/30">
                  <p className="text-2xl font-display font-bold text-green-400">
                    #{champion.stats.qualifierRank}
                  </p>
                  <p className="text-xs text-muted-foreground">Qualifier Rank</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                  View Profile
                </Button>
                <Button variant="outline">
                  Share Champion Card
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Champion Path Component
function ChampionPath({ champion }: { champion: Champion }) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Path to Glory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-primary to-yellow-500" />
          
          <div className="space-y-4">
            {champion.path.map((stage, index) => {
              const isLast = index === champion.path.length - 1;
              
              return (
                <motion.div 
                  key={stage.stageName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex gap-4 items-center"
                >
                  {/* Node */}
                  <div 
                    className={cn(
                      "relative z-10 w-8 h-8 rounded-full flex items-center justify-center",
                      isLast 
                        ? "bg-yellow-500/20 text-yellow-400 ring-2 ring-yellow-500" 
                        : "bg-green-500/20 text-green-400"
                    )}
                  >
                    {isLast ? (
                      <Crown className="h-4 w-4" />
                    ) : (
                      <Medal className="h-4 w-4" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex items-center justify-between py-2 px-4 rounded-lg bg-secondary/20">
                    <div>
                      <span className="font-semibold text-sm">{stage.stageName}</span>
                      <p className="text-xs text-muted-foreground">Rank #{stage.rank}</p>
                    </div>
                    <span className="font-display font-bold text-primary">{stage.score}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Clan Members Display
function ClanMembersDisplay({ champion }: { champion: Champion }) {
  if (champion.track !== 'clan' || !champion.clanMembers) return null;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Shield className="h-5 w-5 text-yellow-400" />
          Champion Squad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 justify-center">
          {champion.clanMembers.map((member) => (
            <div key={member.id} className="flex flex-col items-center">
              <AvatarWithFrame
                username={member.username}
                size="lg"
                frame="champion"
                showHoverCard={true}
              />
              <span className="text-sm font-medium mt-2">{member.username}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Archive Leaderboard
function ArchiveLeaderboard({ track, year }: { track: TrackType; year: number }) {
  const standings = MOCK_SOLO_STANDINGS; // Would filter by year in real app

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Top 100 — {year}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {standings.map((entry) => (
            <div 
              key={entry.userId}
              className={cn(
                "flex items-center gap-3 py-2 px-3 rounded-lg",
                entry.rank <= 3 ? "bg-yellow-500/10" : "bg-secondary/20"
              )}
            >
              <span className={cn(
                "w-8 text-center font-display font-bold",
                entry.rank === 1 && "text-yellow-400",
                entry.rank === 2 && "text-slate-400",
                entry.rank === 3 && "text-amber-600"
              )}>
                {entry.rank}
              </span>
              <AvatarWithFrame
                username={entry.username}
                size="sm"
                frame={entry.frame}
                crown={entry.isPastChampion ? { track, year } : undefined}
              />
              <span className="flex-1 text-sm font-medium truncate">{entry.username}</span>
              <span className="text-sm font-display text-primary">{entry.score}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Hall of Champions Page
export default function HallOfChampions() {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [activeTrack, setActiveTrack] = useState<TrackType>('solo');
  
  const availableYears = [2025]; // Would be dynamic
  
  const getChampion = () => {
    return MOCK_CHAMPIONS_2025.find(c => c.track === activeTrack && c.year === selectedYear);
  };

  const champion = getChampion();

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-amber-600/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-500/10 blur-[150px] rounded-full" />
        
        {/* Decorative crowns */}
        <div className="absolute top-8 left-8 opacity-10">
          <Crown className="h-24 w-24 text-yellow-400 rotate-[-15deg]" />
        </div>
        <div className="absolute bottom-8 right-8 opacity-10">
          <Crown className="h-20 w-20 text-yellow-400 rotate-[15deg]" />
        </div>

        <div className="relative container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center">
              <Crown className="h-16 w-16 text-yellow-400 drop-shadow-[0_0_30px_hsla(45,90%,55%,0.6)]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              <span className="text-yellow-400">Hall of Champions</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Legends who conquered the CodeLock Championship. Their names are etched in history.
            </p>
          </motion.div>
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

          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        {champion ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Champion Spotlight */}
            <div className="lg:col-span-2 space-y-6">
              <ChampionSpotlight champion={champion} />
              <ChampionPath champion={champion} />
              {champion.track === 'clan' && <ClanMembersDisplay champion={champion} />}
            </div>

            {/* Archive Leaderboard */}
            <div>
              <ArchiveLeaderboard track={activeTrack} year={selectedYear} />
            </div>
          </div>
        ) : (
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="py-16 text-center">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-display font-semibold mb-2">No Champion Yet</h3>
              <p className="text-muted-foreground">
                The {TRACKS[activeTrack].title} champion for {selectedYear} has not been crowned yet.
              </p>
              <Link to="/championship">
                <Button className="mt-4">
                  View Current Season <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Back to Championship */}
      <div className="container mx-auto px-4 mt-8">
        <Link to="/championship">
          <Button variant="outline" className="gap-2">
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Championship
          </Button>
        </Link>
      </div>
    </div>
  );
}
