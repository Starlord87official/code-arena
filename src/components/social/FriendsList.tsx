import { Link } from 'react-router-dom';
import { Users, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFriendRequests, isUserOnline, formatLastSeen } from '@/hooks/useFriendRequests';
import { getDivisionColor } from '@/lib/mockData';

export function FriendsList() {
  const { friends, isLoading } = useFriendRequests();

  if (isLoading) {
    return (
      <div className="arena-card p-6">
        <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
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
    <div className="arena-card p-6">
      <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        Friends
        {friends.length > 0 && (
          <Badge variant="outline" className="ml-2 text-xs">
            {friends.length}
          </Badge>
        )}
      </h2>
      
      {friends.length === 0 ? (
        <div className="py-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No friends yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Send friend requests to connect with other coders
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-80">
          <div className="space-y-3">
            {friends.map((friend) => {
              const online = isUserOnline(friend.last_active);
              const lastSeenText = formatLastSeen(friend.last_active);
              
              return (
                <Link
                  key={friend.id}
                  to={`/profile/${friend.username}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      {friend.avatar_url && <AvatarImage src={friend.avatar_url} />}
                      <AvatarFallback className="bg-card text-sm font-bold">
                        {friend.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Status indicator */}
                    <span 
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${
                        online ? 'bg-status-success' : 'bg-muted-foreground/50'
                      }`}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {friend.username}
                    </p>
                    <div className="flex items-center gap-2">
                      {friend.division && (
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] ${getDivisionColor(friend.division as any)}`}
                        >
                          {friend.division}
                        </Badge>
                      )}
                      <span className={`text-xs ${online ? 'text-status-success' : 'text-muted-foreground'}`}>
                        {lastSeenText}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
