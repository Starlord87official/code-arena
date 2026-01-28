import { Award } from 'lucide-react';
import crownsRowImage from '@/assets/crowns-row.jpg';

interface AchievementsRowProps {
  isChampion?: boolean;
}

export function AchievementsRow({ isChampion = false }: AchievementsRowProps) {
  return (
    <div className="arena-card p-6">
      {/* Crown Achievements Row - Using exact reference image */}
      <div className="flex items-center justify-center mb-6">
        <img 
          src={crownsRowImage} 
          alt="CodeLock Achievement Crowns"
          className="max-w-full h-auto object-contain"
          style={{
            filter: 'drop-shadow(0 0 20px hsla(45, 90%, 55%, 0.3))',
            maxHeight: '140px',
          }}
        />
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
