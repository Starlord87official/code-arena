import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SolvedProblemsHeaderProps {
  totalSolved: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  selectedDifficulty?: string;
  onDifficultyChange?: (difficulty: string | null) => void;
}

export function SolvedProblemsHeader({
  totalSolved = 524,
  easyCount = 145,
  mediumCount = 317,
  hardCount = 62,
  selectedDifficulty,
  onDifficultyChange,
}: SolvedProblemsHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Total Solved with navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <span className="font-display text-3xl font-bold text-foreground">{totalSolved}</span>
          <span className="text-lg text-muted-foreground">Total Solved</span>
        </div>
      </div>

      {/* Difficulty breakdown */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">☐</span>
          <span className="font-bold text-foreground">{easyCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">☐</span>
          <span className="font-bold text-foreground">{mediumCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">🔒</span>
          <span className="font-bold text-foreground">{hardCount}</span>
        </div>
        <span className="text-muted-foreground">Hard</span>
        
        <div className="ml-auto flex items-center gap-4">
          <span className="text-muted-foreground">Progression</span>
          <Badge variant="outline" className="text-primary border-primary/30">
            ⚡ 21 Days
          </Badge>
          <Badge variant="outline" className="text-primary border-primary/30">
            3.5 Days
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Recent</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="text-muted-foreground">
          Difficulty <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
        <Badge variant="outline" className="bg-status-success/10 text-status-success border-status-success/30">
          ⊟ Easy
        </Badge>
        <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning/30">
          ● Medium
        </Badge>
        <Badge 
          className={cn(
            "cursor-pointer",
            selectedDifficulty === 'hard' 
              ? "bg-destructive text-destructive-foreground" 
              : "bg-destructive/20 text-destructive border-destructive/30"
          )}
          onClick={() => onDifficultyChange?.(selectedDifficulty === 'hard' ? null : 'hard')}
        >
          ● Hard <ChevronRight className="h-3 w-3 ml-1" />
        </Badge>
        <Badge className="bg-primary text-primary-foreground">
          ⚡ Terns Sherd.
        </Badge>
        <Badge variant="outline" className="text-muted-foreground">
          ⚡ Dynamic Programming
        </Badge>
        <Badge variant="outline" className="text-muted-foreground">
          ⊕ Binary Search
        </Badge>
        <Badge variant="outline" className="text-muted-foreground">
          ⊗ Prefix Sum
        </Badge>
      </div>

      {/* Secondary info row */}
      <div className="flex items-center gap-4">
        <span className="font-display text-2xl font-bold text-foreground">{totalSolved}</span>
        <span className="text-muted-foreground">Total Solved</span>
        
        <div className="flex items-center gap-2 ml-4">
          <Badge variant="outline" className="text-status-success border-status-success/30 text-xs">
            ⚡ Memori probs aluing stary
          </Badge>
          <span className="text-muted-foreground text-sm">⚡ Majority Element with high DP focus.</span>
        </div>

        <Button variant="outline" size="sm" className="ml-auto text-muted-foreground">
          Clear All <X className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-4 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort By</span>
          <Badge variant="outline" className="text-muted-foreground">
            ○✕
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">FILENS. ⊜s'pand</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Recent</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
