import { Calendar, Clock, Video, Users, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClassSession } from '@/lib/mentorData';
import { format, formatDistanceToNow } from 'date-fns';

interface ClassSessionCardProps {
  session: ClassSession;
  showActions?: boolean;
}

export function ClassSessionCard({ session, showActions = true }: ClassSessionCardProps) {
  const getStatusStyles = () => {
    switch (session.status) {
      case 'live':
        return 'bg-success/20 text-success border-success/50';
      case 'upcoming':
        return 'bg-primary/20 text-primary border-primary/50';
      case 'ended':
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = () => {
    switch (session.status) {
      case 'live':
        return 'LIVE NOW';
      case 'upcoming':
        return 'UPCOMING';
      case 'ended':
        return 'ENDED';
    }
  };

  return (
    <div className={`relative p-4 rounded-xl border transition-all ${
      session.status === 'live' 
        ? 'bg-gradient-to-r from-success/5 to-transparent border-success/30' 
        : session.status === 'upcoming'
        ? 'bg-card border-border hover:border-primary/50'
        : 'bg-muted/30 border-border'
    }`}>
      {/* Live indicator */}
      {session.status === 'live' && (
        <div className="absolute top-3 right-3">
          <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${
          session.status === 'live' 
            ? 'bg-success/20' 
            : session.status === 'upcoming'
            ? 'bg-primary/20'
            : 'bg-muted'
        }`}>
          <Video className={`h-5 w-5 ${
            session.status === 'live' 
              ? 'text-success' 
              : session.status === 'upcoming'
              ? 'text-primary'
              : 'text-muted-foreground'
          }`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={`text-[10px] ${getStatusStyles()}`}>
              {getStatusLabel()}
            </Badge>
          </div>
          
          <h4 className="font-heading font-semibold mb-1">{session.title}</h4>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {session.description}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{format(session.scheduledAt, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{format(session.scheduledAt, 'h:mm a')} · {session.duration} min</span>
            </div>
            {session.status === 'ended' && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{session.attendees} attended</span>
              </div>
            )}
          </div>

          {showActions && session.status !== 'ended' && (
            <Button 
              size="sm" 
              variant={session.status === 'live' ? 'default' : 'outline'}
              className={session.status === 'live' ? 'bg-success hover:bg-success/90' : ''}
              onClick={() => window.open(session.meetLink, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {session.status === 'live' ? 'Join Now' : 'Add to Calendar'}
            </Button>
          )}

          {session.status === 'upcoming' && (
            <p className="text-xs text-primary mt-2">
              Starts {formatDistanceToNow(session.scheduledAt, { addSuffix: true })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
