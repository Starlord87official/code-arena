import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, AlertCircle, Loader2 } from 'lucide-react';

export type ProblemStatus = 'unseen' | 'attempted' | 'solved' | 'wrong';

export interface BattleProblemItem {
  id: string;
  matchProblemId: string;
  title: string;
  difficulty: string;
  points: number;
  status: ProblemStatus;
}

interface BattleProblemsPanelProps {
  problems: BattleProblemItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  isLoading: boolean;
}

export function BattleProblemsPanel({ problems, selectedIndex, onSelect, isLoading }: BattleProblemsPanelProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
        <p className="text-xs text-muted-foreground">Loading problems…</p>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <AlertCircle className="h-6 w-6 text-destructive mb-2" />
        <p className="text-xs text-muted-foreground">No problems assigned</p>
      </div>
    );
  }

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'easy': return 'text-status-success border-status-success/50 bg-status-success/10';
      case 'medium': return 'text-status-warning border-status-warning/50 bg-status-warning/10';
      case 'hard': return 'text-destructive border-destructive/50 bg-destructive/10';
      default: return 'text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: ProblemStatus) => {
    switch (status) {
      case 'solved': return <CheckCircle2 className="h-4 w-4 text-status-success" />;
      case 'attempted': return <AlertCircle className="h-4 w-4 text-status-warning" />;
      case 'wrong': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground">Problems</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {problems.map((problem, idx) => {
          const label = String.fromCharCode(65 + idx); // A, B, C...
          const isSelected = idx === selectedIndex;

          return (
            <button
              key={problem.id}
              onClick={() => onSelect(idx)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'border-primary bg-primary/10 neon-border'
                  : 'border-border bg-card/50 hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">{label}</span>
                  {getStatusIcon(problem.status)}
                </div>
                <span className="text-xs font-mono text-muted-foreground">+{problem.points}</span>
              </div>
              <p className="text-sm font-medium text-foreground truncate">{problem.title}</p>
              <Badge variant="outline" className={`mt-1 text-[10px] uppercase ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
