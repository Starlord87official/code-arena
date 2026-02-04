import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { format, startOfWeek, addMonths, isBefore } from 'date-fns';
import {
  GlyphDayData,
  ProcessedGlyphDay,
  GlyphMetric,
  TrailPoint,
  processGlyphData,
  generateMockGlyphData,
  generateStoryInsights,
  calculateSelectionSummary,
  TILE_SIZE,
  TILE_GAP,
} from '@/lib/glyphHeatmapData';
import { GlyphTile } from './GlyphTile';
import { GlyphTooltip } from './GlyphTooltip';
import { GlyphSelectionPanel } from './GlyphSelectionPanel';
import { GlyphStoryInsights } from './GlyphStoryInsights';
import { GlyphLegend } from './GlyphLegend';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface GlyphHeatmapProps {
  data?: GlyphDayData[];
  className?: string;
}

export function GlyphHeatmap({ data, className }: GlyphHeatmapProps) {
  const [metric, setMetric] = useState<GlyphMetric>('submissions');
  const [hoveredDay, setHoveredDay] = useState<ProcessedGlyphDay | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use provided data or generate mock data
  const rawData = useMemo(() => data || generateMockGlyphData(), [data]);
  
  // Process data based on selected metric
  const { weeks, trailPoints, p95Value } = useMemo(
    () => processGlyphData(rawData, metric),
    [rawData, metric]
  );
  
  // Generate story insights
  const insights = useMemo(() => generateStoryInsights(rawData), [rawData]);
  
  // Calculate selection summary
  const selectionSummary = useMemo(() => {
    if (selectedDays.size === 0) return null;
    
    const days = weeks.flat().filter(d => selectedDays.has(d.date));
    return calculateSelectionSummary(days);
  }, [selectedDays, weeks]);
  
  // Generate month labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const firstDay = week.find(d => d.date);
      if (firstDay) {
        const month = firstDay.dateObj.getMonth();
        if (month !== lastMonth) {
          labels.push({
            month: format(firstDay.dateObj, 'MMM'),
            weekIndex,
          });
          lastMonth = month;
        }
      }
    });
    
    return labels;
  }, [weeks]);
  
  // Handle selection
  const handleMouseDown = useCallback((day: ProcessedGlyphDay) => {
    setIsSelecting(true);
    setSelectedDays(new Set([day.date]));
  }, []);
  
  const handleMouseEnter = useCallback((day: ProcessedGlyphDay, event: React.MouseEvent) => {
    // Update hover state
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setHoverPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
    setHoveredDay(day);
    
    // Extend selection if dragging
    if (isSelecting) {
      setSelectedDays(prev => new Set([...prev, day.date]));
    }
  }, [isSelecting]);
  
  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setHoveredDay(null);
  }, []);
  
  const resetSelection = useCallback(() => {
    setSelectedDays(new Set());
  }, []);
  
  // Global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsSelecting(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);
  
  const today = new Date();
  const cellSize = TILE_SIZE + TILE_GAP;
  const gridWidth = weeks.length * cellSize;
  const gridHeight = 7 * cellSize;
  
  return (
    <div className={cn("relative", className)}>
      {/* Story Insights */}
      <GlyphStoryInsights insights={insights} />
      
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Metric:</span>
          <Select value={metric} onValueChange={(v) => setMetric(v as GlyphMetric)}>
            <SelectTrigger className="w-[140px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="submissions">Submissions</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {rawData.filter(d => d.submissions > 0).length} active days this year
        </div>
      </div>
      
      {/* Main Heatmap Container */}
      <div 
        ref={containerRef}
        className={cn(
          "relative py-4 px-4 rounded-xl overflow-hidden",
          "bg-card/50 backdrop-blur-sm border border-border/50",
          "shadow-lg",
          selectionSummary && "pr-72"
        )}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Month Labels */}
        <div 
          className="flex mb-2 ml-12 text-sm text-muted-foreground select-none relative" 
          style={{ height: 22 }}
        >
          {monthLabels.map(({ month, weekIndex }) => (
            <span
              key={`${month}-${weekIndex}`}
              className="font-medium absolute"
              style={{
                left: weekIndex * cellSize + 2,
                letterSpacing: '0.02em',
              }}
            >
              {month}
            </span>
          ))}
        </div>
        
        {/* Day Labels + Grid */}
        <div className="flex gap-3">
          {/* Day labels */}
          <div 
            className="grid text-sm text-muted-foreground select-none"
            style={{ 
              height: gridHeight,
              gridTemplateRows: `repeat(7, ${TILE_SIZE}px)`,
              gap: TILE_GAP,
              alignContent: 'start',
              paddingTop: 2,
            }}
          >
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>
          
          {/* Scrollable Grid */}
          <div className="overflow-x-auto flex-1 relative pb-4">
            <div 
              className="relative"
              style={{ 
                width: gridWidth,
                height: gridHeight,
              }}
            >
              {/* Trail SVG - Connects hard solve days */}
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{ width: gridWidth, height: gridHeight }}
              >
                <defs>
                  <filter id="trail-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Trail line connecting hard solve days */}
                {trailPoints.length >= 2 && (
                  <path
                    d={trailPoints
                      .map((p, i) => {
                        const x = p.weekIndex * cellSize + TILE_SIZE / 2;
                        const y = p.dayOfWeek * cellSize + TILE_SIZE / 2;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="rgba(90, 190, 255, 0.95)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#trail-glow)"
                  />
                )}
                
                {/* Point markers on hard solve days */}
                {trailPoints.map((p) => (
                  <circle
                    key={p.date}
                    cx={p.weekIndex * cellSize + TILE_SIZE / 2}
                    cy={p.dayOfWeek * cellSize + TILE_SIZE / 2}
                    r={3}
                    fill="rgba(90, 190, 255, 0.95)"
                    filter="url(#trail-glow)"
                  />
                ))}
              </svg>
              
              {/* Tiles Grid */}
              <div className="flex" style={{ gap: TILE_GAP }}>
                {weeks.map((week, weekIndex) => (
                  <div 
                    key={weekIndex} 
                    className="grid"
                    style={{ 
                      gridTemplateRows: `repeat(7, ${TILE_SIZE}px)`,
                      gap: TILE_GAP,
                    }}
                  >
                    {week.map((day) => {
                      const isInFuture = isBefore(today, day.dateObj);
                      return (
                        <div
                          key={day.date}
                          onMouseEnter={(e) => handleMouseEnter(day, e)}
                        >
                          <GlyphTile
                            day={day}
                            isSelected={selectedDays.has(day.date)}
                            isInFuture={isInFuture}
                            onMouseDown={() => handleMouseDown(day)}
                            onMouseEnter={() => {}}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Scrollbar indicator */}
            <div 
              className="absolute left-0 right-0 bottom-0 h-2.5 rounded-full"
              style={{ 
                background: 'rgba(255,255,255,0.08)',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.35)',
              }}
            >
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: '52%',
                  marginLeft: '24%',
                  background: 'rgba(255,255,255,0.18)',
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Tooltip */}
        {hoveredDay && !isSelecting && (
          <GlyphTooltip
            day={hoveredDay}
            position={hoverPosition}
            containerRect={containerRef.current?.getBoundingClientRect() ?? null}
          />
        )}
        
        {/* Selection Panel */}
        {selectionSummary && (
          <GlyphSelectionPanel
            summary={selectionSummary}
            onReset={resetSelection}
          />
        )}
      </div>
      
      {/* Legend */}
      <GlyphLegend />
    </div>
  );
}
