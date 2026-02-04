import { ProcessedGlyphDay } from '@/lib/glyphHeatmapData';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface GlyphTooltipProps {
  day: ProcessedGlyphDay;
  position: { x: number; y: number };
  containerRect: DOMRect | null;
}

export function GlyphTooltip({ day, position, containerRect }: GlyphTooltipProps) {
  if (!containerRect) return null;
  
  const tooltipWidth = 200;
  const tooltipHeight = 140;
  
  // Calculate position to avoid clipping
  let left = position.x;
  let top = position.y - tooltipHeight - 8;
  
  // Adjust horizontal position
  if (left + tooltipWidth > containerRect.width) {
    left = containerRect.width - tooltipWidth - 8;
  }
  if (left < 8) {
    left = 8;
  }
  
  // Flip to bottom if not enough space on top
  if (top < 8) {
    top = position.y + 20;
  }
  
  const acceptanceRate = day.submissions > 0 
    ? ((day.accepted / day.submissions) * 100).toFixed(0)
    : '0';
  
  return (
    <div
      className={cn(
        "absolute z-50 p-3 rounded-lg",
        "bg-popover/95 backdrop-blur-sm border border-border shadow-xl",
        "text-popover-foreground text-xs",
        "animate-in fade-in-0 zoom-in-95 duration-100"
      )}
      style={{
        left,
        top,
        width: tooltipWidth,
      }}
    >
      {/* Date header */}
      <div className="font-semibold text-sm mb-2 text-foreground">
        {format(new Date(day.date), 'EEEE, MMM d, yyyy')}
      </div>
      
      {day.submissions === 0 ? (
        <p className="text-muted-foreground">No activity</p>
      ) : (
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Submissions</span>
            <span className="font-medium">{day.submissions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Accepted</span>
            <span className="font-medium text-status-success">{day.accepted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Wrong</span>
            <span className="font-medium text-destructive">{day.wrong}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Problems Solved</span>
            <span className="font-medium">{day.solved}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Acceptance Rate</span>
            <span className={cn(
              "font-medium",
              Number(acceptanceRate) >= 70 ? "text-status-success" :
              Number(acceptanceRate) >= 40 ? "text-status-warning" :
              "text-destructive"
            )}>
              {acceptanceRate}%
            </span>
          </div>
          {day.hardSolved > 0 && (
            <div className="flex justify-between pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Hard Solved</span>
              <span className="font-medium text-primary">💎 {day.hardSolved}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
