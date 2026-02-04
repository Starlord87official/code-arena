import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { format, startOfWeek, addMonths, isBefore } from 'date-fns';
import {
  GlyphDayData,
  ProcessedGlyphDay,
  GlyphMetric,
  StreakSegment,
  processGlyphData,
  generateMockGlyphData,
  generateStoryInsights,
  calculateSelectionSummary,
  TILE_WIDTH,
  TILE_HEIGHT,
  TILE_GAP_H,
  TILE_GAP_V,
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
  const { weeks, streaks, p95Value } = useMemo(
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
  const gridWidth = weeks.length * (TILE_WIDTH + TILE_GAP_H);
  const gridHeight = 7 * (TILE_HEIGHT + TILE_GAP_V);
  
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
          "relative py-10 px-8 rounded-xl overflow-hidden",
          "bg-card/50 backdrop-blur-sm border border-border/50",
          selectionSummary && "pr-72"
        )}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Month Labels */}
        <div className="flex mb-6 ml-14 text-xs text-muted-foreground select-none relative" style={{ height: 20 }}>
          {monthLabels.map(({ month, weekIndex }, i) => (
            <span
              key={`${month}-${weekIndex}`}
              className="font-medium"
              style={{
                position: 'absolute',
                left: weekIndex * (TILE_WIDTH + TILE_GAP_H),
              }}
            >
              {month}
            </span>
          ))}
        </div>
        
        {/* Day Labels + Grid */}
        <div className="flex">
          {/* Day labels */}
          <div 
            className="flex flex-col justify-between text-sm text-muted-foreground mr-4 select-none font-medium py-1"
            style={{ height: gridHeight }}
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
          <div className="overflow-x-auto flex-1">
            <div 
              className="relative"
              style={{ 
                width: gridWidth,
                height: gridHeight,
              }}
            >
              {/* Streak Paths - SVG layer */}
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{ width: gridWidth, height: gridHeight }}
              >
                <defs>
                  <filter id="streak-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {streaks.map((streak, i) => (
                  <StreakPath key={i} streak={streak} />
                ))}
              </svg>
              
              {/* Tiles Grid */}
              <div className="flex" style={{ gap: TILE_GAP_H }}>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col" style={{ gap: TILE_GAP_V }}>
                    {week.map((day, dayIndex) => {
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

// Streak Path Component
function StreakPath({ streak }: { streak: StreakSegment }) {
  const cellWidth = TILE_WIDTH + TILE_GAP_H;
  const cellHeight = TILE_HEIGHT + TILE_GAP_V;
  const halfTileW = TILE_WIDTH / 2;
  const halfTileH = TILE_HEIGHT / 2;
  
  // Build path points
  const points: { x: number; y: number }[] = [];
  
  let currentWeek = streak.startWeek;
  let currentDay = streak.startDay;
  
  while (
    currentWeek < streak.endWeek ||
    (currentWeek === streak.endWeek && currentDay <= streak.endDay)
  ) {
    const x = currentWeek * cellWidth + halfTileW;
    const y = currentDay * cellHeight + halfTileH;
    points.push({ x, y });
    
    // Move to next day
    currentDay++;
    if (currentDay > 6) {
      currentDay = 0;
      currentWeek++;
    }
  }
  
  if (points.length < 2) return null;
  
  // Create smooth path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    const prev = points[i - 1];
    
    // Simple line for adjacent cells
    if (Math.abs(p.x - prev.x) <= cellWidth && Math.abs(p.y - prev.y) <= cellHeight) {
      pathD += ` L ${p.x} ${p.y}`;
    } else {
      // Curved path for week transitions
      const midX = (prev.x + p.x) / 2;
      pathD += ` Q ${midX} ${prev.y} ${p.x} ${p.y}`;
    }
  }
  
  const strokeWidth = Math.min(2 + streak.length * 0.06, 3.5);
  
  return (
    <path
      d={pathD}
      fill="none"
      stroke="hsl(var(--primary) / 0.4)"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#streak-glow)"
    />
  );
}
