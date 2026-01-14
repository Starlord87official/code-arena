import { Mail, Clock, CheckCircle, XCircle, User, BookOpen, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMentorInvites, MentorInviteSafe, InviteStatus } from '@/hooks/useMentorInvites';
import { formatDistanceToNow } from 'date-fns';

const expertiseLabels: Record<string, string> = {
  dsa: 'DSA',
  cp: 'Competitive Programming',
  web: 'Web Development',
  system_design: 'System Design',
};

function InviteStatusBadge({ status }: { status: InviteStatus }) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="border-status-warning/50 text-status-warning bg-status-warning/10">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case 'accepted':
      return (
        <Badge variant="outline" className="border-status-success/50 text-status-success bg-status-success/10">
          <CheckCircle className="h-3 w-3 mr-1" />
          Accepted
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant="outline" className="border-destructive/50 text-destructive bg-destructive/10">
          <XCircle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    default:
      return null;
  }
}

function InviteCard({ invite }: { invite: MentorInviteSafe }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">{invite.email_masked || 'Hidden'}</span>
            </div>
            
            {invite.name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <User className="h-3 w-3 flex-shrink-0" />
                <span>{invite.name}</span>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {invite.expertise && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  <span>{expertiseLabels[invite.expertise] || invite.expertise}</span>
                </div>
              )}
              
              {invite.clan_id && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>Clan: {invite.clan_id}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          <InviteStatusBadge status={invite.status} />
        </div>
        
        {invite.accepted_at && (
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
            Accepted {formatDistanceToNow(new Date(invite.accepted_at), { addSuffix: true })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function InvitesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function MentorInvitesList() {
  const { data: invites, isLoading, error } = useMentorInvites();
  
  if (isLoading) {
    return <InvitesSkeleton />;
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load invites. Please try again.
        </CardContent>
      </Card>
    );
  }
  
  if (!invites || invites.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No invites sent yet.</p>
          <p className="text-sm">Use the "Invite Mentor" button to send your first invite.</p>
        </CardContent>
      </Card>
    );
  }
  
  const pendingInvites = invites.filter(i => i.status === 'pending');
  const acceptedInvites = invites.filter(i => i.status === 'accepted');
  const expiredInvites = invites.filter(i => i.status === 'expired');
  
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-status-warning">{pendingInvites.length}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-status-success">{acceptedInvites.length}</p>
            <p className="text-sm text-muted-foreground">Accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-muted-foreground">{expiredInvites.length}</p>
            <p className="text-sm text-muted-foreground">Expired</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Invites List */}
      <div className="space-y-3">
        {invites.map((invite) => (
          <InviteCard key={invite.id} invite={invite} />
        ))}
      </div>
    </div>
  );
}
