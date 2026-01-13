import { useState } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Star, 
  TrendingUp, 
  Target, 
  Calendar,
  MessageCircle,
  Video,
  Crown,
  ChevronRight,
  AlertCircle,
  Swords,
  Trophy,
  UserPlus,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ClanChat } from '@/components/clan/ClanChat';
import { ClanMemberList } from '@/components/clan/ClanMemberList';
import { ClassSessionCard } from '@/components/clan/ClassSessionCard';
import { ClanLeagueBadge } from '@/components/clan/ClanLeagueBadge';
import { BattleHistoryList } from '@/components/clan/BattleHistoryList';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentClan, useJoinClan } from '@/hooks/useStudentClan';
import { useUserClanRole } from '@/hooks/useClanRoles';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  getClanById, 
  getMentorById, 
  getClanSessions,
  getClanAnnouncements,
  getMentorRoleLabel
} from '@/lib/mentorData';
import { mockBattle } from '@/lib/battleData';
import { getBattleHistory } from '@/lib/clanLeagueData';
import { format } from 'date-fns';

export default function ClanHome() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const { user, profile, isAuthenticated } = useAuth();
  const { data: membership, isLoading: membershipLoading } = useStudentClan(user?.id);
  const { data: userRole } = useUserClanRole(user?.id, id || 'global');
  const { isMentor: isCurrentUserMentor, isLoading: roleLoading } = useUserRole(user?.id);
  const joinClan = useJoinClan();
  
  const clan = getClanById(id || '');
  const mentor = clan ? getMentorById(clan.mentorId) : undefined;
  const sessions = clan ? getClanSessions(clan.id) : [];
  const announcements = clan ? getClanAnnouncements(clan.id) : [];
  const battleHistory = clan ? getBattleHistory(clan.id) : [];
  
  const upcomingSessions = sessions.filter(s => s.status === 'upcoming' || s.status === 'live');
  const liveSessions = sessions.filter(s => s.status === 'live');
  
  // Check if this clan is in a live battle
  const isInBattle = clan && (mockBattle.clanA.id === clan.id || mockBattle.clanB.id === clan.id);
  const isBattleLive = mockBattle.status === 'live';
  
  // Check membership status
  const isMember = membership?.clan_id === id;
  const isInAnotherClan = membership !== null && membership?.clan_id !== id;
  // isMentorOfThisClan: user has mentor role in THIS specific clan
  const isMentorOfThisClan = userRole?.role === 'mentor';
  // Students can only join if not already in ANY clan (one-clan-per-student rule)
  const canJoin = clan && clan.isOpen && clan.memberCount < clan.maxMembers && !isMember && !isInAnotherClan && !isMentorOfThisClan;
  
  const handleJoinClan = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('pending_clan_join', id || '');
      navigate('/auth');
      return;
    }
    
    if (!user || !id || !profile?.username) return;
    
    try {
      await joinClan.mutateAsync({
        userId: user.id,
        clanId: id,
        username: profile.username,
      });
      navigate('/student/dashboard');
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!clan || !mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-2">Clan Not Found</h2>
          <p className="text-muted-foreground mb-4">This clan doesn't exist or has been removed.</p>
          <Link to="/mentors">
            <Button>Browse Mentors</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative py-12 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto">
            {/* Live Battle Alert */}
            {isInBattle && isBattleLive && (
              <Link to="/battle/clan-vs-clan">
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-destructive/20 via-primary/10 to-destructive/20 border border-destructive/50 flex items-center gap-4 hover:border-primary transition-colors group cursor-pointer">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <Swords className="h-6 w-6 text-destructive animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-destructive text-destructive-foreground border-0 text-xs animate-pulse">
                        ⚔️ LIVE BATTLE
                      </Badge>
                    </div>
                    <p className="font-heading font-semibold text-foreground">
                      {mockBattle.clanA.name} vs {mockBattle.clanB.name}
                    </p>
                    <p className="text-sm text-muted-foreground">Your clan is fighting! Join the battle now.</p>
                  </div>
                  <Button variant="arena" className="bg-destructive hover:bg-destructive/90 group-hover:scale-105 transition-transform">
                    <Swords className="h-4 w-4 mr-2" />
                    ENTER BATTLE
                  </Button>
                </div>
              </Link>
            )}

            {/* Live Session Alert */}
            {liveSessions.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/30 flex items-center gap-4">
                <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                <div className="flex-1">
                  <p className="font-heading font-semibold text-success">Live Class in Progress</p>
                  <p className="text-sm text-muted-foreground">{liveSessions[0].title}</p>
                </div>
                <Button size="sm" className="bg-success hover:bg-success/90">
                  Join Now
                </Button>
              </div>
            )}

            {/* Clan Header */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    <Users className="h-3 w-3 mr-1" />
                    CLAN
                  </Badge>
                  <ClanLeagueBadge totalXP={clan.totalXP} size="sm" />
                </div>
                <h1 className="font-display text-4xl font-bold mb-3">{clan.name}</h1>
                <p className="text-lg text-muted-foreground mb-6">{clan.description}</p>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-display font-bold text-lg">{clan.memberCount}</span>
                    <span className="text-muted-foreground">/ {clan.maxMembers}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    <span className="font-display font-bold text-lg text-success">
                      {clan.totalXP.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Since {format(clan.createdAt, 'MMM yyyy')}
                    </span>
                  </div>
                </div>
                
                {/* Join / Member Status */}
                <div className="mt-6">
                {isMember ? (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-status-success/20 text-status-success border-status-success/50">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Member
                      </Badge>
                      <Link to="/student/dashboard">
                        <Button variant="outline" size="sm">
                          Go to Dashboard
                        </Button>
                      </Link>
                    </div>
                  ) : isMentorOfThisClan && isCurrentUserMentor ? (
                    <Link to="/mentor-dashboard">
                      <Button>
                        <Crown className="h-4 w-4 mr-2" />
                        Mentor Dashboard
                      </Button>
                    </Link>
                  ) : canJoin ? (
                    <Button onClick={handleJoinClan} disabled={joinClan.isPending}>
                      {joinClan.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Join Clan
                        </>
                      )}
                    </Button>
                  ) : isInAnotherClan ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-muted-foreground">
                        Already in a Clan
                      </Badge>
                      <Link to={`/clan/${membership?.clan_id}`}>
                        <Button variant="outline" size="sm">
                          View Your Clan
                        </Button>
                      </Link>
                    </div>
                  ) : !clan.isOpen ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      Invite Only
                    </Badge>
                  ) : clan.memberCount >= clan.maxMembers ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      Clan Full
                    </Badge>
                  ) : null}
                </div>
              </div>

              {/* Mentor Card - Shows mentor info but NO mentor dashboard button for students */}
              <Link 
                to={`/mentor/${mentor.id}`}
                className="w-full md:w-auto p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display text-2xl font-bold text-primary-foreground">
                    {mentor.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="h-4 w-4 text-status-warning" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Mentor</span>
                    </div>
                    <p className="font-heading font-bold text-lg group-hover:text-primary transition-colors">
                      {mentor.username}
                    </p>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-status-warning fill-current" />
                      <span className="text-sm font-semibold">{mentor.rating}</span>
                      <span className="text-xs text-muted-foreground">
                        {getMentorRoleLabel(mentor.role)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                </div>
                {/* ONLY show Mentor Dashboard button for actual mentors */}
                {isCurrentUserMentor && !roleLoading && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <Link to="/mentor-dashboard" onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Crown className="h-4 w-4" />
                        Mentor Dashboard
                      </Button>
                    </Link>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Focus Banner */}
      <section className="py-6 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">This Week's Focus</p>
                <p className="font-heading font-bold text-lg">{clan.weeklyFocus}</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-10 hidden md:block" />
            <p className="text-sm text-muted-foreground flex-1">{clan.weeklyGoal}</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="overview" className="gap-2">
                  <Target className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="classes" className="gap-2">
                  <Video className="h-4 w-4" />
                  Classes
                </TabsTrigger>
                <TabsTrigger value="members" className="gap-2">
                  <Users className="h-4 w-4" />
                  Members
                </TabsTrigger>
                <TabsTrigger value="battles" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Battles
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Announcements */}
                  <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      Announcements
                    </h3>
                    <div className="space-y-4">
                      {announcements.map(announcement => (
                        <div 
                          key={announcement.id}
                          className={`p-5 rounded-xl border ${
                            announcement.isPinned 
                              ? 'bg-gradient-to-r from-primary/10 to-transparent border-primary/30' 
                              : 'bg-card border-border'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {announcement.isPinned && (
                              <Badge variant="outline" className="text-primary border-primary text-[10px]">
                                PINNED
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(announcement.createdAt, 'MMM d, yyyy')}
                            </span>
                          </div>
                          <h4 className="font-heading font-bold mb-2">{announcement.title}</h4>
                          <p className="text-sm text-muted-foreground">{announcement.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Upcoming Classes Preview */}
                    {upcomingSessions.length > 0 && (
                      <div>
                        <h3 className="font-heading font-bold text-lg flex items-center gap-2 mb-4">
                          <Video className="h-5 w-5 text-primary" />
                          Upcoming Classes
                        </h3>
                        <div className="space-y-4">
                          {upcomingSessions.slice(0, 2).map(session => (
                            <ClassSessionCard key={session.id} session={session} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div>
                    <ClanMemberList clanId={clan.id} maxHeight="500px" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chat">
                <ClanChat clanId={clan.id} />
              </TabsContent>

              <TabsContent value="classes">
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-lg">All Class Sessions</h3>
                  {sessions.length === 0 ? (
                    <p className="text-muted-foreground">No classes scheduled yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {sessions.map(session => (
                        <ClassSessionCard key={session.id} session={session} />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="members">
                <ClanMemberList clanId={clan.id} maxHeight="600px" />
              </TabsContent>

              <TabsContent value="battles">
                <BattleHistoryList clanId={clan.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  );
}
