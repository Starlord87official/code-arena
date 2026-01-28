import { cn } from '@/lib/utils';
import { Globe, Trophy, Star } from 'lucide-react';

interface InterviewReadinessGaugeProps {
  score: number;
  label: string;
  totalRank?: { current: number; total: number };
  globalRank?: number;
  maxContestRating?: number;
}

export function InterviewReadinessGauge({
  score,
  label,
  totalRank = { current: 524, total: 817 },
  globalRank = 57,
  maxContestRating = 1770,
}: InterviewReadinessGaugeProps) {
  // Calculate the arc path for the circular gauge
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference * 0.75; // 75% of circle

  return (
    <div className="arena-card p-6">
      <h3 className="font-display font-bold text-lg text-foreground mb-6">Interview Readiness</h3>

      <div className="flex items-start gap-6">
        {/* Circular Gauge */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-[135deg]">
            {/* Background arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference * 0.75}
              strokeDashoffset={circumference * 0.25}
            />
            {/* Progress arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference * 0.75}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--rank-gold))" />
                <stop offset="100%" stopColor="hsl(var(--status-warning))" />
              </linearGradient>
            </defs>
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-bold text-rank-gold">{score}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex-1">
          {/* Status badge */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-4">
            Paths Ing Store
          </div>

          {/* Radial indicator */}
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Outer ring */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
              {/* Progress segments */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45 - 90) * (Math.PI / 180);
                const x1 = 50 + 35 * Math.cos(angle);
                const y1 = 50 + 35 * Math.sin(angle);
                const x2 = 50 + 45 * Math.cos(angle);
                const y2 = 50 + 45 * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={i < 6 ? 'hsl(var(--rank-gold))' : 'hsl(var(--muted))'}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn(
                "text-xs font-bold",
                score >= 80 ? "text-status-success" : "text-rank-gold"
              )}>
                {label}
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Developing<br />Skills</div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4 text-primary" />
            <span>Total Rrank</span>
          </div>
          <div className="font-display font-bold text-foreground">
            {totalRank.current.toLocaleString()} <span className="text-muted-foreground font-normal">/{totalRank.total}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4 text-status-warning" />
            <span>Global Rank</span>
          </div>
          <div className="font-display font-bold text-foreground">{globalRank}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-rank-gold" />
            <span>Max. Contest Rating</span>
          </div>
          <div className="font-display font-bold text-foreground">{maxContestRating.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
