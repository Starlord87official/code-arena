import { cn } from '@/lib/utils';

export function GlyphLegend() {
  return (
    <div 
      className={cn(
        "flex flex-wrap justify-between items-center gap-4 mt-4 pt-4",
        "border-t border-border/30 text-muted-foreground text-sm"
      )}
    >
      {/* Volume Legend */}
      <div className="flex items-center gap-2">
        <span>Less</span>
        <div 
          className="w-[18px] h-2 rounded-full"
          style={{ 
            background: 'rgba(255,255,255,0.06)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        />
        <div 
          className="w-[18px] h-2 rounded-full"
          style={{ background: 'rgba(0,255,120,0.22)' }}
        />
        <div 
          className="w-[18px] h-2 rounded-full"
          style={{ background: 'rgba(0,255,120,0.35)' }}
        />
        <div 
          className="w-[18px] h-2 rounded-full"
          style={{ background: 'rgba(0,255,120,0.52)' }}
        />
        <div 
          className="w-[18px] h-2 rounded-full"
          style={{ background: 'rgba(0,255,120,0.72)' }}
        />
        <span>More</span>
      </div>
      
      {/* Acceptance Legend */}
      <div className="flex items-center gap-2">
        <span>Acceptance:</span>
        <span 
          className="inline-flex items-center justify-center h-5 px-2.5 rounded-full border text-xs"
          style={{ 
            borderColor: 'rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            color: 'rgba(255,90,90,0.95)',
          }}
        >
          Low
        </span>
        <div 
          className="w-[72px] h-5 rounded-full border"
          style={{
            background: 'linear-gradient(90deg, rgba(255,90,90,0.85), rgba(255,190,90,0.9), rgba(90,255,160,0.9))',
            borderColor: 'rgba(255,255,255,0.10)',
          }}
        />
        <span 
          className="inline-flex items-center justify-center h-5 px-2.5 rounded-full border text-xs"
          style={{ 
            borderColor: 'rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            color: 'rgba(90,255,160,0.95)',
          }}
        >
          High
        </span>
      </div>
      
      {/* Marker Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="flex gap-0.5">
            <i className="w-[3px] h-[3px] rounded-full bg-white/50" />
            <i className="w-[3px] h-[3px] rounded-full bg-white/50" />
            <i className="w-[3px] h-[3px] rounded-full bg-white/50" />
          </span>
          <span>Unique problems</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span 
            className="inline-block w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '9px solid rgba(90,190,255,0.95)',
              filter: 'drop-shadow(0 0 6px rgba(90,190,255,0.45))',
            }}
          />
          <span>Hard solved</span>
        </div>
      </div>
    </div>
  );
}
