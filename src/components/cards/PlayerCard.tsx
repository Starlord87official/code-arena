import { User, getDivisionColor, getDivisionAura, getXpProgress, getXpForNextLevel } from '@/lib/mockData';
import { Flame, Trophy, Target, Zap } from 'lucide-react';

interface PlayerCardProps {
  user: User;
  variant?: 'full' | 'compact';
}

export function PlayerCard({ user, variant = 'full' }: PlayerCardProps) {
  const xpProgress = getXpProgress(user.xp, user.level);

  if (variant === 'compact') {
    return (
      <div className={`arena-card p-4 rounded-xl ${getDivisionAura(user.division)}`}>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-lg text-primary-foreground">
            {user.username[0]}
          </div>
          <div>
            <p className="font-heading font-bold text-lg">{user.username}</p>
            <p className={`text-sm uppercase font-semibold ${getDivisionColor(user.division)}`}>
              {user.division} • #{user.rank}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`arena-card rounded-2xl overflow-hidden ${getDivisionAura(user.division)}`}>
      {/* Header Banner */}
      <div className="h-24 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 relative">
        <div className="absolute inset-0 grid-pattern opacity-50" />
      </div>

      {/* Avatar */}
      <div className="relative px-6 -mt-12">
        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-3xl text-primary-foreground border-4 border-background shadow-neon">
          {user.username[0]}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-2xl">{user.username}</h2>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mt-2 ${getDivisionColor(user.division)}`} style={{ borderColor: 'currentColor' }}>
              <Trophy className="h-4 w-4" />
              <span className="font-heading font-semibold uppercase text-sm">{user.division}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-sm">Global Rank</p>
            <p className="font-display font-bold text-3xl text-primary">#{user.rank}</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Level {user.level}</span>
            <span className="text-primary font-semibold">{user.xp.toLocaleString()} / {getXpForNextLevel(user.level).toLocaleString()} XP</span>
          </div>
          <div className="xp-bar progress-glow">
            <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Flame className="h-5 w-5 mx-auto mb-1 text-status-warning streak-flame" />
            <p className="font-display font-bold text-xl stat-value text-status-warning">{user.streak}</p>
            <p className="text-xs text-muted-foreground uppercase">Streak</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="font-display font-bold text-xl stat-value text-primary">{user.solvedChallenges}</p>
            <p className="text-xs text-muted-foreground uppercase">Solved</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Zap className="h-5 w-5 mx-auto mb-1 text-accent" />
            <p className="font-display font-bold text-xl stat-value text-accent">{user.elo}</p>
            <p className="text-xs text-muted-foreground uppercase">ELO</p>
          </div>
        </div>
      </div>
    </div>
  );
}
