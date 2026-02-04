import { SelectionSummary } from '@/lib/glyphHeatmapData';
import { Button } from '@/components/ui/button';
import { X, Clock, Target, CheckCircle2, Zap, Diamond } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlyphSelectionPanelProps {
  summary: SelectionSummary;
  onReset: () => void;
}

export function GlyphSelectionPanel({ summary, onReset }: GlyphSelectionPanelProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };
  
  return (
    <div className={cn(
      "absolute right-0 top-0 bottom-0 w-64 p-4",
      "bg-card/95 backdrop-blur-sm border-l border-border",
      "animate-in slide-in-from-right-5 duration-200",
      "flex flex-col"
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm">Selected Days</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={onReset}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground mb-4">
        {summary.dateRange}
      </div>
      
      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
          <Target className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Days Selected</p>
            <p className="font-semibold">{summary.daysCount}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
          <CheckCircle2 className="h-4 w-4 text-status-success" />
          <div>
            <p className="text-xs text-muted-foreground">Problems Solved</p>
            <p className="font-semibold">{summary.totalProblems}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
          <Zap className="h-4 w-4 text-status-warning" />
          <div>
            <p className="text-xs text-muted-foreground">Acceptance Rate</p>
            <p className={cn(
              "font-semibold",
              summary.acceptanceRate >= 70 ? "text-status-success" :
              summary.acceptanceRate >= 40 ? "text-status-warning" :
              "text-destructive"
            )}>
              {summary.acceptanceRate.toFixed(1)}%
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
          <Diamond className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Hard Solved</p>
            <p className="font-semibold">{summary.hardSolved}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Time Spent</p>
            <p className="font-semibold">{formatTime(summary.totalTimeMin)}</p>
          </div>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onReset}
        className="mt-4"
      >
        Reset Selection
      </Button>
    </div>
  );
}
