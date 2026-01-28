import { Award } from 'lucide-react';
import { CrownIcon } from './CrownIcon';

interface Achievement {
  title: string;
  subtitle: string;
  variant: 'solo' | 'duo' | 'clan' | 'clan-alt';
}

interface AchievementsRowProps {
  achievements?: Achievement[];
  isChampion?: boolean;
}

export function AchievementsRow({ achievements, isChampion = false }: AchievementsRowProps) {
  // Default achievements matching reference exactly
  const defaultAchievements: Achievement[] = [
    { title: 'CodeLock Solo', subtitle: 'Crown – India 2026', variant: 'solo' },
    { title: 'CodeLock Duo', subtitle: 'Crown – India 2026', variant: 'duo' },
    { title: 'CodeLock Clan', subtitle: '– India 2026 –', variant: 'clan' },
    { title: 'CodeLock Clan', subtitle: 'Crown – India 2026', variant: 'clan-alt' },
  ];

  const displayAchievements = achievements || defaultAchievements;

  return (
    <div className="arena-card p-8 overflow-hidden">
      {/* Subtle background glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, hsla(45, 100%, 50%, 0.08) 0%, transparent 60%)',
        }}
      />
      
      {/* Crown Achievements Row */}
      <div className="relative flex items-end justify-center gap-6 mb-6">
        {displayAchievements.map((achievement, index) => (
          <div key={index} className="text-center flex flex-col items-center">
            {/* Crown Icon */}
            <div className="flex items-center justify-center mb-4">
              <CrownIcon size={130} variant={achievement.variant} />
            </div>
            <div className="text-sm font-semibold text-foreground tracking-wide">
              {achievement.title}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {achievement.subtitle}
            </div>
          </div>
        ))}
      </div>

      {/* Verified Champion Badge */}
      {isChampion && (
        <div className="relative flex items-center justify-center gap-2 pt-4 border-t border-border/30">
          <Award className="h-5 w-5 text-rank-gold" />
          <span className="font-display font-bold text-sm text-rank-gold">Verified</span>
          <span className="font-display font-bold text-status-success text-sm">CodeLock</span>
          <span className="font-display font-bold text-sm text-rank-gold">Champion</span>
        </div>
      )}
    </div>
  );
}
