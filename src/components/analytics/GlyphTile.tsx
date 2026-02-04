import { memo } from 'react';
import { ProcessedGlyphDay, TILE_SIZE } from '@/lib/glyphHeatmapData';
import { cn } from '@/lib/utils';

interface GlyphTileProps {
  day: ProcessedGlyphDay;
  isSelected: boolean;
  isInFuture: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
}

export const GlyphTile = memo(function GlyphTile({
  day,
  isSelected,
  isInFuture,
  onMouseDown,
  onMouseEnter,
}: GlyphTileProps) {
  const { fillLevel, hue, isActive, solved, hardSolved } = day;
  
  if (isInFuture) {
    return (
      <div
        className="rounded-sm bg-muted/20"
        style={{ width: TILE_SIZE, height: TILE_SIZE }}
        aria-hidden="true"
      />
    );
  }
  
  // Calculate colors based on theme-aware approach
  // Hue: 0 = red (poor acceptance), 60 = yellow (mid), 120 = green (excellent)
  const saturation = isActive ? 60 + fillLevel * 20 : 30;
  const lightness = 45 + (1 - fillLevel) * 10;
  
  const bgColor = isActive 
    ? `hsl(${hue}, ${saturation}%, ${lightness}%)`
    : 'hsl(var(--muted) / 0.3)';
  
  // Dots for unique problems solved (max 3)
  const dots = Math.min(solved, 3);
  
  return (
    <div
      className={cn(
        "relative rounded-sm cursor-pointer transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
        isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background z-10"
      )}
      style={{ 
        width: TILE_SIZE, 
        height: TILE_SIZE,
        backgroundColor: 'hsl(var(--muted) / 0.15)',
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      tabIndex={0}
      role="gridcell"
      aria-label={`${day.date}: ${day.submissions} submissions, ${day.accepted} accepted, ${day.solved} solved${hardSolved > 0 ? `, ${hardSolved} hard` : ''}`}
    >
      {/* Liquid Fill Bar */}
      <div 
        className="absolute bottom-0 left-0 right-0 rounded-b-sm transition-all duration-300"
        style={{
          height: `${fillLevel * 100}%`,
          backgroundColor: bgColor,
          minHeight: isActive ? '15%' : 0,
        }}
      />
      
      {/* Micro Impact Marks - Bottom right dots */}
      {dots > 0 && (
        <div className="absolute bottom-0.5 right-0.5 flex gap-px">
          {Array.from({ length: dots }).map((_, i) => (
            <div 
              key={i}
              className="w-1 h-1 rounded-full bg-background/80"
            />
          ))}
        </div>
      )}
      
      {/* Hard solved indicator - Top right triangle */}
      {hardSolved > 0 && (
        <div 
          className="absolute top-0 right-0 w-0 h-0"
          style={{
            borderLeft: '4px solid transparent',
            borderTop: '4px solid hsl(var(--primary))',
          }}
        />
      )}
    </div>
  );
});
