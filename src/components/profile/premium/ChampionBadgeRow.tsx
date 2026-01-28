import { Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChampionBadgeRowProps {
  title?: string;
  year?: string;
  badgeCount?: number;
}

export function ChampionBadgeRow({ 
  title = 'Indian CodeLock Champion', 
  year = 'INDIA 2026',
  badgeCount = 3 
}: ChampionBadgeRowProps) {
  return (
    <div className="arena-card p-6">
      <div className="flex items-center justify-between">
        {/* Title section */}
        <div className="flex items-center gap-3">
          <h3 className="font-display font-bold text-lg text-foreground">{title}</h3>
          <Badge className="bg-rank-gold/20 text-rank-gold border-rank-gold/30 font-display text-xs">
            <Award className="h-3 w-3 mr-1" />
            {year}
          </Badge>
        </div>

        {/* Badge icons */}
        <div className="flex items-center gap-2">
          {[...Array(badgeCount)].map((_, i) => (
            <div 
              key={i} 
              className="w-16 h-16 relative"
              style={{
                filter: 'drop-shadow(0 0 10px hsla(45, 90%, 55%, 0.5))',
              }}
            >
              <svg viewBox="0 0 60 60" className="w-full h-full">
                <defs>
                  <linearGradient id={`badgeGold${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#B8860B" />
                  </linearGradient>
                  <linearGradient id={`badgeBlue${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00BFFF" />
                    <stop offset="100%" stopColor="#0066FF" />
                  </linearGradient>
                </defs>
                {/* Crown/shield shape */}
                <path
                  d="M30 5 L50 15 L55 35 L45 50 L30 55 L15 50 L5 35 L10 15 Z"
                  fill={`url(#badgeGold${i})`}
                  stroke="#DAA520"
                  strokeWidth="1"
                />
                {/* Inner decoration */}
                <path
                  d="M30 12 L42 20 L45 32 L38 42 L30 45 L22 42 L15 32 L18 20 Z"
                  fill="none"
                  stroke="#DAA520"
                  strokeWidth="0.5"
                  opacity="0.5"
                />
                {/* Center jewel */}
                <circle cx="30" cy="28" r="8" fill={`url(#badgeBlue${i})`} />
                {/* Crown points */}
                <path
                  d="M22 18 L30 10 L38 18"
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
