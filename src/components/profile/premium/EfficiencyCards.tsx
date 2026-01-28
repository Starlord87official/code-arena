import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Lightbulb, Zap, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EfficiencyCardProps {
  avgHintsPerAC?: { value: number; delta: number };
  avgAttemptsPerAC?: { value: number; delta: number };
  speed?: number;
}

interface WeaknessesCardProps {
  weaknesses?: { topic: string; current: number; total: number }[];
}

export function EfficiencyCard({
  avgHintsPerAC = { value: 11, delta: 4 },
  avgAttemptsPerAC = { value: 13, delta: 4 },
  speed = 78,
}: EfficiencyCardProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-display font-bold text-sm text-foreground">Efficiency</h4>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-status-warning" />
            <span className="text-sm text-muted-foreground">Avg Hints Per AC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-primary rounded-full" />
            <span className="font-bold text-foreground">{avgHintsPerAC.value}</span>
            <span className="text-muted-foreground">/{avgHintsPerAC.delta}</span>
            <span className="text-status-success text-xs">⊕</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-neon-purple" />
            <span className="text-sm text-muted-foreground">Avg Attempts Per AC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-neon-purple rounded-full" />
            <span className="font-bold text-foreground">{avgAttemptsPerAC.value}</span>
            <span className="text-muted-foreground">/{avgAttemptsPerAC.delta}</span>
            <span className="text-primary text-xs">⊙</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-status-success" />
            <span className="text-sm text-muted-foreground">Speed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-status-success rounded-full" />
            <span className="font-bold text-foreground">{speed} %</span>
            <span className="text-muted-foreground text-xs">⊕</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WeaknessesCard({
  weaknesses = [
    { topic: 'Max Flow', current: 14, total: 43 },
    { topic: 'Graph BFS', current: 13, total: 43 },
    { topic: 'DP States', current: 13, total: 43 },
  ],
}: WeaknessesCardProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-display font-bold text-sm text-foreground">Weaknesses</h4>
      
      <div className="space-y-3">
        {weaknesses.map((weakness, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">{weakness.topic}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">{weakness.current}</span>
              <span className="text-muted-foreground">/{weakness.total}</span>
              <span className="text-destructive text-xs">⊗</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
