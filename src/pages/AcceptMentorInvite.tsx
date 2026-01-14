import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Loader2, AlertCircle, CheckCircle2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useInviteByToken, useAcceptMentorInvite } from '@/hooks/useMentorInvites';

export default function AcceptMentorInvite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const { user, isLoading: authLoading } = useAuth();
  const { data: invite, isLoading: inviteLoading, error: inviteError } = useInviteByToken(token);
  const acceptInvite = useAcceptMentorInvite();
  
  const [hasAttemptedAccept, setHasAttemptedAccept] = useState(false);
  const [acceptSuccess, setAcceptSuccess] = useState(false);

  // Store token in sessionStorage for post-auth flow
  useEffect(() => {
    if (token) {
      sessionStorage.setItem('pending_mentor_invite', token);
    }
  }, [token]);

  // Auto-accept when user is authenticated and invite is valid
  useEffect(() => {
    if (
      !authLoading &&
      user &&
      invite &&
      invite.status === 'pending' &&
      !hasAttemptedAccept &&
      !acceptInvite.isPending
    ) {
      handleAcceptInvite();
    }
  }, [user, invite, authLoading, hasAttemptedAccept]);

  const handleAcceptInvite = async () => {
    if (!token || hasAttemptedAccept) return;
    
    setHasAttemptedAccept(true);
    
    try {
      await acceptInvite.mutateAsync(token);
      setAcceptSuccess(true);
      sessionStorage.removeItem('pending_mentor_invite');
      
      // Redirect to mentor dashboard after short delay
      setTimeout(() => {
        navigate('/mentor-dashboard');
      }, 2000);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleLoginRedirect = () => {
    navigate('/auth');
  };

  const isLoading = authLoading || inviteLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Validating invite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>
              This invite link is missing required information.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/')} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invite not found or error
  if (inviteError || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Invalid Invite</CardTitle>
            <CardDescription>
              This invite link is invalid or has expired. Please contact the person who sent you this invite.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/')} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invite already accepted
  if (invite.status === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Already Accepted</CardTitle>
            <CardDescription>
              This invite has already been accepted.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            {user ? (
              <Button onClick={() => navigate('/mentor-dashboard')}>
                Go to Mentor Dashboard
              </Button>
            ) : (
              <Button onClick={handleLoginRedirect}>
                Sign In
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invite expired
  if (invite.status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Invite Expired</CardTitle>
            <CardDescription>
              This invite has expired. Please request a new invite from your administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/')} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (acceptSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-status-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-status-success" />
            </div>
            <CardTitle>Welcome, Mentor!</CardTitle>
            <CardDescription>
              You have successfully joined as a mentor. Redirecting to your dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // User not authenticated - show login prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Mentor Invitation</CardTitle>
            <CardDescription>
              You've been invited to join as a mentor
              {invite.clan_id && ` for a clan`}.
              Please sign in or create an account to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              {invite.name && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invited:</span>
                  <span className="font-medium">{invite.name}</span>
                </div>
              )}
              {invite.expertise && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expertise:</span>
                  <span className="font-medium capitalize">
                    {invite.expertise.replace('_', ' ')}
                  </span>
                </div>
              )}
              {invite.clan_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Clan:</span>
                  <span className="font-medium">{invite.clan_id}</span>
                </div>
              )}
            </div>

            <Button onClick={handleLoginRedirect} className="w-full gap-2">
              <LogIn className="h-4 w-4" />
              Sign In to Accept
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Processing state (accepting invite)
  if (acceptInvite.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Activating your mentor account...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (acceptInvite.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Something Went Wrong</CardTitle>
            <CardDescription>
              {acceptInvite.error instanceof Error 
                ? acceptInvite.error.message 
                : 'Failed to accept invite. Please try again.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <Button 
              onClick={() => {
                setHasAttemptedAccept(false);
                handleAcceptInvite();
              }}
            >
              Try Again
            </Button>
            <Button onClick={() => navigate('/')} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default: Show invite details and accept button
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Accept Mentor Invitation</CardTitle>
          <CardDescription>
            You've been invited to become a mentor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            {invite.name && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{invite.name}</span>
              </div>
            )}
            {invite.expertise && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expertise:</span>
                <span className="font-medium capitalize">
                  {invite.expertise.replace('_', ' ')}
                </span>
              </div>
            )}
            {invite.clan_id && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Clan:</span>
                <span className="font-medium">{invite.clan_id}</span>
              </div>
            )}
          </div>

          <Button 
            onClick={handleAcceptInvite} 
            className="w-full gap-2"
            disabled={acceptInvite.isPending}
          >
            <Shield className="h-4 w-4" />
            Accept & Become Mentor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
