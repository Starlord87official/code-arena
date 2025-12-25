import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Trophy,
  TrendingUp, 
  Video,
  Clock,
  Swords,
  Shield,
  BookOpen,
  Target,
  Flame,
  ChevronRight,
  GraduationCap,
  Loader2,
  Megaphone,
  Pin,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentClan, useClanCooldown, useLeaveClan } from '@/hooks/useStudentClan';
import { useUserRole } from '@/hooks/useUserRole';
import { useClanAnnouncements } from '@/hooks/useClanAnnouncements';
import { 
  getClanById, 
  getMentorById,
  getClanSessions,
  mockClans
} from '@/lib/mentorData';
import { useAllBattleHistory } from '@/hooks/useBattleHistory';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  
  // Get student's clan membership
  const { data: membership, isLoading: membershipLoading } = useStudentClan(user?.id);
  
  // Get cooldown status
  const { data: cooldown, isLoading: cooldownLoading } = useClanCooldown(user?.id);
  
  // Leave clan mutation
  const leaveClan = useLeaveClan();
  
  // Get user role - single source of truth
  const { isMentor, isLoading: roleLoading } = useUserRole(user?.id);
  
  // Get battle history
  const { data: battles } = useAllBattleHistory();
  
  const isLoading = authLoading || membershipLoading || roleLoading || cooldownLoading;
  
  // Get clan and mentor info
  const clan = membership ? getClanById(membership.clan_id) : null;
  const mentor = clan ? getMentorById(clan.mentorId) : null;
  const upcomingSessions = clan ? getClanSessions(clan.id).filter(s => s.status === 'upcoming' || s.status === 'live') : [];
  
  // Get clan announcements (only for students in a clan)
  const { data: announcements } = useClanAnnouncements(membership?.clan_id || '');
  
  // Calculate battle stats
  const battleStats = {
    participated: battles?.length || 0,
    wins: battles?.filter(b => b.winner === membership?.clan_id).length || 0,
    totalXp: battles?.reduce((acc, b) => acc + b.xp_change, 0) || 0,
  };
  
  const handleLeaveClan = async () => {
    if (!membership || !user) return;
    
    await leaveClan.mutateAsync({
      memberId: membership.id,
      userId: user.id,
      clanId: membership.clan_id,
    });
    
    setShowLeaveDialog(false);
  };

  // CRITICAL: Show loading FIRST - prevents mentor UI flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Access control - strictly redirect mentors to mentor dashboard (no UI shown)
  if (isMentor) {
    navigate('/mentor-dashboard', { replace: true });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not in a clan yet
  if (!membership) {
    return (
      <div className="min-h-screen pb-16">
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">Join a Clan to Get Started</h1>
              <p className="text-muted-foreground mb-8">
                Join a clan to access classes, participate in battles, and learn from experienced mentors.
              </p>
              
              {/* Cooldown Warning */}
              {cooldown?.isInCooldown && (
                <Card className="mb-8 border-status-warning/50 bg-status-warning/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-status-warning flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-heading font-semibold text-status-warning">
                          Cooldown Active
                        </p>
                        <p className="text-sm text-muted-foreground">
                          You recently left a clan. You can join a new clan in{' '}
                          <span className="font-semibold text-foreground">
                            {cooldown.remainingDays} days {cooldown.remainingHours} hours
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="grid gap-4">
                {mockClans.filter(c => c.isOpen).slice(0, 3).map(c => {
                  const m = getMentorById(c.mentorId);
                  return (
                    <Card key={c.id} className="text-left hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-heading font-semibold">{c.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Mentor: {m?.username} • {c.memberCount}/{c.maxMembers} members
                            </p>
                          </div>
                          <Link to={`/clan/${c.id}`}>
                            <Button size="sm" disabled={cooldown?.isInCooldown}>
                              View Clan
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <p className="text-sm text-muted-foreground mt-6">
                Or ask a mentor to send you an invite link
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    <BookOpen className="h-3 w-3 mr-1" />
                    STUDENT DASHBOARD
                  </Badge>
                </div>
                <h1 className="font-display text-3xl font-bold">
                  Welcome back, {profile?.username || membership.username}!
                </h1>
                <p className="text-muted-foreground">Track your progress and stay on top of your learning</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border">
                  <Flame className="h-5 w-5 text-status-warning" />
                  <span className="font-display text-lg font-bold text-status-warning">
                    {profile?.streak || membership.streak} day streak
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total XP</p>
                  <p className="font-display text-2xl font-bold text-primary">
                    {(profile?.xp || membership.xp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="h-6 w-6 text-status-warning mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold">{battleStats.wins}</p>
                  <p className="text-sm text-muted-foreground">Battle Wins</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Swords className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold">{battleStats.participated}</p>
                  <p className="text-sm text-muted-foreground">Battles Joined</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-status-success mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold">+{battleStats.totalXp}</p>
                  <p className="text-sm text-muted-foreground">XP from Battles</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-6 w-6 text-accent mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold uppercase">
                    {profile?.division || 'Bronze'}
                  </p>
                  <p className="text-sm text-muted-foreground">Current Division</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Clan & Mentor */}
              <div className="lg:col-span-2 space-y-6">
                {/* Clan Info */}
                {clan && (
                  <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            {clan.name}
                          </CardTitle>
                          <CardDescription>{clan.description}</CardDescription>
                        </div>
                        <Link to={`/clan/${clan.id}`}>
                          <Button variant="outline" size="sm">
                            View Clan
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <p className="text-sm text-muted-foreground">Weekly Focus</p>
                          <p className="font-heading font-semibold">{clan.weeklyFocus}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50">
                          <p className="text-sm text-muted-foreground">Members</p>
                          <p className="font-heading font-semibold">{clan.memberCount}/{clan.maxMembers}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Mentor Info */}
                {mentor && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Your Mentor
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-primary-foreground text-lg">
                          {mentor.avatar}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold">{mentor.username}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {mentor.teachingFocus.map(focus => (
                              <Badge key={focus} variant="outline" className="text-xs">
                                {focus}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{mentor.bio}</p>
                        </div>
                        <Link to={`/mentor/${mentor.id}`}>
                          <Button variant="ghost" size="sm">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Weekly Goal Progress</span>
                        <span className="text-sm text-muted-foreground">3/5 problems</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Division Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {profile?.xp || 0} / 5000 XP to next division
                        </span>
                      </div>
                      <Progress value={((profile?.xp || 0) / 5000) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Clan Announcements (Read-only) */}
                {announcements && announcements.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-primary" />
                        Clan Announcements
                      </CardTitle>
                      <CardDescription>Latest updates from your mentor</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {announcements.slice(0, 3).map((announcement) => (
                        <div
                          key={announcement.id}
                          className={`p-4 rounded-lg border ${
                            announcement.is_pinned 
                              ? 'bg-gradient-to-r from-primary/10 to-transparent border-primary/30' 
                              : 'bg-secondary/30 border-border'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {announcement.is_pinned && (
                              <Badge variant="outline" className="text-primary border-primary text-[10px]">
                                <Pin className="h-3 w-3 mr-1" />
                                PINNED
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <h4 className="font-heading font-semibold text-sm mb-1">{announcement.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {announcement.content}
                          </p>
                        </div>
                      ))}
                      {announcements.length > 3 && (
                        <Link to={`/clan/${membership?.clan_id}?tab=overview`}>
                          <Button variant="ghost" size="sm" className="w-full">
                            View All Announcements
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Upcoming Classes */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-primary" />
                      Upcoming Classes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingSessions.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No upcoming classes scheduled
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {upcomingSessions.map(session => (
                          <div key={session.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-heading font-semibold text-sm">{session.title}</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {new Date(session.scheduledAt).toLocaleDateString()} at{' '}
                                    {new Date(session.scheduledAt).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>{session.duration} min</span>
                                </div>
                              </div>
                              {session.status === 'live' && (
                                <Badge className="bg-status-error/20 text-status-error border-status-error/50">
                                  LIVE
                                </Badge>
                              )}
                            </div>
                            {session.status === 'live' && (
                              <Button size="sm" className="w-full mt-3" asChild>
                                <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                                  Join Now
                                </a>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link to="/challenges" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Swords className="h-4 w-4" />
                        Practice Challenges
                      </Button>
                    </Link>
                    <Link to="/battles" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Trophy className="h-4 w-4" />
                        View Battle History
                      </Button>
                    </Link>
                    <Link to="/leaderboard" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Leaderboard
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setShowLeaveDialog(true)}
                    >
                      <LogOut className="h-4 w-4" />
                      Leave Clan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Leave Clan Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Leave {clan?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to leave this clan?</p>
              <p className="font-semibold text-foreground">
                You will not be able to join any clan for 7 days after leaving.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveClan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={leaveClan.isPending}
            >
              {leaveClan.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Leaving...
                </>
              ) : (
                'Leave Clan'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
