import { cn } from '@/lib/utils';
import { RANK_TIERS, type RankTier } from '@/lib/clanSeedData';
import { Shield } from 'lucide-react';

interface ClanRankBadgeProps {
  tier: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ClanRankBadge({ tier, size = 'md', showLabel = true }: ClanRankBadgeProps) {
  const rankKey = (tier as RankTier) || 'bronze';
  const rank = RANK_TIERS[rankKey] || RANK_TIERS.bronze;

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          'rounded-lg flex items-center justify-center border',
          sizeClasses[size],
          rank.glow
        )}
        style={{
          borderColor: rank.color,
          background: `linear-gradient(135deg, ${rank.color}22, transparent)`,
        }}
      >
        <Shield className={iconSizes[size]} style={{ color: rank.color }} />
      </div>
      {showLabel && (
        <span
          className={cn(
            'font-heading font-bold uppercase tracking-wider',
            size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : 'text-sm'
          )}
          style={{ color: rank.color }}
        >
          {rank.label}
        </span>
      )}
    </div>
  );
}
