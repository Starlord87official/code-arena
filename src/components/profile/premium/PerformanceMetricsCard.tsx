import { Badge } from '@/components/ui/badge';
import { Hash, Search, Calculator } from 'lucide-react';

interface PerformanceMetric {
  name: string;
  count: number;
  icon: 'sliding' | 'binary' | 'prefix';
}

interface PerformanceMetricsCardProps {
  metrics?: PerformanceMetric[];
  dueToday?: number;
  dueTomorrow?: number;
  dueThisWeek?: number;
}

export function PerformanceMetricsCard({
  metrics = [
    { name: 'Sliding Window', count: 33, icon: 'sliding' },
    { name: 'Binary Search', count: 28, icon: 'binary' },
    { name: 'Prefix Sum', count: 26, icon: 'prefix' },
  ],
  dueToday = 1,
  dueTomorrow = 3,
  dueThisWeek = 7,
}: PerformanceMetricsCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'sliding':
        return <Hash className="h-4 w-4 text-primary" />;
      case 'binary':
        return <Search className="h-4 w-4 text-status-warning" />;
      case 'prefix':
        return <Calculator className="h-4 w-4 text-neon-purple" />;
      default:
        return <Hash className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="arena-card p-4">
      <h4 className="font-display font-bold text-sm text-foreground mb-4">Performance Metics</h4>
      
      <div className="space-y-3 mb-6">
        {metrics.map((metric, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center">
                {getIcon(metric.icon)}
              </div>
              <span className="text-sm text-foreground">{metric.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">{metric.count}</span>
          </div>
        ))}
      </div>

      {/* Revision & Discipline Section */}
      <div className="border-t border-border pt-4">
        <h4 className="font-display font-bold text-sm text-foreground mb-3">Revision & Discipline</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-primary text-xs">◉</span>
              <span className="text-sm text-muted-foreground">Due Today</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-foreground">{dueToday}</span>
              <span className="text-muted-foreground">›</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-status-warning text-xs">◉</span>
              <span className="text-sm text-muted-foreground">Due Tomorrow</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-foreground">{dueTomorrow}</span>
              <span className="text-muted-foreground">›</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">◉</span>
              <span className="text-sm text-muted-foreground">Due This Week</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-foreground">{dueThisWeek}</span>
              <span className="text-muted-foreground">›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
