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

// Helper to calculate cell color based on submissions and acceptance ratio
function getCellColor(submissions: number, accepted: number, maxSub: number) {
  if (submissions <= 0) {
    return { bg: 'rgba(255,255,255,0.04)', edge: 'rgba(255,255,255,0.08)' };
  }
  
  const ratio = accepted / submissions;
  // hue: 10 (red) -> 125 (green) based on acceptance ratio
  const hue = 10 + ratio * 115;
  // intensity based on submissions volume
  const t = Math.min(submissions / Math.max(1, maxSub), 1);
  
  // Dark theme colors - neon but controlled
  const sat = 70 + t * 22;
  const light = 26 + t * 22;
  const bg = `hsl(${hue} ${sat}% ${light}%)`;
  const edge = `hsla(${hue} ${sat}% ${38 + t * 24}% / 0.35)`;
  
  return { bg, edge };
}

export const GlyphTile = memo(function GlyphTile({
  day,
  isSelected,
  isInFuture,
  onMouseDown,
  onMouseEnter,
}: GlyphTileProps) {
  const { submissions, accepted, solved, hardSolved, wrong, isActive } = day;
  
  // Calculate max submissions for normalization (use 12 as typical max)
  const maxSub = 12;
  const acceptanceRatio = submissions > 0 ? accepted / submissions : 0;
  
  if (isInFuture) {
    return (
      <div
        className="rounded-md"
        style={{ 
          width: TILE_SIZE, 
          height: TILE_SIZE,
          background: 'rgba(255,255,255,0.04)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
        }}
        aria-hidden="true"
      />
    );
  }
  
  const colors = getCellColor(submissions, accepted, maxSub);
  const isEmpty = !isActive;
  
  return (
    <button
      type="button"
      className={cn(
        "relative rounded-md cursor-pointer transition-all duration-150 p-0 border-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background z-10",
        isEmpty && "cursor-default"
      )}
      style={{ 
        width: TILE_SIZE, 
        height: TILE_SIZE,
        background: colors.bg,
        boxShadow: `inset 0 0 0 1px ${colors.edge}`,
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      tabIndex={isEmpty ? -1 : 0}
      aria-label={`${day.date}: ${submissions} submissions, ${accepted} accepted, ${solved} solved${hardSolved > 0 ? `, ${hardSolved} hard` : ''}`}
    >
      {!isEmpty && (
        <>
          {/* Glyph Face - Two eyes */}
          <div 
            className="absolute rounded-md"
            style={{
              inset: 0,
              background: colors.bg,
            }}
          >
            {/* Left eye */}
            <div
              className="absolute rounded-full"
              style={{
                width: 4,
                height: 4,
                background: 'rgba(0,0,0,0.55)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
                top: 7,
                left: 3,
              }}
            />
            {/* Right eye */}
            <div
              className="absolute rounded-full"
              style={{
                width: 4,
                height: 4,
                background: 'rgba(0,0,0,0.55)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
                top: 7,
                right: 3,
              }}
            />
          </div>
          
          {/* Hard marker - Blue triangle at top center */}
          {hardSolved > 0 && (
            <div 
              className="absolute"
              style={{
                top: -2,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: '7px solid rgba(90,190,255,0.95)',
                filter: 'drop-shadow(0 0 6px rgba(90,190,255,0.55))',
              }}
            />
          )}
          
          {/* Wrong marker - Red dash for low acceptance (<35%) */}
          {submissions > 0 && acceptanceRatio < 0.35 && (
            <div
              className="absolute rounded-full"
              style={{
                left: 3,
                right: 3,
                top: 2,
                height: 4,
                background: 'rgba(255,60,60,0.88)',
                boxShadow: '0 0 8px rgba(255,60,60,0.35)',
              }}
            />
          )}
          
          {/* Unique problems marker - Three dots at bottom */}
          {solved > 0 && (
            <div
              className="absolute flex gap-0.5"
              style={{
                bottom: 2,
                left: '50%',
                transform: 'translateX(-50%)',
                opacity: 0.85,
              }}
            >
              {Array.from({ length: Math.min(solved, 3) }).map((_, i) => (
                <i 
                  key={i}
                  className="rounded-full"
                  style={{
                    width: 2,
                    height: 2,
                    background: 'rgba(255,255,255,0.62)',
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </button>
  );
});
