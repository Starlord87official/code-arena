import { Link } from 'react-router-dom';
import { Users, TrendingUp, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClanRankBadge } from './ClanRankBadge';
import { cn } from '@/lib/utils';

interface ClanCardProps {
  id: string;
  name: string;
  tag: string;
  description: string | null;
  privacy: string;
  max_members: number;
  member_count?: number;
  weekly_xp: number;
  total_xp: number;
  rank_tier: string;
  level: number;
}

export function ClanCard({
  id, name, tag, description, privacy,
  max_members, member_count, weekly_xp, total_xp,
  rank_tier, level,
}: ClanCardProps) {
  return (
    <Link to={`/clans/${id}`} className="block group">
      <div className="arena-card p-5 h-full flex flex-col gap-4 relative overflow-hidden">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-lg font-bold truncate group-hover:text-primary transition-colors">
                {name}
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono border-muted-foreground/30 text-muted-foreground shrink-0">
                [{tag}]
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description || 'No description'}
            </p>
          </div>
          <ClanRankBadge tier={rank_tier} size="sm" showLabel={false} />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-heading font-semibold">{member_count ?? '?'}</span>
            <span className="text-muted-foreground">/ {max_members}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-heading font-semibold text-primary">
              {weekly_xp.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-xs">wk</span>
          </div>
          {privacy === 'private' && (
            <div className="flex items-center gap-1 ml-auto">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Invite Only</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <ClanRankBadge tier={rank_tier} size="sm" />
          <span className="text-xs text-muted-foreground">
            Lv. {level} · {total_xp.toLocaleString()} Total XP
          </span>
        </div>
      </div>
    </Link>
  );
}
