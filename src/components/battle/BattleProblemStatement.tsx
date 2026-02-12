import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';

interface BattleProblemStatementProps {
  title: string;
  difficulty: string;
  problemStatement: string;
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  tags: string[];
  points: number;
  isLoading: boolean;
}

export function BattleProblemStatement({
  title, difficulty, problemStatement, constraints, examples, tags, points, isLoading
}: BattleProblemStatementProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!title) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Select a problem to view</p>
      </div>
    );
  }

  const getDiffStyle = (d: string) => {
    switch (d) {
      case 'easy': return 'text-status-success bg-status-success/20 border-status-success/50';
      case 'medium': return 'text-status-warning bg-status-warning/20 border-status-warning/50';
      case 'hard': return 'text-destructive bg-destructive/20 border-destructive/50';
      default: return '';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
        <Badge variant="outline" className={`uppercase text-xs font-bold border ${getDiffStyle(difficulty)}`}>
          {difficulty}
        </Badge>
        <span className="text-xs font-mono text-primary">+{points} pts</span>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
          ))}
        </div>
      )}

      {/* Statement */}
      <Card className="arena-card">
        <CardContent className="p-4">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{problemStatement}</p>
        </CardContent>
      </Card>

      {/* Constraints */}
      {constraints.length > 0 && (
        <div>
          <h4 className="text-xs font-display uppercase tracking-widest text-muted-foreground mb-2">Constraints</h4>
          <ul className="space-y-1">
            {constraints.map((c, i) => (
              <li key={i} className="text-xs text-muted-foreground font-mono bg-secondary/30 px-3 py-1.5 rounded">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Examples */}
      {examples.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-display uppercase tracking-widest text-muted-foreground">Examples</h4>
          {examples.map((ex, i) => (
            <Card key={i} className="bg-secondary/30 border-border">
              <CardContent className="p-3 space-y-2">
                <div className="text-xs text-muted-foreground">Example {i + 1}</div>
                <div className="font-mono text-xs">
                  <span className="text-muted-foreground">Input: </span>
                  <span className="text-foreground">{ex.input}</span>
                </div>
                <div className="font-mono text-xs">
                  <span className="text-muted-foreground">Output: </span>
                  <span className="text-primary font-semibold">{ex.output}</span>
                </div>
                {ex.explanation && (
                  <div className="text-xs text-muted-foreground italic">{ex.explanation}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
