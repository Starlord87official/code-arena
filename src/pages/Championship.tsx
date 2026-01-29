import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Crown, Trophy, User, Users, Shield, Clock, CheckCircle2, 
  ChevronRight, Verified, AlertCircle, Calendar, Zap, Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarWithFrame, AvatarWithCrown } from "@/components/championship/AvatarWithFrame";
import { 
  MOCK_USER_STATUS, 
  MOCK_SOLO_STANDINGS,
  TRACKS,
  TrackType,
  UserTrackStatus,
  getStageStatusLabel,
  getUserStatusLabel,
  getRefreshedSeasonData,
  getNextPhaseForCountdown
} from "@/lib/championshipData";
import { cn } from "@/lib/utils";

// Countdown Timer Component
function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - Date.now();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-3">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center">
          <div className="bg-secondary/50 rounded-lg px-3 py-2 min-w-[50px]">
            <span className="font-display text-xl font-bold text-primary">
              {value.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] uppercase text-muted-foreground mt-1">
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

// Track Card Component
function TrackCard({ 
  track, 
  userStatus,
  nextStage 
}: { 
  track: TrackType;
  userStatus?: { status: UserTrackStatus; rank?: number; partner?: { username: string } };
  nextStage?: { name: string; date: string };
}) {
  const trackInfo = TRACKS[track];
  const navigate = useNavigate();
  
  const TrackIcon = track === 'solo' ? User : track === 'duo' ? Users : Shield;
  
  const statusColors: Record<UserTrackStatus, string> = {
    not_registered: 'text-muted-foreground',
    registered: 'text-primary',
    qualified: 'text-green-400',
    eliminated: 'text-destructive',
    finalist: 'text-purple-400',
    champion: 'text-yellow-400'
  };

  const getCTA = () => {
    if (!userStatus || userStatus.status === 'not_registered') {
      return { label: 'Register Now', action: () => navigate(`/championship/register/${track}`) };
    }
    if (userStatus.status === 'eliminated') {
      return { label: 'View Results', action: () => navigate('/championship/my-progress') };
    }
    if (userStatus.status === 'qualified' || userStatus.status === 'registered') {
      return { label: 'View Progress', action: () => navigate('/championship/my-progress') };
    }
    return { label: 'View Progress', action: () => navigate('/championship/my-progress') };
  };

  const cta = getCTA();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={cn(
          "relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm",
          "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300",
          track === 'clan' && "ring-1 ring-yellow-500/20"
        )}
      >
        {/* Glow accent */}
        <div 
          className="absolute top-0 left-0 right-0 h-1 opacity-60"
          style={{ background: trackInfo.accentColor }}
        />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-2.5 rounded-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${trackInfo.accentColor}20, ${trackInfo.accentColor}10)`,
                  boxShadow: `0 0 20px ${trackInfo.accentColor}20`
                }}
              >
                <TrackIcon className="h-5 w-5" style={{ color: trackInfo.accentColor }} />
              </div>
              <div>
                <CardTitle className="text-lg font-display">{trackInfo.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{trackInfo.description}</p>
              </div>
            </div>
            {track === 'clan' && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">
                ELITE PATH
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Prize */}
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">{trackInfo.prize}</span>
          </div>

          {/* User Status */}
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
            <span className="text-xs text-muted-foreground">Your Status</span>
            <span className={cn("text-sm font-semibold", statusColors[userStatus?.status || 'not_registered'])}>
              {getUserStatusLabel(userStatus?.status || 'not_registered')}
              {userStatus?.rank && ` (#${userStatus.rank})`}
            </span>
          </div>

          {/* Duo Partner Info */}
          {track === 'duo' && userStatus?.partner && (
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-secondary/30">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Partner:</span>
              <span className="text-sm font-medium">{userStatus.partner.username}</span>
            </div>
          )}

          {/* Next Stage */}
          {nextStage && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Next: {nextStage.name}</span>
              <span className="text-primary">
                {new Date(nextStage.date).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Asia/Kolkata'
                })} IST
              </span>
            </div>
          )}

          {/* CTA Button */}
          <Button 
            className="w-full group"
            variant={userStatus?.status === 'not_registered' ? 'default' : 'outline'}
            onClick={cta.action}
          >
            {cta.label}
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Stage Timeline Component
function StageTimeline() {
  const season = getRefreshedSeasonData();
  const stages = season.stages;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Selection Path
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const isActive = stage.status === 'active';
              const isCompleted = stage.status === 'completed';
              
              return (
                <div key={stage.id} className="relative flex gap-4 items-start">
                  {/* Node */}
                  <div 
                    className={cn(
                      "relative z-10 w-8 h-8 rounded-full flex items-center justify-center",
                      isCompleted && "bg-green-500/20 text-green-400",
                      isActive && "bg-primary/20 text-primary ring-2 ring-primary animate-pulse",
                      !isCompleted && !isActive && "bg-secondary text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isActive ? (
                      <Zap className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-semibold text-sm",
                        isActive && "text-primary",
                        isCompleted && "text-green-400"
                      )}>
                        {stage.name}
                      </span>
                      {isActive && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] animate-pulse">
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(stage.startDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        timeZone: 'Asia/Kolkata'
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{stage.format}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Live Standings Preview
function LiveStandingsPreview() {
  const topStandings = MOCK_SOLO_STANDINGS.slice(0, 5);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Live Standings
        </CardTitle>
        <Link to="/championship/standings">
          <Button variant="ghost" size="sm" className="text-xs">
            View All <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topStandings.map((entry) => (
            <div 
              key={entry.userId}
              className={cn(
                "flex items-center gap-3 py-2 px-3 rounded-lg",
                entry.rank === 1 && "bg-yellow-500/10",
                entry.rank === 2 && "bg-slate-400/10",
                entry.rank === 3 && "bg-amber-600/10"
              )}
            >
              <span className={cn(
                "w-6 text-center font-display font-bold",
                entry.rank === 1 && "text-yellow-400",
                entry.rank === 2 && "text-slate-400",
                entry.rank === 3 && "text-amber-600"
              )}>
                {entry.rank}
              </span>
              <AvatarWithCrown 
                username={entry.username}
                isPastChampion={entry.isPastChampion}
                size="sm"
              />
              <span className="flex-1 text-sm font-medium truncate">{entry.username}</span>
              {entry.verified && (
                <Verified className="h-3.5 w-3.5 text-primary" />
              )}
              <span className="text-sm font-display text-primary">{entry.score}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// User Status Panel
function UserStatusPanel() {
  const status = MOCK_USER_STATUS;
  const navigate = useNavigate();

  const getNextAction = () => {
    if (!status.phoneVerified) {
      return { label: 'Verify Phone Number', action: () => {}, icon: AlertCircle, urgent: true };
    }
    if (!status.tracks.duo?.partner) {
      return { label: 'Pick Duo Partner', action: () => navigate('/partner/matches'), icon: Users };
    }
    return { label: 'Start Practice Set', action: () => navigate('/challenges'), icon: Target };
  };

  const nextAction = getNextAction();

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-display">My Championship Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Verification Lane */}
        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2">
            {status.verificationLane === 'crown' ? (
              <Crown className="h-4 w-4 text-yellow-400" />
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">
              {status.verificationLane === 'crown' ? 'Crown Lane' : 'Open Lane'}
            </span>
          </div>
          {status.phoneVerified ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              Pending
            </Badge>
          )}
        </div>

        {/* Tracks Joined */}
        <div className="flex gap-2">
          {(['solo', 'duo', 'clan'] as TrackType[]).map((track) => {
            const joined = !!status.tracks[track];
            return (
              <Badge 
                key={track}
                variant={joined ? 'default' : 'outline'}
                className={cn(
                  "capitalize",
                  joined && "bg-primary/20 text-primary border-primary/30"
                )}
              >
                {track}
                {joined && <CheckCircle2 className="h-3 w-3 ml-1" />}
              </Badge>
            );
          })}
        </div>

        {/* Next Action */}
        <Button 
          className="w-full group"
          variant={nextAction.urgent ? 'destructive' : 'default'}
          onClick={nextAction.action}
        >
          <nextAction.icon className="mr-2 h-4 w-4" />
          {nextAction.label}
          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Main Championship Page
export default function Championship() {
  // Get refreshed season data with current stage statuses
  const season = getRefreshedSeasonData();
  const userStatus = MOCK_USER_STATUS;
  
  // Get countdown target dynamically
  const nextPhase = getNextPhaseForCountdown(season);
  const activeStage = season.stages.find(s => s.status === 'active');
  const nextStage = season.stages.find(s => s.status === 'upcoming');

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-yellow-500/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />
        
        <div className="relative container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            {/* Badges */}
            <div className="flex items-center justify-center gap-3">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Online Finals
              </Badge>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                🇮🇳 India Only
              </Badge>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
                <span className="text-gradient-electric">CodeLock Championship</span>
                <br />
                <span className="text-yellow-400">India {season.year}</span>
              </h1>
              <p className="text-lg text-muted-foreground mt-3 font-medium">
                {season.subtitle}
              </p>
            </div>

            {/* Countdown */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {nextPhase?.label || 'Championship concluded'}
              </span>
              {nextPhase && <CountdownTimer targetDate={nextPhase.targetDate} />}
            </div>

            {/* Primary CTA */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/championship/my-progress">
                <Button size="lg" className="gap-2 font-display">
                  <Trophy className="h-5 w-5" />
                  Go to My Progress
                </Button>
              </Link>
              <Link to="/championship/standings">
                <Button size="lg" variant="outline" className="gap-2 font-display">
                  <Target className="h-5 w-5" />
                  View Standings
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Track Cards */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-display font-semibold">Choose Your Track</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <TrackCard 
                track="solo" 
                userStatus={userStatus.tracks.solo}
                nextStage={nextStage ? { name: nextStage.name, date: nextStage.startDate } : undefined}
              />
              <TrackCard 
                track="duo" 
                userStatus={userStatus.tracks.duo}
                nextStage={nextStage ? { name: nextStage.name, date: nextStage.startDate } : undefined}
              />
              <TrackCard 
                track="clan" 
                userStatus={userStatus.tracks.clan}
                nextStage={nextStage ? { name: nextStage.name, date: nextStage.startDate } : undefined}
              />
            </div>

            {/* Stage Timeline */}
            <StageTimeline />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <UserStatusPanel />
            <LiveStandingsPreview />

            {/* Hall of Champions CTA */}
            <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-600/5 border-yellow-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="h-6 w-6 text-yellow-400" />
                  <h3 className="font-display font-semibold">Hall of Champions</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  View past champions and their legendary journeys.
                </p>
                <Link to="/hall-of-champions">
                  <Button variant="outline" className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                    Enter Hall <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
