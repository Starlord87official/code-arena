import { Crown, Award } from 'lucide-react';

interface Achievement {
  title: string;
  subtitle: string;
  type: 'solo' | 'duo' | 'clan';
}

interface AchievementsRowProps {
  achievements?: Achievement[];
  isChampion?: boolean;
}

export function AchievementsRow({ achievements, isChampion = false }: AchievementsRowProps) {
  // Default achievements for demo - in production these would come from DB
  const defaultAchievements: Achievement[] = [
    { title: 'CodeLock Solo', subtitle: 'Crown - India 2026', type: 'solo' },
    { title: 'CodeLock Duo', subtitle: 'Crown - India 2026', type: 'duo' },
    { title: 'CodeLock Clan', subtitle: '- India 2026 -', type: 'clan' },
    { title: 'CodeLock Clan', subtitle: 'Crown - India 2026', type: 'clan' },
  ];

  const displayAchievements = achievements || defaultAchievements;

  return (
    <div className="arena-card p-6">
      {/* Crown Achievements Row */}
      <div className="flex items-center justify-center gap-8 mb-6">
        {displayAchievements.map((achievement, index) => (
          <div key={index} className="text-center">
            {/* Crown Icon */}
            <div className="relative w-24 h-20 mb-2">
              <svg viewBox="0 0 100 80" className="w-full h-full">
                {/* Crown shape */}
                <defs>
                  <linearGradient id={`crownGold${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#DAA520" />
                  </linearGradient>
                  <linearGradient id={`crownBlue${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00BFFF" />
                    <stop offset="100%" stopColor="#1E90FF" />
                  </linearGradient>
                </defs>
                {/* Crown base */}
                <path 
                  d="M15 65 L15 55 L25 40 L40 55 L50 30 L60 55 L75 40 L85 55 L85 65 Z" 
                  fill={`url(#crownGold${index})`}
                  stroke="#B8860B"
                  strokeWidth="1"
                />
                {/* Crown jewels */}
                <circle cx="50" cy="35" r="6" fill={`url(#crownBlue${index})`} />
                <circle cx="25" cy="45" r="4" fill={`url(#crownBlue${index})`} />
                <circle cx="75" cy="45" r="4" fill={`url(#crownBlue${index})`} />
                {/* Glow effect */}
                <circle cx="50" cy="35" r="8" fill="none" stroke="#00BFFF" strokeWidth="1" opacity="0.5">
                  <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
              </svg>
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
