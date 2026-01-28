import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TrainingAttributes } from '@/hooks/useProfileStats';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Swords, Shield, Eye, Zap, Shuffle, Target, Star } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';

interface Props {
  attributes: TrainingAttributes;
  className?: string;
  showEmptyState?: boolean;
}

const ATTRIBUTES_CONFIG = [
  { key: 'attack', label: 'Attack', fullLabel: 'Solving Power', value: 8.9 },
  { key: 'defense', label: 'Action', fullLabel: 'Action', value: 8.9 },
  { key: 'vision', label: 'Vision', fullLabel: 'Vision', value: 8.5 },
  { key: 'adaptability', label: 'Adaptability', fullLabel: 'Adaptability', value: 7.7 },
  { key: 'stamina', label: 'Breadth', fullLabel: 'Breadth', value: 8.0 },
  { key: 'clutch', label: 'Clutch', fullLabel: 'Interview Pressure', value: 8.6 },
] as const;

export function StatisticsRadarChart({ attributes, className, showEmptyState = true }: Props) {
  const chartData = useMemo(() => {
    return ATTRIBUTES_CONFIG.map(config => {
      const attrValue = attributes[config.key as keyof TrainingAttributes] || 0;
      // Scale from 0-100 to 0-10
      const scaledValue = attrValue > 0 ? (attrValue / 10).toFixed(1) : config.value;
      return {
        attribute: config.label,
        value: Number(scaledValue),
        fullMark: 10,
      };
    });
  }, [attributes]);

  const totalValue = Object.values(attributes).reduce((sum, val) => sum + val, 0);
  const hasData = totalValue > 0;

  return (
    <div className={cn("relative", className)}>
      {/* Radar Chart with glow effect */}
      <div className="relative h-[280px] w-full">
        {!hasData && showEmptyState && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-card/80 backdrop-blur-sm rounded-lg">
            <div className="text-center p-4">
              <p className="text-muted-foreground text-sm">Start solving to build your stats</p>
            </div>
          </div>
        )}
        
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <defs>
              <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(45 90% 55%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(30 70% 45%)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <PolarGrid 
              stroke="hsla(222, 30%, 25%, 0.5)" 
              strokeWidth={1}
              gridType="polygon"
            />
            <PolarAngleAxis 
              dataKey="attribute" 
              tick={({ x, y, payload, index }) => {
                const data = chartData[index];
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={-8}
                      textAnchor="middle"
                      fill="hsl(var(--muted-foreground))"
                      fontSize={10}
                    >
                      {payload.value}
                    </text>
                    <text
                      x={0}
                      y={8}
                      textAnchor="middle"
                      fill="hsl(var(--rank-gold))"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {data.value.toFixed(1)}
                    </text>
                  </g>
                );
              }}
              tickLine={false}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 10]} 
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Stats"
              dataKey="value"
              stroke="hsl(45 90% 55%)"
              fill="url(#radarFill)"
              strokeWidth={2}
              dot={{
                r: 4,
                fill: 'hsl(var(--rank-gold))',
                stroke: 'hsl(var(--rank-gold))',
                strokeWidth: 2,
              }}
              style={{
                filter: 'drop-shadow(0 0 8px hsla(45, 90%, 55%, 0.5))',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Tier Badge */}
      <div className="flex justify-center mt-4">
        <Badge className="bg-secondary/50 text-foreground border-border px-4 py-2">
          <Star className="h-4 w-4 mr-2 text-rank-gold" />
          <span className="text-muted-foreground">Performance Tier:</span>
          <span className="ml-2 text-primary font-bold">Master</span>
        </Badge>
      </div>
    </div>
  );
}
