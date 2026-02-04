import { cn } from '@/lib/utils';
import { TILE_SIZE } from '@/lib/glyphHeatmapData';

export function GlyphLegend() {
  // Sample fill levels for the legend
  const fillLevels = [0, 0.25, 0.5, 0.75, 1];
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-border/50">
      {/* Volume Legend */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Less</span>
        <div className="flex gap-1.5">
          {fillLevels.map((fill, i) => (
            <div
              key={i}
              className="rounded relative overflow-hidden"
              style={{
                width: TILE_SIZE,
                height: TILE_SIZE,
                backgroundColor: 'hsl(var(--muted) / 0.15)',
              }}
            >
              <div
                className="absolute bottom-0 left-0 right-0 rounded-b"
                style={{
                  height: `${fill * 100}%`,
                  backgroundColor: fill === 0 
                    ? 'transparent' 
                    : `hsl(120, ${60 + fill * 20}%, ${45 + (1 - fill) * 10}%)`,
                  minHeight: fill > 0 ? '15%' : 0,
                }}
              />
            </div>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">More</span>
      </div>
      
      {/* Hue Legend */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Acceptance:</span>
        <div className="flex items-center gap-1">
          <div 
            className="w-4 h-3 rounded-sm"
            style={{ backgroundColor: 'hsl(0, 70%, 50%)' }}
          />
          <span className="text-xs text-muted-foreground">Low</span>
        </div>
        <div 
          className="w-8 h-3 rounded-sm"
          style={{ 
            background: 'linear-gradient(to right, hsl(0, 70%, 50%), hsl(60, 70%, 50%), hsl(120, 70%, 50%))'
          }}
        />
        <div className="flex items-center gap-1">
          <div 
            className="w-4 h-3 rounded-sm"
            style={{ backgroundColor: 'hsl(120, 70%, 45%)' }}
          />
          <span className="text-xs text-muted-foreground">High</span>
        </div>
      </div>
      
      {/* Markers Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
          </div>
          <span>Unique problems</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div 
            className="w-0 h-0"
            style={{
              borderLeft: '5px solid transparent',
              borderTop: '5px solid hsl(var(--primary))',
            }}
          />
          <span>Hard solved</span>
        </div>
      </div>
    </div>
  );
}
