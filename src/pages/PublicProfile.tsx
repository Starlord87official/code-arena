import { useParams, Link } from 'react-router-dom';
import { 
  Zap, Flame, Target, Calendar, Swords, UserPlus, 
  Clock, Check, Loader2, UserCheck, GraduationCap, 
  Briefcase, Crown, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useProfileStats } from '@/hooks/useProfileStats';
import { useAuth } from '@/contexts/AuthContext';
import { useTargets } from '@/hooks/useTargets';
import { getDivisionColor, getDivisionAura, getXpForNextLevel, getXpProgress } from '@/lib/mockData';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useInterviewReadiness } from '@/hooks/useInterviewReadiness';
import { cn } from '@/lib/utils';
import { RadarAttributesChart } from '@/components/profile/RadarAttributesChart';
import { SolveBreakdownCard } from '@/components/profile/SolveBreakdownCard';
import { ProfileActivityHeatmap } from '@/components/profile/ProfileActivityHeatmap';
import { InterviewReadinessCard } from '@/components/profile/InterviewReadinessCard';
import { BattleStatsCard } from '@/components/profile/BattleStatsCard';
import { LevelProgressCard } from '@/components/profile/LevelProgressCard';
import { ProfileFriendsList } from '@/components/profile/ProfileFriendsList';

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { profile, isLoading, error, friendshipStatus, sendFriendRequest, respondToRequest } = usePublicProfile(username);
  const { user, profile: currentUserProfile } = useAuth();
  const { score: readinessScore, band: readinessBand, label: readinessLabel, trend: readinessTrend, breakdown: readinessBreakdown, isLoading: readinessLoading } = useInterviewReadiness();
  const { activity, targets } = useTargets();
  
  // Get profile stats for the viewed user
  const { data: profileStats, isLoading: statsLoading } = useProfileStats(profile?.id);
  
  const isOwnProfile = currentUserProfile?.username?.toLowerCase() === username?.toLowerCase();

  const handleSendFriendRequest = async () => {
    const result = await sendFriendRequest();
    if (result.success) {
      toast.success('Friend request sent!');
    } else {
      toast.error(result.error || 'Failed to send request');
    }
  };

  const handleRespondToRequest = async (accept: boolean) => {
    const result = await respondToRequest(accept);
    if (result.success) {
      toast.success(accept ? 'Friend request accepted!' : 'Friend request declined');
    } else {
      toast.error(result.error || 'Failed to respond');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="arena-card p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <Skeleton className="h-28 w-28 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-6 w-64" />
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error/not found state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="arena-card p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">User Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The user "{username}" doesn't exist or their profile is not available.
            </p>
            <Link to="/leaderboard">
              <Button variant="arena">Browse Leaderboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const division = (profile.division || 'bronze') as 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'legend';
  const level = Math.floor(profile.xp / 500) + 1;
  const xpProgress = getXpProgress(profile.xp, level);
  const xpToNextLevel = getXpForNextLevel(level) - (profile.xp % 500);
  const winRate = profile.battles_played > 0 
    ? Math.round((profile.battles_won / profile.battles_played) * 100) 
    : 0;

  const renderFriendButton = () => {
    if (!user) {
      return (
        <Link to="/auth">
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Login to Connect
          </Button>
        </Link>
      );
    }

    if (isOwnProfile) {
      return (
        <Link to="/settings">
          <Button variant="outline" size="sm">Edit Profile</Button>
        </Link>
      );
    }

    switch (friendshipStatus.status) {
      case 'friends':
        return (
          <Button variant="outline" size="sm" disabled className="cursor-default">
            <UserCheck className="h-4 w-4 mr-2" />
            Friends
          </Button>
        );
      case 'pending_sent':
        return (
          <Button variant="outline" size="sm" disabled className="cursor-default">
            <Clock className="h-4 w-4 mr-2" />
            Request Pending
          </Button>
        );
      case 'pending_received':
        return (
          <div className="flex gap-2">
            <Button variant="arena" size="sm" onClick={() => handleRespondToRequest(true)}>
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleRespondToRequest(false)}>
              Decline
            </Button>
          </div>
        );
      default:
        return (
          <Button variant="arena" size="sm" onClick={handleSendFriendRequest}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ===== SECTION 1: PROFILE HEADER ===== */}
        <div className={cn("arena-card p-6", getDivisionAura(division))}>
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className={cn(
                "h-28 w-28 border-4 ring-4 ring-current/20",
                getDivisionColor(division).replace('text-', 'border-')
              )}>
                {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.username} />}
                <AvatarFallback className="bg-card text-3xl font-display font-bold text-foreground">
                  {profile.username?.slice(0, 2).toUpperCase() || '??'}
                </AvatarFallback>
              </Avatar>
              {/* Division badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <Badge className={cn(
                  "border border-current/30 bg-current/20 uppercase font-bold text-xs px-2.5",
                  getDivisionColor(division)
                )}>
                  {division}
                </Badge>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left space-y-3">
              {/* Username + Level + Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <h1 className="font-display text-3xl font-bold text-foreground">{profile.username}</h1>
                <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 font-display">
                  LV. {level}
                </Badge>
                {/* Champion badges - only show if earned */}
                {profile.battles_won >= 10 && (
                  <Badge className="bg-status-warning/20 text-status-warning border-status-warning/30">
                    <Crown className="h-3 w-3 mr-1" />
                    Champion
                  </Badge>
                )}
                {profileStats && profileStats.currentStreak >= 30 && (
                  <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                    <Award className="h-3 w-3 mr-1" />
                    Dedicated
                  </Badge>
                )}
              </div>
              
              {/* Occupation */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground">
                {profile.occupation_type === 'working' ? (
                  <>
                    <Briefcase className="h-4 w-4" />
                    <span>Working Professional</span>
                    {profile.years_of_experience && (
                      <span className="text-primary">• {profile.years_of_experience} years exp.</span>
                    )}
                  </>
                ) : profile.college_name ? (
                  <>
                    <GraduationCap className="h-4 w-4" />
                    <span>{profile.college_name}</span>
                    {profile.college_year && (
                      <span className="text-primary">• {profile.college_year}</span>
                    )}
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-4 w-4" />
                    <span>Student</span>
                  </>
                )}
              </div>

              {/* Joined date */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined {format(new Date(profile.joined_at), 'MMMM yyyy')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              {renderFriendButton()}
              {!isOwnProfile && user && (
                <Link to="/battle">
                  <Button variant="outline" size="sm" className="w-full">
                    <Swords className="h-4 w-4 mr-2" />
                    Challenge to Duel
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ===== SECTION 2: CORE STATS ROW ===== */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="arena-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div className="font-display font-bold text-2xl text-primary">{profile.xp.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total XP</div>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Flame className="h-4 w-4 text-status-warning" />
            </div>
            <div className="font-display font-bold text-2xl text-status-warning">{profile.streak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Target className="h-4 w-4 text-status-success" />
            </div>
            <div className="font-display font-bold text-2xl text-status-success">{profileStats?.totalProblems || 0}</div>
            <div className="text-xs text-muted-foreground">Problems Solved</div>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Swords className="h-4 w-4 text-accent" />
            </div>
            <div className="font-display font-bold text-2xl text-accent">{profile.battles_played}</div>
            <div className="text-xs text-muted-foreground">Battles Played</div>
          </div>
          <div className="arena-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Award className="h-4 w-4 text-foreground" />
            </div>
            <div className={cn(
              "font-display font-bold text-2xl",
              winRate >= 50 ? "text-status-success" : "text-foreground"
            )}>
              {winRate}%
            </div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
        </div>

        {/* ===== MAIN CONTENT GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* SECTION 3: Training Attributes Radar */}
            {statsLoading ? (
              <Skeleton className="h-[400px]" />
            ) : (
              <RadarAttributesChart 
                attributes={profileStats?.trainingAttributes || {
                  attack: 0,
                  defense: 0,
                  vision: 0,
                  stamina: 0,
                  adaptability: 0,
                  clutch: 0,
                }} 
              />
            )}

            {/* SECTION 6: Interview Readiness (own profile only) */}
            {isOwnProfile && (
              <InterviewReadinessCard
                score={readinessScore}
                band={readinessBand}
                label={readinessLabel}
                trend={readinessTrend}
                breakdown={readinessBreakdown}
                isLoading={readinessLoading}
              />
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SECTION 4: Solve Statistics */}
            {statsLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <SolveBreakdownCard 
                breakdown={profileStats?.solveBreakdown || { total: 0, easy: 0, medium: 0, hard: 0, extreme: 0 }}
                totalProblems={profileStats?.totalProblems || 0}
                uniqueTopics={profileStats?.uniqueTopics || 0}
              />
            )}

            {/* SECTION 5: Activity Heatmap */}
            {isOwnProfile && (
              <ProfileActivityHeatmap 
                activity={activity}
                currentStreak={profileStats?.currentStreak || 0}
                activeDaysLast30={profileStats?.activeDaysLast30 || 0}
                dailyTarget={targets?.daily || 3}
              />
            )}

            {/* SECTION 7: Battle Statistics */}
            <BattleStatsCard 
              stats={{
                played: profileStats?.battleStats.played || profile.battles_played,
                won: profileStats?.battleStats.won || profile.battles_won,
                winRate: profileStats?.battleStats.winRate || winRate,
                elo: profileStats?.battleStats.elo || 1000,
              }}
            />

            {/* SECTION 8: Level Progress */}
            <LevelProgressCard
              level={level}
              xp={profile.xp}
              xpProgress={xpProgress}
              xpToNextLevel={xpToNextLevel}
            />
          </div>
        </div>

        {/* ===== SECTION 9: FRIENDS (own profile only) ===== */}
        {isOwnProfile && (
          <ProfileFriendsList />
        )}
      </div>
    </div>
  );
}
