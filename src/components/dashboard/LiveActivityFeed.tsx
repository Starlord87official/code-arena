import { useState } from 'react';
import { Activity, Trophy, Zap, Target, Flame, Swords, Users, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ActivityItem {
  id: string;
  type: 'solve' | 'rankup' | 'streak' | 'battle' | 'xp';
  username: string;
  division: string;
  message: string;
  timestamp: Date;
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'solve': return Target;
    case 'rankup': return Trophy;
    case 'streak': return Flame;
    case 'battle': return Swords;
    case 'xp': return Zap;
    default: return Activity;
  }
};

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'solve': return 'text-status-success';
    case 'rankup': return 'text-rank-legend';
    case 'streak': return 'text-status-warning';
    case 'battle': return 'text-destructive';
    case 'xp': return 'text-primary';
    default: return 'text-foreground';
  }
};

export function LiveActivityFeed() {
  // In private beta, we don't have live activity yet
  const activities: ActivityItem[] = [];
  const [isLive] = useState(false);

  return (
    <div className="arena-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-display font-bold">ARENA LIVE</h3>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
          COMING SOON
        </Badge>
      </div>

      {/* Empty State */}
      <div className="p-6 text-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl rounded-full" />
          <div className="relative inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>

        <h4 className="font-display font-semibold mb-2">
          Activity Feed Awaits
        </h4>
        
        <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">
          Watch real-time updates as warriors complete challenges and climb the ranks.
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>Private Beta</span>
        </div>
      </div>
    </div>
  );
}
