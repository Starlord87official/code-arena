import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TrainingAttributes } from '@/hooks/useProfileStats';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Swords, Shield, Eye, Zap, Shuffle, Target } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  attributes: TrainingAttributes;
  className?: string;
  showEmptyState?: boolean;
}

const ATTRIBUTES_CONFIG = [
  { key: 'attack', label: 'Attack', fullLabel: 'Attack', description: 'Problem-solving power (weighted by difficulty)', icon: Swords, color: 'hsl(var(--destructive))' },
  { key: 'defense', label: 'Defense', fullLabel: 'Defense', description: 'Accuracy and quality of solutions', icon: Shield, color: 'hsl(var(--primary))' },
  { key: 'vision', label: 'Vision', fullLabel: 'Vision', description: 'Topic diversity and breadth of knowledge', icon: Eye, color: 'hsl(var(--neon-purple))' },
  { key: 'stamina', label: 'Stamina', fullLabel: 'Stamina', description: 'Consistency, streaks, and daily activity', icon: Zap, color: 'hsl(var(--status-success))' },
  { key: 'adaptability', label: 'Adapt', fullLabel: 'Adaptability', description: 'Difficulty range and topic flexibility', icon: Shuffle, color: 'hsl(var(--status-warning))' },
  { key: 'clutch', label: 'Clutch', fullLabel: 'Clutch', description: 'Performance in timed challenges and battles', icon: Target, color: 'hsl(var(--rank-legend))' },
] as const;

export function RadarAttributesChart({ attributes, className, showEmptyState = true }: Props) {
  const chartData = useMemo(() => {
    return ATTRIBUTES_CONFIG.map(config => ({
      attribute: config.label,
      value: attributes[config.key as keyof TrainingAttributes] || 0,
      fullMark: 100,
    }));
  }, [attributes]);

  const totalValue = Object.values(attributes).reduce((sum, val) => sum + val, 0);
  const hasData = totalValue > 0;

  return (
    <div className={cn("arena-card p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          Training Attributes
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-xs">
                Training attributes are calculated from your real solve data, activity patterns, and battle performance. Each stat ranges from 0-100.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Radar Chart */}
      <div className="relative">
        {!hasData && showEmptyState && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-card/80 backdrop-blur-sm rounded-lg">
            <div className="text-center p-4">
              <p className="text-muted-foreground text-sm">Start solving to build your profile</p>
            </div>
          </div>
        )}
        
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.5}
                gridType="polygon"
              />
              <PolarAngleAxis 
                dataKey="attribute" 
                tick={{ 
                  fill: 'hsl(var(--muted-foreground))', 
                  fontSize: 11,
                  fontWeight: 500,
                }}
                tickLine={false}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Stats"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: 'hsl(var(--background))',
                  stroke: 'hsl(var(--primary))',
                  strokeWidth: 2,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attribute List */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {ATTRIBUTES_CONFIG.map((config) => {
          const value = attributes[config.key as keyof TrainingAttributes] || 0;
          const Icon = config.icon;
          return (
            <TooltipProvider key={config.key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 cursor-help hover:bg-secondary/50 transition-colors">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground flex-1">{config.fullLabel}</span>
                    <span className={cn(
                      "text-xs font-bold",
                      value >= 75 ? "text-primary" :
                      value >= 50 ? "text-status-warning" :
                      value >= 25 ? "text-muted-foreground" :
                      "text-muted-foreground/50"
                    )}>
                      {value}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{config.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}
