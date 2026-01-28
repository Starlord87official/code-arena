import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, Zap, Code } from 'lucide-react';

interface SolvedProblem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  risk?: 'safe' | 'moderate' | 'high';
  description: string;
  topics: string[];
  xpReward: number;
  runtime?: string;
  language?: string;
  solvedAgo?: string;
  bestSolved?: string;
  lastSolve?: string;
  companyIcons?: string[];
}

interface SolvedProblemCardProps {
  problem: SolvedProblem;
}

export function SolvedProblemCard({ problem }: SolvedProblemCardProps) {
  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-status-success/20 text-status-success border-status-success/30';
      case 'medium':
        return 'bg-status-warning/20 text-status-warning border-status-warning/30';
      case 'hard':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return '';
    }
  };

  const getRiskStyles = (risk?: string) => {
    switch (risk) {
      case 'moderate':
        return 'bg-status-warning text-black';
      case 'high':
        return 'bg-destructive text-white';
      default:
        return 'bg-status-success/20 text-status-success';
    }
  };

  return (
    <div className="arena-card p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Left section - Problem info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-destructive">●</span>
            <h4 className="font-medium text-foreground">{problem.title}</h4>
            <span className="text-rank-gold">⚡</span>
            <Badge className={cn("text-xs", getDifficultyStyles(problem.difficulty))}>
              {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
            </Badge>
            {problem.risk && (
              <Badge className={cn("text-xs", getRiskStyles(problem.risk))}>
                ⚡ {problem.risk === 'moderate' ? 'Moderate Risk' : problem.risk === 'high' ? 'High Risk' : 'Safe Zone'}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-3">{problem.description}</p>

          <div className="flex items-center gap-2 flex-wrap">
            {problem.topics.map((topic, i) => (
              <Badge key={i} variant="outline" className="text-xs text-muted-foreground">
                {topic}
              </Badge>
            ))}
          </div>

          {problem.bestSolved && (
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>Best Solved: {problem.bestSolved}</span>
              <span className="text-muted-foreground/50">⊕</span>
              <span>Last solve {problem.lastSolve}</span>
            </div>
          )}
        </div>

        {/* Right section - Stats */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4">
            {problem.companyIcons && (
              <div className="flex items-center gap-1">
                {problem.companyIcons.map((_, i) => (
                  <div key={i} className="w-5 h-5 rounded bg-secondary flex items-center justify-center">
                    <span className="text-xs">G</span>
                  </div>
                ))}
              </div>
            )}
            <span className="text-sm text-muted-foreground">{problem.solvedAgo}</span>
            <Badge className="bg-status-success/20 text-status-success border-status-success/30">
              +{problem.xpReward} XP
            </Badge>
            <div className="flex items-center gap-1">
              <Code className="h-4 w-4 text-muted-foreground" />
              <span className="font-display font-bold text-foreground">169</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded bg-destructive flex items-center justify-center">
                <span className="text-xs text-destructive-foreground">G</span>
              </div>
              <div className="w-5 h-5 rounded bg-destructive/80 flex items-center justify-center">
                <span className="text-xs text-destructive-foreground">▶</span>
              </div>
            </div>
            <span className="text-foreground font-bold">3</span>
          </div>

          {problem.runtime && (
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                ⚡ {problem.runtime}
              </Badge>
              <Badge variant="outline" className="text-xs text-status-success">
                ⚡ 2
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                ≡ 3
              </Badge>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">◇</span>
            <span className="text-muted-foreground">G.</span>
            <span className="font-bold text-foreground">3</span>
            <span className="text-muted-foreground">...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
