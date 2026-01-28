import { Link } from 'react-router-dom';
import { Users, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFriendRequests, isUserOnline, formatLastSeen } from '@/hooks/useFriendRequests';
import { getDivisionColor } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
}

export function ProfileFriendsList({ className }: Props) {
  const { friends, isLoading } = useFriendRequests();

  if (isLoading) {
    return (
      <div className={cn("arena-card p-6", className)}>
        <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Friends
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("arena-card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Friends
        </h2>
        {friends.length > 0 && (
          <Badge variant="outline" className="text-xs border-border">
            {friends.length}
          </Badge>
        )}
      </div>
      
      {friends.length === 0 ? (
        <div className="py-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">No friends yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Visit other profiles to send friend requests
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-80">
          <div className="space-y-2">
            {friends.map((friend) => {
              const online = isUserOnline(friend.last_active);
              const lastSeenText = formatLastSeen(friend.last_active);
              
              return (
                <Link
                  key={friend.id}
                  to={`/profile/${friend.username}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group border border-transparent hover:border-border/50"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-border">
                      {friend.avatar_url && <AvatarImage src={friend.avatar_url} />}
                      <AvatarFallback className="bg-secondary text-sm font-bold">
                        {friend.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <span 
                      className={cn(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card",
                        online ? 'bg-status-success' : 'bg-muted-foreground/50'
                      )}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {friend.username}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {friend.division && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            getDivisionColor(friend.division as any)
                          )}
                        >
                          {friend.division}
                        </Badge>
                      )}
                      <span className={cn(
                        "text-xs",
                        online ? 'text-status-success' : 'text-muted-foreground'
                      )}>
                        {lastSeenText}
                      </span>
                    </div>
                  </div>

                  {/* XP */}
                  {friend.xp > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">XP</p>
                      <p className="text-sm font-medium text-primary">{friend.xp.toLocaleString()}</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
