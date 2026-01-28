import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TrainingAttributes } from '@/hooks/useProfileStats';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface Props {
  attributes: TrainingAttributes;
  size?: number;
  className?: string;
}

const ATTRIBUTES_CONFIG = [
  { key: 'attack', label: 'Attack', description: 'Problem-solving power (weighted by difficulty)', color: 'text-red-500' },
  { key: 'defense', label: 'Defense', description: 'Accuracy and quality of solutions', color: 'text-blue-500' },
  { key: 'vision', label: 'Vision', description: 'Topic diversity and breadth of knowledge', color: 'text-purple-500' },
  { key: 'stamina', label: 'Stamina', description: 'Consistency, streaks, and daily activity', color: 'text-green-500' },
  { key: 'adaptability', label: 'Adapt', description: 'Difficulty range and topic flexibility', color: 'text-yellow-500' },
  { key: 'clutch', label: 'Clutch', description: 'Performance in timed challenges and battles', color: 'text-orange-500' },
] as const;

export function TrainingAttributesChart({ attributes, size = 200, className }: Props) {
  const { points, labelPositions, gridLines } = useMemo(() => {
    const numAttributes = ATTRIBUTES_CONFIG.length;
    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = (size / 2) - 30; // Leave room for labels
    
    // Calculate angle for each attribute
    const angleStep = (2 * Math.PI) / numAttributes;
    const startAngle = -Math.PI / 2; // Start from top
    
    // Calculate points for the data polygon
    const dataPoints = ATTRIBUTES_CONFIG.map((config, i) => {
      const value = attributes[config.key as keyof TrainingAttributes];
      const radius = (value / 100) * maxRadius;
      const angle = startAngle + (i * angleStep);
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        value,
      };
    });
    
    // Calculate label positions
    const labels = ATTRIBUTES_CONFIG.map((config, i) => {
      const angle = startAngle + (i * angleStep);
      const labelRadius = maxRadius + 20;
      return {
        x: centerX + labelRadius * Math.cos(angle),
        y: centerY + labelRadius * Math.sin(angle),
        ...config,
        value: attributes[config.key as keyof TrainingAttributes],
      };
    });
    
    // Create grid lines (background hexagons at 25%, 50%, 75%, 100%)
    const grid = [25, 50, 75, 100].map(percent => {
      const radius = (percent / 100) * maxRadius;
      return ATTRIBUTES_CONFIG.map((_, i) => {
        const angle = startAngle + (i * angleStep);
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      });
    });
    
    return {
      points: dataPoints,
      labelPositions: labels,
      gridLines: grid,
    };
  }, [attributes, size]);

  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');
  
  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-sm flex items-center gap-2">
          Training Attributes
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-xs">
                Training attributes are calculated from your real solve data, activity patterns, and battle performance. Each stat ranges from 0-100.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <svg width={size} height={size} className="mx-auto">
        {/* Background grid */}
        {gridLines.map((gridPoints, gridIndex) => (
          <polygon
            key={gridIndex}
            points={gridPoints.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={gridIndex === 3 ? 1.5 : 0.5}
            strokeDasharray={gridIndex < 3 ? "2,2" : undefined}
            opacity={0.5}
          />
        ))}
        
        {/* Axis lines from center to each vertex */}
        {labelPositions.map((label, i) => (
          <line
            key={i}
            x1={size / 2}
            y1={size / 2}
            x2={gridLines[3][i].x}
            y2={gridLines[3][i].y}
            stroke="hsl(var(--border))"
            strokeWidth={0.5}
            opacity={0.3}
          />
        ))}
        
        {/* Data polygon - gradient fill */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <polygon
          points={pointsString}
          fill="url(#radarGradient)"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          className="transition-all duration-500"
        />
        
        {/* Data points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={4}
            fill="hsl(var(--background))"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            className="transition-all duration-300"
          />
        ))}
        
        {/* Labels */}
        {labelPositions.map((label, i) => (
          <g key={i}>
            <text
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-[10px] font-medium"
            >
              {label.label}
            </text>
            <text
              x={label.x}
              y={label.y + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {label.value}
            </text>
          </g>
        ))}
      </svg>
      
      {/* Attribute details list */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {ATTRIBUTES_CONFIG.map((config) => {
          const value = attributes[config.key as keyof TrainingAttributes];
          return (
            <TooltipProvider key={config.key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 cursor-help">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ 
                        backgroundColor: value >= 75 ? 'hsl(var(--primary))' :
                                        value >= 50 ? 'hsl(var(--status-warning))' :
                                        'hsl(var(--muted-foreground))'
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{config.label}</span>
                    <span className="text-xs font-bold ml-auto">{value}</span>
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
