import { useState, useEffect } from 'react';
import { Activity, Trophy, Zap, Target, Flame, Swords } from 'lucide-react';
import { getDivisionColor } from '@/lib/mockData';

interface ActivityItem {
  id: string;
  type: 'solve' | 'rankup' | 'streak' | 'battle' | 'xp';
  username: string;
  division: string;
  message: string;
  timestamp: Date;
}

const mockActivities: ActivityItem[] = [
  { id: '1', type: 'solve', username: 'AlphaStrike', division: 'legend', message: 'crushed "The Ultimate Recursion" in 4:23', timestamp: new Date(Date.now() - 30000) },
  { id: '2', type: 'rankup', username: 'BinaryBeast', division: 'legend', message: 'ascended to Legend Division', timestamp: new Date(Date.now() - 120000) },
  { id: '3', type: 'battle', username: 'CodeAssassin', division: 'master', message: 'defeated DevDestroyer in a duel', timestamp: new Date(Date.now() - 180000) },
  { id: '4', type: 'streak', username: 'EliteEncoder', division: 'diamond', message: 'reached a 20-day streak 🔥', timestamp: new Date(Date.now() - 240000) },
  { id: '5', type: 'xp', username: 'FlowMaster', division: 'diamond', message: 'earned 500 XP from contest', timestamp: new Date(Date.now() - 300000) },
  { id: '6', type: 'solve', username: 'GridGladiator', division: 'diamond', message: 'solved "Graph Conquest" optimally', timestamp: new Date(Date.now() - 360000) },
];

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
  const [activities, setActivities] = useState(mockActivities);
  const [isLive, setIsLive] = useState(true);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setActivities(prev => {
        const newActivity: ActivityItem = {
          id: Date.now().toString(),
          type: ['solve', 'rankup', 'streak', 'battle', 'xp'][Math.floor(Math.random() * 5)] as ActivityItem['type'],
          username: ['ShadowCoder', 'NightHawk', 'PixelPro', 'ByteMaster'][Math.floor(Math.random() * 4)],
          division: ['gold', 'platinum', 'diamond', 'master'][Math.floor(Math.random() * 4)],
          message: [
            'just solved a hard challenge',
            'is on a 5-day streak',
            'earned 200 XP',
            'won a quick battle'
          ][Math.floor(Math.random() * 4)],
          timestamp: new Date(),
        };
        return [newActivity, ...prev.slice(0, 5)];
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="arena-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="h-5 w-5 text-primary" />
            {isLive && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-status-success rounded-full live-pulse" />
            )}
          </div>
          <h3 className="font-display font-bold">ARENA LIVE</h3>
        </div>
        <button 
          onClick={() => setIsLive(!isLive)}
          className={`text-xs px-2 py-1 rounded ${isLive ? 'bg-status-success/20 text-status-success' : 'bg-muted text-muted-foreground'}`}
        >
          {isLive ? 'LIVE' : 'PAUSED'}
        </button>
      </div>

      {/* Activity List */}
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          return (
            <div 
              key={activity.id} 
              className={`flex items-start gap-3 p-2 rounded-lg bg-secondary/20 transition-all animate-slide-up`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`p-1.5 rounded ${getActivityColor(activity.type)} bg-current/10`}>
                <Icon className={`h-4 w-4 ${getActivityColor(activity.type)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className={`font-semibold ${getDivisionColor(activity.division as any)}`}>
                    {activity.username}
                  </span>
                  <span className="text-muted-foreground"> {activity.message}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{getTimeAgo(activity.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}