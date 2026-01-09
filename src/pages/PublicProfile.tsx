import { useParams, Link } from 'react-router-dom';
import { 
  Trophy, Zap, Flame, Target, Calendar, TrendingUp, 
  Swords, UserPlus, Clock, Check, Loader2, UserCheck,
  GraduationCap, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useAuth } from '@/contexts/AuthContext';
import { getDivisionColor, getDivisionAura, getXpForNextLevel, getXpProgress } from '@/lib/mockData';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useInterviewReadiness, getBandConfig } from '@/hooks/useInterviewReadiness';
import { cn } from '@/lib/utils';

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const { profile, isLoading, error, friendshipStatus, sendFriendRequest, respondToRequest } = usePublicProfile(username);
  const { user, profile: currentUserProfile } = useAuth();
  const { score: readinessScore, band: readinessBand, label: readinessLabel, isLoading: readinessLoading } = useInterviewReadiness();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="arena-card p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-6 w-64" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
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
  const winRate = profile.battles_played > 0 
    ? Math.round((profile.battles_won / profile.battles_played) * 100) 
    : 0;

  const isOwnProfile = currentUserProfile?.username?.toLowerCase() === username?.toLowerCase();

  const renderFriendButton = () => {
    if (!user) {
      return (
        <Link to="/auth">
          <Button variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Login to Connect
          </Button>
        </Link>
      );
    }

    if (isOwnProfile) {
      return (
        <Link to="/settings">
          <Button variant="outline">Edit Profile</Button>
        </Link>
      );
    }

    switch (friendshipStatus.status) {
      case 'friends':
        return (
          <Button variant="outline" disabled className="cursor-default">
            <UserCheck className="h-4 w-4 mr-2" />
            Friends
          </Button>
        );
      case 'pending_sent':
        return (
          <Button variant="outline" disabled className="cursor-default">
            <Clock className="h-4 w-4 mr-2" />
            Request Pending
          </Button>
        );
      case 'pending_received':
        return (
          <div className="flex gap-2">
            <Button variant="arena" onClick={() => handleRespondToRequest(true)}>
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button variant="outline" onClick={() => handleRespondToRequest(false)}>
              Decline
            </Button>
          </div>
        );
      default:
        return (
          <Button variant="arena" onClick={handleSendFriendRequest}>
            <UserPlus className="h-4 w-4 mr-2" />
            Send Friend Request
          </Button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className={`arena-card p-8 ${getDivisionAura(division)}`}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar Section */}
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-current opacity-20 rounded-full ${getDivisionColor(division)}`} />
              <Avatar className={`h-32 w-32 border-4 ${getDivisionColor(division).replace('text-', 'border-')} ring-4 ring-current/20`}>
                {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.username} />}
                <AvatarFallback className="bg-card text-4xl font-display font-bold text-foreground">
                  {profile.username?.slice(0, 2).toUpperCase() || '??'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <Badge className={`${getDivisionColor(division)} border border-current/30 bg-current/20 uppercase font-bold px-3`}>
                  {division}
                </Badge>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="font-display text-4xl font-bold text-foreground">{profile.username}</h1>
                <Badge variant="outline" className="text-primary border-primary">
                  Lv. {level}
                </Badge>
              </div>
              
              {/* Occupation Info */}
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-4">
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
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="arena-card p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <Zap className="h-4 w-4" />
                    <span className="font-bold text-xl">{profile.xp.toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Total XP</span>
                </div>
                <div className="arena-card p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-status-warning mb-1">
                    <Flame className="h-4 w-4" />
                    <span className="font-bold text-xl">{profile.streak}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Day Streak</span>
                </div>
                <div className="arena-card p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-status-success mb-1">
                    <Swords className="h-4 w-4" />
                    <span className="font-bold text-xl">{profile.battles_played}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Battles</span>
                </div>
                <div className="arena-card p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-foreground mb-1">
                    <Trophy className="h-4 w-4" />
                    <span className="font-bold text-xl">{winRate}%</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Win Rate</span>
                </div>
              </div>

              {/* Joined Date */}
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {format(new Date(profile.joined_at), 'MMMM d, yyyy')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {renderFriendButton()}
              {!isOwnProfile && user && (
                <Link to="/battle">
                  <Button variant="outline" className="w-full">
                    <Swords className="h-4 w-4 mr-2" />
                    Challenge to Duel
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Interview Readiness */}
          <div className="arena-card p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Interview Readiness
            </h2>
            {readinessLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className={cn("font-display text-4xl font-bold", getBandConfig(readinessBand).color)}>
                    {readinessScore}
                  </span>
                  <span className="text-muted-foreground">/100</span>
                </div>
                <Progress value={readinessScore} className="h-2" />
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    readinessBand === 'strong_candidate' && "bg-primary/10 text-primary border-primary/30",
                    readinessBand === 'interview_ready' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    readinessBand === 'partially_ready' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                    readinessBand === 'weak_foundation' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                    readinessBand === 'not_ready' && "bg-destructive/10 text-destructive border-destructive/30"
                  )}
                >
                  {readinessLabel}
                </Badge>
              </div>
            )}
          </div>

          {/* Level Progress */}
          <div className="arena-card p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Level Progress
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Level {level}</span>
                <span className="text-primary font-medium">{Math.round(xpProgress)}% to Level {level + 1}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {getXpForNextLevel(level) - (profile.xp % 500)} XP to next level
              </p>
            </div>
          </div>

          {/* Battle Stats */}
          <div className="arena-card p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Swords className="h-5 w-5 text-primary" />
              Battle Statistics
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Battles Played</span>
                <span className="text-foreground font-medium">{profile.battles_played}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Battles Won</span>
                <span className="text-status-success font-medium">{profile.battles_won}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Win Rate</span>
                <span className={`font-bold ${winRate >= 50 ? 'text-status-success' : 'text-status-warning'}`}>
                  {winRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
