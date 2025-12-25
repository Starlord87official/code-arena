import { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useJoinClan, useStudentClan, useClanCooldown } from '@/hooks/useStudentClan';
import { getClanById, getMentorById } from '@/lib/mentorData';
import { AlertTriangle, Clock as ClockIcon } from 'lucide-react';

export default function JoinClan() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clanId = searchParams.get('clan');
  
  const { user, profile, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: existingMembership, isLoading: membershipLoading } = useStudentClan(user?.id);
  const { data: cooldown, isLoading: cooldownLoading } = useClanCooldown(user?.id);
  const joinClan = useJoinClan();
  
  const clan = clanId ? getClanById(clanId) : null;
  const mentor = clan ? getMentorById(clan.mentorId) : null;
  
  const isLoading = authLoading || membershipLoading || cooldownLoading;

  // Store clan ID in session if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated && clanId) {
      sessionStorage.setItem('pending_clan_join', clanId);
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, clanId, navigate]);

  // Check for pending join after auth
  useEffect(() => {
    if (isAuthenticated && !clanId) {
      const pendingClan = sessionStorage.getItem('pending_clan_join');
      if (pendingClan) {
        navigate(`/join-clan?clan=${pendingClan}`);
      }
    }
  }, [isAuthenticated, clanId, navigate]);

  const handleJoin = async () => {
    if (!user || !clanId || !profile?.username) return;
    
    try {
      await joinClan.mutateAsync({
        userId: user.id,
        clanId,
        username: profile.username,
      });
      
      sessionStorage.removeItem('pending_clan_join');
      navigate('/student/dashboard');
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Invalid clan ID
  if (!clan) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Clan Not Found</CardTitle>
            <CardDescription>
              This clan doesn't exist or the link is invalid.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/mentors">
              <Button variant="outline">Browse Clans</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already in a clan
  if (existingMembership) {
    const isSameClan = existingMembership.clan_id === clanId;
    
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-status-warning/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-status-warning" />
            </div>
            <CardTitle>
              {isSameClan ? 'Already a Member' : 'Already in a Clan'}
            </CardTitle>
            <CardDescription>
              {isSameClan 
                ? `You're already a member of ${clan.name}.`
                : 'You can only be a member of one clan at a time. Leave your current clan first to join a new one.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-2">
            <Button onClick={() => navigate('/student/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
            {!isSameClan && (
              <Button variant="outline" className="w-full" onClick={() => navigate(`/clan/${existingMembership.clan_id}`)}>
                View Current Clan
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is in cooldown period
  if (cooldown?.isInCooldown) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-status-warning/10 flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-status-warning" />
            </div>
            <CardTitle>Cooldown Active</CardTitle>
            <CardDescription>
              You recently left a clan. Please wait before joining a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-status-warning/10 border border-status-warning/30">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-status-warning flex-shrink-0" />
                <div>
                  <p className="font-heading font-semibold">
                    {cooldown.remainingDays} days {cooldown.remainingHours} hours remaining
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You can join a new clan after the 7-day cooldown period ends.
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate('/student/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Clan is full
  if (clan.memberCount >= clan.maxMembers) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Clan is Full</CardTitle>
            <CardDescription>
              {clan.name} has reached its maximum capacity of {clan.maxMembers} members.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/mentors">
              <Button variant="outline">Browse Other Clans</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Clan is closed
  if (!clan.isOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-status-warning/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-status-warning" />
            </div>
            <CardTitle>Clan is Invite-Only</CardTitle>
            <CardDescription>
              {clan.name} is currently not accepting new members through public join. 
              Contact the mentor for an invite.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/mentors">
              <Button variant="outline">Browse Open Clans</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show join confirmation
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Join {clan.name}</CardTitle>
          <CardDescription>{clan.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Clan Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <p className="font-display text-xl font-bold">{clan.memberCount}</p>
              <p className="text-sm text-muted-foreground">Members</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <p className="font-display text-xl font-bold">{clan.totalXP.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </div>
          </div>
          
          {/* Mentor Info */}
          {mentor && (
            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-primary-foreground">
                  {mentor.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Mentor</span>
                  </div>
                  <p className="font-heading font-semibold">{mentor.username}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {mentor.teachingFocus.map(focus => (
                  <Badge key={focus} variant="outline" className="text-xs">
                    {focus}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Weekly Focus */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">This Week's Focus</p>
            <p className="font-heading font-semibold">{clan.weeklyFocus}</p>
          </div>
          
          {/* Join Button */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleJoin}
            disabled={joinClan.isPending}
          >
            {joinClan.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Join Clan
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            By joining, you'll be assigned as a student and can participate in classes and battles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
