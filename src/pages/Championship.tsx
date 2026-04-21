import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Crown, Trophy, User, Users, Shield, CheckCircle2,
  ChevronRight, Calendar, Zap, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TRACKS,
  TrackType,
  UserTrackStatus,
  getUserStatusLabel,
  getRefreshedSeasonData,
  getNextPhaseForCountdown,
  UserChampionshipStatus
} from "@/lib/championshipData";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/bl/PageHeader";
import { SectionHeader } from "@/components/bl/SectionHeader";
import { GlassPanel } from "@/components/bl/GlassPanel";

// Default empty user status
const EMPTY_USER_STATUS: UserChampionshipStatus = {
  seasonId: 'india-2026',
  verificationLane: 'open',
  phoneVerified: false,
  tracks: {}
};

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
          <div className="bl-glass rounded-lg px-3 py-2 min-w-[56px]">
            <span className="font-mono text-xl font-bold text-neon">
              {value.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono text-text-mute mt-1 block tracking-wider">
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

// Track Card
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
  const isElite = track === 'clan';

  const statusColors: Record<UserTrackStatus, string> = {
    not_registered: 'text-text-mute',
    registered: 'text-neon',
    qualified: 'text-green-400',
    eliminated: 'text-destructive',
    finalist: 'text-purple-400',
    champion: 'text-gold'
  };

  const getCTA = () => {
    if (!userStatus || userStatus.status === 'not_registered') {
      return { label: 'Register Now', action: () => navigate(`/championship/register/${track}`) };
    }
    if (userStatus.status === 'eliminated') {
      return { label: 'View Results', action: () => navigate('/championship/my-progress') };
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
      <GlassPanel
        padding="md"
        corners
        sideStripe={isElite ? 'ember' : false}
        className="group transition-all duration-300 hover:-translate-y-0.5 hover:border-neon/40"
      >
        {/* subtle 1px top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-70"
          style={{ background: trackInfo.accentColor }}
        />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="p-2.5 rounded-lg flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${trackInfo.accentColor}20, ${trackInfo.accentColor}10)`,
                boxShadow: `0 0 20px ${trackInfo.accentColor}20`
              }}
            >
              <TrackIcon className="h-5 w-5" style={{ color: trackInfo.accentColor }} />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-lg text-text leading-tight">{trackInfo.title}</h3>
              <p className="text-xs text-text-dim mt-0.5">{trackInfo.description}</p>
            </div>
          </div>
          {isElite && (
            <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px] font-mono flex-shrink-0">
              ELITE PATH
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          {/* Prize */}
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-gold">{trackInfo.prize}</span>
          </div>

          {/* User Status */}
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
            <span className="text-xs text-text-mute">Your Status</span>
            <span className={cn("text-sm font-semibold", statusColors[userStatus?.status || 'not_registered'])}>
              {getUserStatusLabel(userStatus?.status || 'not_registered')}
              {userStatus?.rank && <span className="font-mono"> (#{userStatus.rank})</span>}
            </span>
          </div>

          {/* Duo Partner */}
          {track === 'duo' && userStatus?.partner && (
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-secondary/30">
              <Users className="h-3.5 w-3.5 text-text-mute" />
              <span className="text-xs text-text-mute">Partner:</span>
              <span className="text-sm font-medium text-text">{userStatus.partner.username}</span>
            </div>
          )}

          {/* Next Stage */}
          {nextStage && (
            <div className="flex items-center gap-2 text-xs text-text-dim">
              <Calendar className="h-3.5 w-3.5" />
              <span>Next: {nextStage.name}</span>
              <span className="text-neon font-mono">
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

          {/* CTA */}
          <Button
            className="w-full group/btn"
            variant={userStatus?.status === 'not_registered' ? 'default' : 'outline'}
            onClick={cta.action}
          >
            {cta.label}
            <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </GlassPanel>
    </motion.div>
  );
}

// Stage Timeline
function StageTimeline() {
  const season = getRefreshedSeasonData();
  const stages = season.stages;

  return (
    <GlassPanel padding="md">
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-line/40" />

        <div className="space-y-4">
          {stages.map((stage, index) => {
            const isActive = stage.status === 'active';
            const isCompleted = stage.status === 'completed';

            return (
              <div key={stage.id} className="relative flex gap-4 items-start">
                <div
                  className={cn(
                    "relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    isCompleted && "bg-green-500/20 text-green-400",
                    isActive && "bg-neon/20 text-neon ring-2 ring-neon animate-pulse",
                    !isCompleted && !isActive && "bg-secondary text-text-mute"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isActive ? (
                    <Zap className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-mono font-bold">{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 pb-4 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-display text-sm text-text",
                      isActive && "text-neon",
                      isCompleted && "text-green-400"
                    )}>
                      {stage.name}
                    </span>
                    {isActive && (
                      <Badge className="bg-neon/20 text-neon border-neon/30 text-[10px] font-mono animate-pulse">
                        LIVE
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs font-mono text-text-mute mt-0.5">
                    {new Date(stage.startDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      timeZone: 'Asia/Kolkata'
                    })}
                  </p>
                  <p className="text-xs text-text-dim mt-1">{stage.format}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}

// Live Standings Empty
function LiveStandingsPreview() {
  return (
    <GlassPanel padding="md">
      <div className="text-center py-6">
        <Trophy className="h-10 w-10 mx-auto text-text-mute/40 mb-3" />
        <p className="text-sm text-text-dim">
          Standings will appear once competitions begin.
        </p>
        <Link to="/championship/standings">
          <Button variant="ghost" size="sm" className="text-xs mt-3">
            View All <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>
    </GlassPanel>
  );
}

// User Status Panel
function UserStatusPanel() {
  const navigate = useNavigate();

  return (
    <GlassPanel padding="md" className="space-y-4">
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-text-mute" />
          <span className="text-sm text-text">Open Lane</span>
        </div>
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-mono text-[10px]">
          PENDING
        </Badge>
      </div>

      <div className="flex gap-2">
        {(['solo', 'duo', 'clan'] as TrackType[]).map((track) => (
          <Badge key={track} variant="outline" className="capitalize font-mono text-[10px]">
            {track}
          </Badge>
        ))}
      </div>

      <Button
        className="w-full group"
        variant="default"
        onClick={() => navigate('/challenges')}
      >
        <Target className="mr-2 h-4 w-4" />
        Start Practice Set
        <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </GlassPanel>
  );
}

// Main Page
export default function Championship() {
  const season = getRefreshedSeasonData();
  const userStatus = EMPTY_USER_STATUS;

  const nextPhase = getNextPhaseForCountdown(season);
  const nextStage = season.stages.find(s => s.status === 'upcoming');

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto max-w-7xl px-4 pt-6 space-y-8">
        <PageHeader
          sector="010"
          tag={`CHAMPIONSHIP_${season.year}`}
          title={<><span className="text-neon text-glow">CodeLock Championship</span> <span className="text-gold">India {season.year}</span></>}
          subtitle={season.subtitle}
          right={
            <div className="flex items-center gap-2">
              <Badge className="bg-neon/20 text-neon border-neon/30 font-mono">Online Finals</Badge>
              <Badge className="bg-gold/20 text-gold border-gold/30 font-mono">🇮🇳 India Only</Badge>
            </div>
          }
        />

        {/* Hero countdown panel */}
        <GlassPanel strong corners sideStripe padding="lg">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
          >
            <div className="flex flex-col items-start gap-3">
              <span className="font-mono text-[11px] text-neon/70 tracking-wider">
                [ {nextPhase?.label?.toUpperCase() || 'CHAMPIONSHIP CONCLUDED'} ]
              </span>
              {nextPhase && <CountdownTimer targetDate={nextPhase.targetDate} />}
            </div>

            <div className="flex flex-wrap gap-3">
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
        </GlassPanel>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Main */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <SectionHeader tag="TRACKS" />
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
            </div>

            <div>
              <SectionHeader tag="SELECTION PATH" />
              <StageTimeline />
            </div>
          </div>

          {/* Right rail */}
          <div className="space-y-8">
            <div>
              <SectionHeader tag="MY STATUS" />
              <UserStatusPanel />
            </div>

            <div>
              <SectionHeader tag="LIVE STANDINGS" />
              <LiveStandingsPreview />
            </div>

            <div>
              <SectionHeader tag="HALL OF CHAMPIONS" />
              <GlassPanel padding="md" className="bg-gradient-to-br from-gold/10 to-amber-600/5 border-gold/20">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="h-6 w-6 text-gold" />
                  <h3 className="font-display text-text">Past Champions</h3>
                </div>
                <p className="text-sm text-text-dim mb-4">
                  View past champions and their legendary journeys.
                </p>
                <Link to="/hall-of-champions">
                  <Button variant="outline" className="w-full border-gold/30 text-gold hover:bg-gold/10">
                    Enter Hall <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </GlassPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
