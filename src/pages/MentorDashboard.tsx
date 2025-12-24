import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Megaphone, 
  TrendingUp, 
  Video,
  Plus,
  Clock,
  Eye,
  Swords,
  BarChart3,
  Shield,
  Crown,
  UserPlus,
  Send,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ClassSessionCard } from '@/components/clan/ClassSessionCard';
import { ClanMemberList } from '@/components/clan/ClanMemberList';
import { MentorBattleControls } from '@/components/mentor/MentorBattleControls';
import { ClanPerformanceStats } from '@/components/mentor/ClanPerformanceStats';
import { AnnouncementManager } from '@/components/mentor/AnnouncementManager';
import { InviteMentorModal } from '@/components/mentor/InviteMentorModal';
import { MentorInvitesList } from '@/components/mentor/MentorInvitesList';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMentorAnywhere } from '@/hooks/useUserRole';
import { 
  mockMentors, 
  getClanByMentorId, 
  getClanSessions,
  getClanMembers 
} from '@/lib/mentorData';
import { useToast } from '@/hooks/use-toast';

// Mock: assume current user is the first mentor (in production, this would come from auth)
const currentMentor = mockMentors[0];
const currentClan = getClanByMentorId(currentMentor.id);

export default function MentorDashboard() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Check if user is a mentor in any clan
  const { isMentor, isLoading: roleLoading } = useIsMentorAnywhere(user?.id);
  
  const isLoading = authLoading || roleLoading;
  
  // Class form state
  const [classTitle, setClassTitle] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [classDate, setClassDate] = useState('');
  const [classTime, setClassTime] = useState('');
  const [classDuration, setClassDuration] = useState('60');
  const [classMeetLink, setClassMeetLink] = useState('');

  const sessions = currentClan ? getClanSessions(currentClan.id) : [];
  const members = currentClan ? getClanMembers(currentClan.id) : [];
  const upcomingSessions = sessions.filter(s => s.status === 'upcoming' || s.status === 'live');

  // Mock attendance data
  const mockAttendance = [
    { sessionTitle: 'Graph Theory Fundamentals', attendees: 38, total: 42, date: '3 days ago' },
    { sessionTitle: 'DP State Optimization', attendees: 35, total: 40, date: '1 week ago' },
    { sessionTitle: 'Weekly Problem Review', attendees: 41, total: 42, date: '2 weeks ago' },
  ];

  const handlePostClass = () => {
    if (!classTitle || !classDate || !classTime || !classMeetLink) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Class Scheduled',
      description: `"${classTitle}" has been scheduled and students will be notified.`,
    });

    // Reset form
    setClassTitle('');
    setClassDescription('');
    setClassDate('');
    setClassTime('');
    setClassDuration('60');
    setClassMeetLink('');
  };

  // Access control - redirect non-mentors
  if (!isLoading && !isMentor && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading while checking roles
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentClan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-2">No Clan Found</h2>
          <p className="text-muted-foreground">You haven't created a clan yet.</p>
        </div>
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
                    <Crown className="h-3 w-3 mr-1" />
                    MENTOR DASHBOARD
                  </Badge>
                  {isMentor && (
                    <Badge className="bg-status-warning/20 text-status-warning border-status-warning/50">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin Access
                    </Badge>
                  )}
                </div>
                <h1 className="font-display text-3xl font-bold">{currentClan.name}</h1>
                <p className="text-muted-foreground">Manage your clan, schedule classes, and track progress</p>
              </div>
              <div className="flex items-center gap-4">
                <InviteMentorModal 
                  clanId={currentClan.id} 
                  clanName={currentClan.name}
                  trigger={
                    <Button variant="default" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Invite Mentor
                    </Button>
                  }
                />
                <Link to={`/clan/${currentClan.id}`}>
                  <Button variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Clan Page
                  </Button>
                </Link>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Clan Members</p>
                  <p className="font-display text-2xl font-bold text-primary">
                    {currentClan.memberCount}/{currentClan.maxMembers}
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8 flex-wrap">
                <TabsTrigger value="overview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="performance" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="classes" className="gap-2">
                  <Video className="h-4 w-4" />
                  Schedule Class
                </TabsTrigger>
                <TabsTrigger value="announcements" className="gap-2">
                  <Megaphone className="h-4 w-4" />
                  Announcements
                </TabsTrigger>
                <TabsTrigger value="members" className="gap-2">
                  <Users className="h-4 w-4" />
                  Members
                </TabsTrigger>
                <TabsTrigger value="attendance" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Attendance
                </TabsTrigger>
                <TabsTrigger value="battles" className="gap-2">
                  <Swords className="h-4 w-4" />
                  Battles
                </TabsTrigger>
                <TabsTrigger value="invites" className="gap-2">
                  <Send className="h-4 w-4" />
                  Invites
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Members</CardDescription>
                      <CardTitle className="text-3xl font-display text-primary">
                        {currentClan.memberCount}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        {currentClan.maxMembers - currentClan.memberCount} spots remaining
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Clan XP</CardDescription>
                      <CardTitle className="text-3xl font-display text-status-success">
                        {currentClan.totalXP.toLocaleString()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1 text-xs text-status-success">
                        <TrendingUp className="h-3 w-3" />
                        <span>+2,340 this week</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Classes Held</CardDescription>
                      <CardTitle className="text-3xl font-display">
                        {currentMentor.totalClasses}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        {upcomingSessions.length} upcoming
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Avg Attendance</CardDescription>
                      <CardTitle className="text-3xl font-display text-status-warning">
                        91%
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">Last 4 weeks</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Upcoming Classes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                      <Video className="h-5 w-5 text-primary" />
                      Upcoming Classes
                    </h3>
                    {upcomingSessions.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                          No upcoming classes. Schedule one now!
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {upcomingSessions.map(session => (
                          <ClassSessionCard key={session.id} session={session} showActions={false} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Recent Activity
                    </h3>
                    <ClanMemberList clanId={currentClan.id} maxHeight="300px" />
                  </div>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Battle Performance Stats
                    </h3>
                    <ClanPerformanceStats clanId={currentClan.id} />
                  </div>
                </div>
              </TabsContent>

              {/* Schedule Class Tab */}
              <TabsContent value="classes">
                <Card className="max-w-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Schedule New Class
                    </CardTitle>
                    <CardDescription>
                      Create a new class session. Students will be notified automatically.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="classTitle">Class Title *</Label>
                      <Input
                        id="classTitle"
                        value={classTitle}
                        onChange={(e) => setClassTitle(e.target.value)}
                        placeholder="e.g., Advanced DP: Bitmask Optimization"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="classDescription">Description</Label>
                      <Textarea
                        id="classDescription"
                        value={classDescription}
                        onChange={(e) => setClassDescription(e.target.value)}
                        placeholder="What will you cover in this class?"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="classDate">Date *</Label>
                        <Input
                          id="classDate"
                          type="date"
                          value={classDate}
                          onChange={(e) => setClassDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="classTime">Time *</Label>
                        <Input
                          id="classTime"
                          type="time"
                          value={classTime}
                          onChange={(e) => setClassTime(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="classDuration">Duration (minutes)</Label>
                        <Input
                          id="classDuration"
                          type="number"
                          value={classDuration}
                          onChange={(e) => setClassDuration(e.target.value)}
                          min="15"
                          max="180"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="classMeetLink">Zoom / Meet Link *</Label>
                        <Input
                          id="classMeetLink"
                          value={classMeetLink}
                          onChange={(e) => setClassMeetLink(e.target.value)}
                          placeholder="https://zoom.us/j/..."
                        />
                      </div>
                    </div>

                    <Button onClick={handlePostClass} className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Class
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Announcements Tab */}
              <TabsContent value="announcements">
                <div className="max-w-2xl">
                  <AnnouncementManager 
                    clanId={currentClan.id} 
                    mentorId={currentMentor.id}
                    isMentor={isMentor}
                  />
                </div>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members">
                <div className="max-w-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-bold text-lg">Clan Members</h3>
                    {isMentor && (
                      <Badge className="bg-status-warning/20 text-status-warning border-status-warning/50">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin View
                      </Badge>
                    )}
                  </div>
                  <ClanMemberList clanId={currentClan.id} maxHeight="600px" />
                </div>
              </TabsContent>

              {/* Attendance Tab */}
              <TabsContent value="attendance">
                <div className="max-w-2xl">
                  <h3 className="font-heading font-bold text-lg mb-4">Recent Class Attendance</h3>
                  <div className="space-y-4">
                    {mockAttendance.map((record, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-heading font-semibold">{record.sessionTitle}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{record.date}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-display text-2xl font-bold text-primary">
                                {Math.round((record.attendees / record.total) * 100)}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {record.attendees}/{record.total} attended
                              </p>
                            </div>
                          </div>
                          {/* Attendance bar */}
                          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${(record.attendees / record.total) * 100}%` }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Battles Tab */}
              <TabsContent value="battles">
                <div className="space-y-6">
                  {isMentor && (
                    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          Mentor Battle Controls
                        </CardTitle>
                        <CardDescription>
                          As a mentor, you can start and schedule clan battles
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <MentorBattleControls clanId={currentClan.id} clanName={currentClan.name} />
                      </CardContent>
                    </Card>
                  )}
                  
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-4">Battle Performance</h3>
                    <ClanPerformanceStats clanId={currentClan.id} />
                  </div>
                </div>
              </TabsContent>

              {/* Invites Tab */}
              <TabsContent value="invites">
                <div className="max-w-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                      <Send className="h-5 w-5 text-primary" />
                      Mentor Invites
                    </h3>
                    <InviteMentorModal 
                      clanId={currentClan.id} 
                      clanName={currentClan.name}
                    />
                  </div>
                  <MentorInvitesList />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  );
}
