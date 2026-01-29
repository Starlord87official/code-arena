import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Crown, Trophy, User, Users, Shield, Clock, CheckCircle2, 
  ChevronRight, Verified, AlertCircle, Calendar, Zap, Target,
  Share2, Download, XCircle, BookOpen, TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarWithFrame } from "@/components/championship/AvatarWithFrame";
import { 
  MOCK_SEASON_2026, 
  MOCK_USER_STATUS, 
  TRACKS,
  FRAMES,
  TrackType,
  UserTrackProgress,
  getUserStatusLabel,
  formatTimeMs
} from "@/lib/championshipData";
import { cn } from "@/lib/utils";

// Track Progress Panel
function TrackProgressPanel({ 
  track, 
  progress 
}: { 
  track: TrackType;
  progress?: UserTrackProgress;
}) {
  const trackInfo = TRACKS[track];
  const TrackIcon = track === 'solo' ? User : track === 'duo' ? Users : Shield;
  
  if (!progress) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardContent className="py-8 text-center">
          <TrackIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-display font-semibold text-lg mb-2">{trackInfo.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">You haven't registered for this track.</p>
          <Button variant="outline">
            Register Now <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isEliminated = progress.status === 'eliminated';
  const isChampion = progress.status === 'champion';
  const isFinalist = progress.status === 'finalist';

  const statusColors = {
    not_registered: 'text-muted-foreground',
    registered: 'text-primary',
    qualified: 'text-green-400',
    eliminated: 'text-destructive',
    finalist: 'text-purple-400',
    champion: 'text-yellow-400'
  };

  return (
    <Card className={cn(
      "bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden",
      isEliminated && "opacity-70",
      isChampion && "ring-2 ring-yellow-500/50"
    )}>
      {/* Track accent */}
      <div 
        className="h-1"
        style={{ background: trackInfo.accentColor }}
      />

      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ 
                background: `${trackInfo.accentColor}20`
              }}
            >
              <TrackIcon className="h-5 w-5" style={{ color: trackInfo.accentColor }} />
            </div>
            <div>
              <CardTitle className="text-lg">{trackInfo.title}</CardTitle>
              {progress.partner && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  with {progress.partner.username}
                </p>
              )}
            </div>
          </div>
          <Badge 
            className={cn(
              "capitalize",
              isEliminated && "bg-destructive/20 text-destructive border-destructive/30",
              progress.status === 'qualified' && "bg-green-500/20 text-green-400 border-green-500/30",
              isFinalist && "bg-purple-500/20 text-purple-400 border-purple-500/30",
              isChampion && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            )}
          >
            {getUserStatusLabel(progress.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Position */}
        {progress.rank && !isEliminated && (
          <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-secondary/30">
            <span className="text-sm text-muted-foreground">Current Rank</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-display font-bold text-primary">
                #{progress.rank}
              </span>
              {progress.score && (
                <span className="text-sm text-muted-foreground">
                  ({progress.score} pts)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Eliminated Message */}
        {isEliminated && (
          <div className="flex items-start gap-3 py-3 px-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <XCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Season Ended</p>
              <p className="text-sm text-muted-foreground mt-1">
                Eliminated at {progress.eliminatedAt ? 
                  new Date(progress.eliminatedAt).toLocaleDateString('en-IN', { 
                    day: 'numeric', month: 'short' 
                  }) : 'Qualifier'
                }
              </p>
            </div>
          </div>
        )}

        {/* Stage Results */}
        {progress.stageResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Stage Results</h4>
            {progress.stageResults.map((result) => (
              <div 
                key={result.stageId}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/20"
              >
                <div className="flex items-center gap-2">
                  {result.qualified ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-sm">{result.stageName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    #{result.rank} of {result.totalParticipants.toLocaleString()}
                  </span>
                  <span className="text-sm font-display font-bold text-primary">
                    {result.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Frames Earned */}
        {progress.framesEarned.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Frames Earned</h4>
            <div className="flex flex-wrap gap-2">
              {progress.framesEarned.map((frameRarity) => {
                const frame = FRAMES[frameRarity];
                return (
                  <Badge 
                    key={frameRarity}
                    variant="outline"
                    style={{
                      borderColor: frame.borderColor,
                      color: frame.borderColor
                    }}
                  >
                    {frame.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {isEliminated ? (
            <>
              <Link to="/hall-of-champions" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Trophy className="mr-2 h-4 w-4" />
                  Hall of Champions
                </Button>
              </Link>
              <Link to="/challenges" className="flex-1">
                <Button className="w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Keep Training
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Button variant="outline" className="flex-1">
                <Share2 className="mr-2 h-4 w-4" />
                Share Progress
              </Button>
              <Link to="/championship/standings" className="flex-1">
                <Button className="w-full">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Standings
                </Button>
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Verification Checklist
function VerificationChecklist() {
  const status = MOCK_USER_STATUS;

  const checks = [
    { id: 'phone', label: 'Phone Verified', completed: status.phoneVerified, required: true },
    { id: 'profile', label: 'Profile Complete', completed: true, required: true },
    { id: 'identity', label: 'ID Verification (Optional)', completed: false, required: false },
  ];

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Verified className="h-5 w-5 text-primary" />
          Integrity Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {checks.map((check) => (
          <div 
            key={check.id}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/20"
          >
            <div className="flex items-center gap-2">
              {check.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
              )}
              <span className="text-sm">{check.label}</span>
              {check.required && !check.completed && (
                <Badge variant="destructive" className="text-[10px]">Required</Badge>
              )}
            </div>
            {!check.completed && check.required && (
              <Button size="sm" variant="outline" className="h-7 text-xs">
                Complete
              </Button>
            )}
          </div>
        ))}

        <div className="pt-3 mt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            {status.verificationLane === 'crown' ? (
              <>
                <Crown className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-yellow-400">Crown Lane Eligible</span>
              </>
            ) : (
              <>
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold text-muted-foreground">Open Lane</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {status.verificationLane === 'crown' 
              ? 'Your results will appear in verified standings.'
              : 'Complete verification to join Crown Lane.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Shareable Progress Card
function ShareableProgressCard() {
  const status = MOCK_USER_STATUS;
  
  return (
    <Card className="bg-gradient-to-br from-primary/10 to-cyan-500/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <AvatarWithFrame
            username="You"
            size="xl"
            frame={status.tracks.solo?.framesEarned[0]}
            showHoverCard={false}
          />
          <h3 className="font-display font-semibold mt-3">Your Championship Card</h3>
          <p className="text-sm text-muted-foreground">Share your progress with the world</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {(['solo', 'duo', 'clan'] as TrackType[]).map((track) => {
            const trackProgress = status.tracks[track];
            return (
              <div 
                key={track}
                className="text-center py-2 px-1 rounded-lg bg-secondary/30"
              >
                <span className="text-[10px] uppercase text-muted-foreground">{track}</span>
                <p className="text-xs font-semibold mt-0.5">
                  {trackProgress ? getUserStatusLabel(trackProgress.status) : 'N/A'}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" size="sm">
            <Download className="mr-2 h-3.5 w-3.5" />
            Download
          </Button>
          <Button className="flex-1" size="sm">
            <Share2 className="mr-2 h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Training Recommendations (for eliminated users)
function TrainingRecommendations() {
  const recommendations = [
    { topic: 'Dynamic Programming', weakness: 'State transitions', problems: 15 },
    { topic: 'Graph Algorithms', weakness: 'BFS/DFS variations', problems: 12 },
    { topic: 'Binary Search', weakness: 'Boundary conditions', problems: 8 },
  ];

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-cyan-400" />
          Training Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Based on your performance, focus on these areas:
        </p>
        {recommendations.map((rec, idx) => (
          <div 
            key={idx}
            className="flex items-center justify-between py-3 px-4 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <div>
              <p className="font-medium text-sm">{rec.topic}</p>
              <p className="text-xs text-muted-foreground">{rec.weakness}</p>
            </div>
            <Badge variant="outline">{rec.problems} problems</Badge>
          </div>
        ))}
        <Link to="/challenges">
          <Button className="w-full mt-2">
            Start Training <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Main My Progress Page
export default function ChampionshipProgress() {
  const [activeTrack, setActiveTrack] = useState<TrackType>('solo');
  const status = MOCK_USER_STATUS;
  const season = MOCK_SEASON_2026;
  
  const nextStage = season.stages.find(s => s.status === 'upcoming');
  const hasEliminated = Object.values(status.tracks).some(t => t?.status === 'eliminated');

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <section className="border-b border-border/50 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link to="/championship" className="hover:text-primary transition-colors">
                  Championship
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span>My Progress</span>
              </div>
              <h1 className="text-3xl font-display font-bold">My Progress</h1>
              <p className="text-muted-foreground mt-1">
                {season.title}
              </p>
            </div>

            {/* Next Stage Countdown */}
            {nextStage && (
              <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-secondary/30">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Next Stage</p>
                  <p className="font-semibold text-primary">{nextStage.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-semibold">
                    {new Date(nextStage.startDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Asia/Kolkata'
                    })} IST
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTrack} onValueChange={(v) => setActiveTrack(v as TrackType)}>
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Track Progress */}
            <div className="lg:col-span-2">
              <TabsContent value="solo" className="mt-0">
                <TrackProgressPanel track="solo" progress={status.tracks.solo} />
              </TabsContent>
              <TabsContent value="duo" className="mt-0">
                <TrackProgressPanel track="duo" progress={status.tracks.duo} />
              </TabsContent>
              <TabsContent value="clan" className="mt-0">
                <TrackProgressPanel track="clan" progress={status.tracks.clan} />
              </TabsContent>

              {/* Training Recommendations (shown if eliminated) */}
              {hasEliminated && (
                <div className="mt-6">
                  <TrainingRecommendations />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <ShareableProgressCard />
              <VerificationChecklist />
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
