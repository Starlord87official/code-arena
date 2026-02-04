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
  
  const tooltipWidth = 220;
  const tooltipHeight = 160;
  
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
        "absolute z-50 p-3 rounded-xl pointer-events-none",
        "border shadow-xl",
        "text-xs",
        "animate-in fade-in-0 zoom-in-95 duration-100"
      )}
      style={{
        left,
        top,
        width: tooltipWidth,
        background: 'rgba(10,14,24,0.92)',
        borderColor: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
      }}
    >
      {/* Date header */}
      <div 
        className="font-black text-sm mb-1.5"
        style={{ letterSpacing: '0.02em', color: 'rgba(255,255,255,0.92)' }}
      >
        {format(new Date(day.date), 'MMM d, yyyy')}
      </div>
      
      {day.submissions === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.55)' }}>No activity</p>
      ) : (
        <div className="space-y-0.5" style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 1.35 }}>
          <p>Submissions: {day.submissions}</p>
          <p>Accepted: {day.accepted}</p>
          <p>Wrong: {day.wrong}</p>
          <p>Hard: {day.hardSolved} · Unique: {day.solved}</p>
        </div>
      )}
    </div>
  );
}
