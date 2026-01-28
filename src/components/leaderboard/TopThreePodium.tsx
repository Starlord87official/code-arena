import { Crown, Medal, Flame, Zap, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getDivisionColor, getDivisionAura } from '@/lib/mockData';
import { UsernameLink } from '@/components/social/UsernameLink';
import { LeaderboardUser } from '@/hooks/useLeaderboard';

interface TopThreePodiumProps {
  users: LeaderboardUser[];
}

// Individual Podium Card for each top 3 position
const PodiumCard = ({ 
  user, 
  position 
}: { 
  user: LeaderboardUser; 
  position: 1 | 2 | 3;
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 1:
        return {
          scale: 'scale-110 z-20',
          cardBg: 'bg-gradient-to-b from-rank-gold/20 via-card to-card',
          border: 'border-rank-gold/60',
          glow: 'shadow-[0_0_40px_hsla(45,90%,55%,0.4),inset_0_1px_0_hsla(45,90%,55%,0.3)]',
          avatarSize: 'h-20 w-20',
          avatarBorder: 'border-4 border-rank-gold',
          textColor: 'text-rank-gold',
          label: 'REIGNING CHAMPION',
          icon: <Crown className="h-10 w-10 text-rank-gold drop-shadow-[0_0_20px_hsl(var(--rank-gold))]" />,
          rankBadgeBg: 'bg-rank-gold',
          order: 'order-2',
          marginTop: '-mt-4',
        };
      case 2:
        return {
          scale: 'scale-100 z-10',
          cardBg: 'bg-gradient-to-b from-rank-silver/15 via-card to-card',
          border: 'border-rank-silver/50',
          glow: 'shadow-[0_0_25px_hsla(210,10%,60%,0.3),inset_0_1px_0_hsla(210,10%,60%,0.2)]',
          avatarSize: 'h-16 w-16',
          avatarBorder: 'border-3 border-rank-silver',
          textColor: 'text-rank-silver',
          label: 'ELITE RUNNER-UP',
          icon: <Medal className="h-8 w-8 text-rank-silver drop-shadow-[0_0_15px_hsl(var(--rank-silver))]" />,
          rankBadgeBg: 'bg-rank-silver',
          order: 'order-1',
          marginTop: 'mt-4',
        };
      case 3:
        return {
          scale: 'scale-100 z-10',
          cardBg: 'bg-gradient-to-b from-rank-bronze/15 via-card to-card',
          border: 'border-rank-bronze/50',
          glow: 'shadow-[0_0_25px_hsla(30,70%,45%,0.3),inset_0_1px_0_hsla(30,70%,45%,0.2)]',
          avatarSize: 'h-16 w-16',
          avatarBorder: 'border-3 border-rank-bronze',
          textColor: 'text-rank-bronze',
          label: 'PODIUM FINISHER',
          icon: <Medal className="h-8 w-8 text-rank-bronze drop-shadow-[0_0_15px_hsl(var(--rank-bronze))]" />,
          rankBadgeBg: 'bg-rank-bronze',
          order: 'order-3',
          marginTop: 'mt-4',
        };
    }
  };

  const styles = getPositionStyles();

  return (
    <div className={`${styles.order} ${styles.marginTop} flex-1 max-w-[280px] transform transition-all duration-300 hover:scale-[1.02] ${styles.scale}`}>
      <div className={`relative arena-card p-6 border-2 ${styles.border} ${styles.glow} ${styles.cardBg} rounded-2xl overflow-hidden`}>
        {/* Animated background particles for champion */}
        {position === 1 && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rank-gold/10 via-transparent to-transparent" />
            <Sparkles className="absolute top-2 right-2 h-4 w-4 text-rank-gold/40 animate-pulse" />
            <Sparkles className="absolute bottom-4 left-2 h-3 w-3 text-rank-gold/30 animate-pulse delay-300" />
          </>
        )}

        {/* Rank Badge */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className={`${styles.rankBadgeBg} text-background font-display font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center shadow-lg`}>
            #{position}
          </div>
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center text-center pt-4">
          {/* Icon */}
          <div className="mb-3">
            {styles.icon}
          </div>

          {/* Avatar */}
          <div className="relative mb-3">
            <div className={`absolute -inset-2 rounded-full ${getDivisionAura(user.division)} opacity-60`} />
            <Avatar className={`${styles.avatarSize} ${styles.avatarBorder} relative`}>
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className={`text-lg font-bold ${styles.textColor} bg-current/10`}>
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Label */}
          <Badge className={`mb-2 ${styles.textColor} bg-current/10 border-current/30 text-[10px] font-semibold tracking-wider`}>
            {styles.label}
          </Badge>

          {/* Username */}
          <h3 className="font-display text-lg font-bold mb-1 truncate max-w-full">
            <UsernameLink 
              username={user.username} 
              className={`${user.isCurrentUser ? 'text-primary' : 'text-foreground'} hover:opacity-80`} 
            />
            {user.isCurrentUser && (
              <span className="ml-1 text-xs text-muted-foreground font-normal">(You)</span>
            )}
          </h3>

          {/* Division */}
          <Badge 
            variant="outline" 
            className={`${getDivisionColor(user.division)} border-current capitalize text-xs mb-4`}
          >
            {user.division}
          </Badge>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 text-sm w-full">
            <div className="text-center">
              <p className={`font-bold ${styles.textColor} flex items-center justify-center gap-1`}>
                <Zap className="h-3.5 w-3.5" />
                {user.xp.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase">XP</p>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="text-center">
              <p className="font-bold text-status-warning flex items-center justify-center gap-1">
                <Flame className="h-3.5 w-3.5" />
                {user.streak}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase">Streak</p>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="text-center">
              <p className="font-bold text-foreground">{user.solvedChallenges}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Solved</p>
            </div>
          </div>

          {/* Level Badge */}
          <div className={`mt-4 px-3 py-1 rounded-full ${styles.textColor} bg-current/10 text-xs font-semibold`}>
            Level {user.level}
          </div>
        </div>
      </div>
    </div>
  );
};

export function TopThreePodium({ users }: TopThreePodiumProps) {
  // Get available top 3 users (handle edge cases where fewer than 3 exist)
  const topThree = users.slice(0, 3);
  
  if (topThree.length === 0) return null;

  return (
    <div className="mb-10">
      {/* Section Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-rank-gold/50 to-transparent" />
          <Crown className="h-5 w-5 text-rank-gold" />
          <span className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Hall of Champions
          </span>
          <Crown className="h-5 w-5 text-rank-gold" />
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-rank-gold/50 to-transparent" />
        </div>
      </div>

      {/* Podium Container */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-4 md:gap-6 px-4">
        {/* Render in visual order: 2nd, 1st, 3rd (for desktop) */}
        {topThree[1] && <PodiumCard user={topThree[1]} position={2} />}
        {topThree[0] && <PodiumCard user={topThree[0]} position={1} />}
        {topThree[2] && <PodiumCard user={topThree[2]} position={3} />}
      </div>
    </div>
  );
}
