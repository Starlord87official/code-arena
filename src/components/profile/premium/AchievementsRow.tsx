import { Award } from 'lucide-react';
import { CrownIcon } from './CrownIcon';

interface Achievement {
  title: string;
  subtitle: string;
}

interface AchievementsRowProps {
  achievements?: Achievement[];
  isChampion?: boolean;
}

export function AchievementsRow({ achievements, isChampion = false }: AchievementsRowProps) {
  // Default achievements for demo - in production these would come from DB
  const defaultAchievements: Achievement[] = [
    { title: 'CodeLock Solo', subtitle: 'Crown – India 2026' },
    { title: 'CodeLock Duo', subtitle: 'Crown – India 2026' },
    { title: 'CodeLock Clan', subtitle: '– India 2026 –' },
    { title: 'CodeLock Clan', subtitle: 'Crown – India 2026' },
  ];

  const displayAchievements = achievements || defaultAchievements;

  return (
    <div className="arena-card p-6">
      {/* Crown Achievements Row */}
      <div className="flex items-center justify-center gap-8 mb-6">
        {displayAchievements.map((achievement, index) => (
          <div key={index} className="text-center">
            {/* Crown Icon */}
            <div className="flex items-center justify-center mb-3">
              <CrownIcon size={100} />
            </div>
            <div className="text-sm font-medium text-foreground">{achievement.title}</div>
            <div className="text-xs text-muted-foreground">{achievement.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Verified Champion Badge */}
      {isChampion && (
        <div className="flex items-center justify-center gap-2 text-rank-gold">
          <Award className="h-5 w-5" />
          <span className="font-display font-bold text-sm">Verified</span>
          <span className="font-display font-bold text-status-success text-sm">CodeLock</span>
          <span className="font-display font-bold text-sm">Champion</span>
        </div>
      )}
    </div>
  );
}
