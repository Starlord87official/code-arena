import { useState, useCallback, useEffect, useRef } from "react";
import type { DayData } from "@/lib/activityData";

export function useActivitySelection(data: DayData[]) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverClientPos, setHoverClientPos] = useState<{ x: number; y: number } | null>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragClientPos, setDragClientPos] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<[number, number] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── tile mouse handlers ─────────────────────────────── */
  const handleMouseDown = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault();

      if (e.shiftKey && selection !== null) {
        const lo = Math.min(selection[0], selection[1], index);
        const hi = Math.max(selection[0], selection[1], index);
        setSelection([lo, hi]);
        return;
      }

      setDragStart(index);
      setDragEnd(index);
      setIsDragging(true);
      setDragClientPos({ x: e.clientX, y: e.clientY });
      setSelection(null);
    },
    [selection]
  );

  const handleMouseEnter = useCallback(
    (index: number, e: React.MouseEvent) => {
      setHoveredIndex(index);
      setHoverClientPos({ x: e.clientX, y: e.clientY });
      if (isDragging) {
        setDragEnd(index);
        setDragClientPos({ x: e.clientX, y: e.clientY });
      }
    },
    [isDragging]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (hoveredIndex !== null) {
        setHoverClientPos({ x: e.clientX, y: e.clientY });
      }
      if (isDragging) {
        setDragClientPos({ x: e.clientX, y: e.clientY });
      }
    },
    [hoveredIndex, isDragging]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    setHoverClientPos(null);
  }, []);

  /* ── global mouseup ──────────────────────────────────── */
  useEffect(() => {
    const up = () => {
      if (isDragging && dragStart !== null && dragEnd !== null) {
        const lo = Math.min(dragStart, dragEnd);
        const hi = Math.max(dragStart, dragEnd);
        if (hi - lo >= 1) {
          setSelection([lo, hi]);
        }
      }
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      setDragClientPos(null);
    };
    document.addEventListener("mouseup", up);
    return () => document.removeEventListener("mouseup", up);
  }, [isDragging, dragStart, dragEnd]);

  const clearSelection = useCallback(() => setSelection(null), []);

  /* ── click-outside to clear ─────────────────────────── */
  useEffect(() => {
    if (selection === null) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelection(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [selection]);

  /* ── derived ─────────────────────────────────────────── */
  const activeRange: [number, number] | null =
    isDragging && dragStart !== null && dragEnd !== null
      ? [Math.min(dragStart, dragEnd), Math.max(dragStart, dragEnd)]
      : selection;

  const selectedDays: DayData[] = activeRange
    ? data.slice(activeRange[0], activeRange[1] + 1)
    : [];

  const hoveredDay = hoveredIndex !== null ? data[hoveredIndex] : null;

  return {
    hoveredDay,
    hoveredIndex,
    hoverClientPos,
    activeRange,
    selectedDays,
    isDragging,
    dragClientPos,
    containerRef,
    handleMouseDown,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
    clearSelection,
  };
}
