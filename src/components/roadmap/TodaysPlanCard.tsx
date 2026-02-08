import { Flame, CheckCircle2, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodaysPlanCardProps {
  problemsSolved: number;
  problemsTarget: number;
  conceptsRead: number;
  conceptsTarget: number;
  streak: number;
  className?: string;
}

function CircularProgress({ value, max, size = 56 }: { value: number; max: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--secondary))"
        strokeWidth="3"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="transition-all duration-700"
        style={{
          filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.5))',
        }}
      />
      {/* Center check */}
      {progress >= 1 && (
        <g transform={`rotate(90, ${size / 2}, ${size / 2})`}>
          <text
            x={size / 2}
            y={size / 2 + 5}
            textAnchor="middle"
            fill="hsl(var(--primary))"
            fontSize="18"
          >
            ✓
          </text>
        </g>
      )}
    </svg>
  );
}

export function TodaysPlanCard({
  problemsSolved = 1,
  problemsTarget = 2,
  conceptsRead = 0,
  conceptsTarget = 1,
  streak = 3,
  className,
}: TodaysPlanCardProps) {
  const battleReadyMins = 12;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/40 p-5 space-y-5",
        "bg-card/60 backdrop-blur-xl",
        "shadow-[0_8px_32px_hsl(var(--background)/0.5)]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading font-bold text-foreground">Today's Plan</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
            <Flame className="h-3 w-3" />
            {streak} day streak
          </div>
        </div>
      </div>

      {/* Problem Goal */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-status-success" />
            <span className="font-medium text-foreground">
              Solve {problemsTarget} problems ({problemsSolved}/{problemsTarget})
            </span>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            + {problemsSolved}/{problemsTarget}
          </p>
        </div>
        <CircularProgress value={problemsSolved} max={problemsTarget} />
      </div>

      {/* Divider */}
      <div className="h-px bg-border/30" />

      {/* Concept Read */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          1 concept read ({conceptsRead}/{conceptsTarget})
        </span>
      </div>

      {/* Battle Ready */}
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-status-warning" />
        <span className="text-sm text-foreground font-medium">
          Battle ready in {battleReadyMins} mins
        </span>
      </div>
    </div>
  );
}
