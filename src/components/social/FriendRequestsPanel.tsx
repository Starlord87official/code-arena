import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { getDivisionColor } from '@/lib/mockData';
import { toast } from 'sonner';

export function FriendRequestsPanel() {
  const { incoming, outgoing, incomingCount, respondToRequest, isLoading } = useFriendRequests();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const handleRespond = async (requestId: string, accept: boolean) => {
    setRespondingTo(requestId);
    const result = await respondToRequest(requestId, accept);
    setRespondingTo(null);
    
    if (result.success) {
      toast.success(accept ? 'Friend request accepted!' : 'Friend request declined');
    } else {
      toast.error(result.error || 'Failed to respond');
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Users className="h-5 w-5" />
          {incomingCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
              {incomingCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border">
          <h3 className="font-display font-bold text-foreground">Friend Requests</h3>
        </div>
        
        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : incoming.length === 0 && outgoing.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="p-2 space-y-4">
              {/* Incoming Requests */}
              {incoming.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
                    INCOMING ({incoming.length})
                  </p>
                  <div className="space-y-2">
                    {incoming.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Link to={`/profile/${request.username}`}>
                          <Avatar className="h-10 w-10">
                            {request.avatar_url && <AvatarImage src={request.avatar_url} />}
                            <AvatarFallback className="bg-card text-sm font-bold">
                              {request.username?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/profile/${request.username}`}
                            className="font-medium text-foreground hover:text-primary transition-colors truncate block"
                          >
                            {request.username}
                          </Link>
                          {request.division && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getDivisionColor(request.division as any)}`}
                            >
                              {request.division}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-status-success hover:bg-status-success/20"
                            onClick={() => handleRespond(request.id, true)}
                            disabled={respondingTo === request.id}
                          >
                            {respondingTo === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/20"
                            onClick={() => handleRespond(request.id, false)}
                            disabled={respondingTo === request.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outgoing Requests */}
              {outgoing.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
                    SENT ({outgoing.length})
                  </p>
                  <div className="space-y-2">
                    {outgoing.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Link to={`/profile/${request.username}`}>
                          <Avatar className="h-10 w-10">
                            {request.avatar_url && <AvatarImage src={request.avatar_url} />}
                            <AvatarFallback className="bg-card text-sm font-bold">
                              {request.username?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/profile/${request.username}`}
                            className="font-medium text-foreground hover:text-primary transition-colors truncate block"
                          >
                            {request.username}
                          </Link>
                          <span className="text-xs text-muted-foreground">Pending</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
