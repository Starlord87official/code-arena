import { Flame, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClanMember, getClanMembers } from '@/lib/mentorData';
import { formatDistanceToNow } from 'date-fns';

interface ClanMemberListProps {
  clanId: string;
  maxHeight?: string;
}

export function ClanMemberList({ clanId, maxHeight = '400px' }: ClanMemberListProps) {
  const members = getClanMembers(clanId);
  const sortedMembers = [...members].sort((a, b) => b.xp - a.xp);

  const getActivityStatus = (lastActive: Date) => {
    const diffMinutes = (Date.now() - lastActive.getTime()) / (1000 * 60);
    if (diffMinutes < 5) return { label: 'Online', color: 'bg-success' };
    if (diffMinutes < 60) return { label: 'Active', color: 'bg-primary' };
    return { label: 'Away', color: 'bg-muted-foreground' };
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold">Members</h3>
          <Badge variant="outline" className="text-xs">
            {members.length} total
          </Badge>
        </div>
      </div>

      <ScrollArea style={{ maxHeight }}>
        <div className="p-2">
          {sortedMembers.map((member, index) => {
            const activity = getActivityStatus(member.lastActive);
            return (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                {/* Rank */}
                <div className={`w-6 text-center font-display font-bold text-sm ${
                  index === 0 ? 'text-status-warning' :
                  index === 1 ? 'text-muted-foreground' :
                  index === 2 ? 'text-orange-400' :
                  'text-muted-foreground'
                }`}>
                  #{index + 1}
                </div>

                {/* Avatar */}
                <div className="relative">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center font-display font-bold text-sm">
                    {member.avatar}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${activity.color}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-sm truncate">{member.username}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(member.lastActive, { addSuffix: true })}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="font-display font-bold text-sm text-primary">
                      {member.xp.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 justify-end text-xs">
                    <Flame className="h-3 w-3 text-status-warning" />
                    <span className="text-status-warning font-semibold">{member.streak}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
