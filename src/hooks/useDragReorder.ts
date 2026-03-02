import { useRef, useState, useCallback, useEffect } from 'react';

interface UseDragReorderOptions<T> {
  items: T[];
  columns: number;
  onReorder: (reorderedItems: T[]) => void;
  getId: (item: T) => string;
  enabled: boolean;
  onActivate?: () => void;
}

interface DragState {
  isDragging: boolean;
  draggedId: string | null;
  draggedIndex: number | null;
  overIndex: number | null;
  phase: 'idle' | 'dragging' | 'dropping';
}

const LONG_PRESS_MS = 500;
const GAP = 12; // matches Tailwind gap-3

// Smooth spring with slight overshoot — feels bouncy and alive
const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
// Smooth deceleration for displaced items sliding into place
const SLIDE = 'cubic-bezier(0.25, 1, 0.5, 1)';
const SLIDE_MS = 280;
const DROP_MS = 320;
const PICKUP_MS = 220;

export function useDragReorder<T>({ items, columns, onReorder, getId, enabled, onActivate }: UseDragReorderOptions<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const pointerCurrent = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const draggedEl = useRef<HTMLElement | null>(null);
  const cellSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const containerRectRef = useRef<DOMRect | null>(null);
  const currentOrder = useRef<T[]>(items);
  const startIndexRef = useRef<number>(-1);
  const overIndexRef = useRef<number>(-1);
  const isDraggingRef = useRef(false);
  const animFrameId = useRef<number>(0);

  // Stable refs for callbacks captured by window event listeners
  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const getIdRef = useRef(getId);
  getIdRef.current = getId;
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedId: null,
    draggedIndex: null,
    overIndex: null,
    phase: 'idle',
  });

  // Keep currentOrder in sync when not dragging
  useEffect(() => {
    if (!isDraggingRef.current) {
      currentOrder.current = items;
    }
  }, [items]);

  const measureGrid = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    containerRectRef.current = container.getBoundingClientRect();

    const firstItem = itemRefs.current.values().next().value;
    if (firstItem) {
      const rect = firstItem.getBoundingClientRect();
      cellSize.current = { w: rect.width, h: rect.height };
    }
  }, []);

  const getGridIndex = useCallback((px: number, py: number): number => {
    const cr = containerRectRef.current;
    if (!cr) return 0;
    const { w, h } = cellSize.current;
    if (w === 0 || h === 0) return 0;

    const relX = px - cr.left;
    const relY = py - cr.top;
    const col = Math.floor(relX / (w + GAP));
    const row = Math.floor(relY / (h + GAP));
    const clampedCol = Math.max(0, Math.min(col, columnsRef.current - 1));
    const clampedRow = Math.max(0, row);
    const idx = clampedRow * columnsRef.current + clampedCol;
    return Math.max(0, Math.min(idx, itemsRef.current.length - 1));
  }, []);

  // Animate non-dragged items to their displaced positions
  const animateItems = useCallback((dragIdx: number, overIdx: number) => {
    const cols = columnsRef.current;
    const getId = getIdRef.current;
    itemRefs.current.forEach((el, id) => {
      const itemIndex = currentOrder.current.findIndex(item => getId(item) === id);
      if (itemIndex === dragIdx) return;

      let visualIndex = itemIndex;
      if (dragIdx < overIdx) {
        if (itemIndex > dragIdx && itemIndex <= overIdx) visualIndex = itemIndex - 1;
      } else if (dragIdx > overIdx) {
        if (itemIndex >= overIdx && itemIndex < dragIdx) visualIndex = itemIndex + 1;
      }

      const { w, h } = cellSize.current;
      const origCol = itemIndex % cols;
      const origRow = Math.floor(itemIndex / cols);
      const newCol = visualIndex % cols;
      const newRow = Math.floor(visualIndex / cols);
      const dx = (newCol - origCol) * (w + GAP);
      const dy = (newRow - origRow) * (h + GAP);

      el.style.transition = `transform ${SLIDE_MS}ms ${SLIDE}`;
      el.style.transform = dx === 0 && dy === 0 ? '' : `translate(${dx}px, ${dy}px)`;
    });
  }, []);

  const resetItemTransforms = useCallback(() => {
    itemRefs.current.forEach((el) => {
      el.style.transition = '';
      el.style.transform = '';
      el.style.zIndex = '';
      el.style.willChange = '';
    });
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    pointerCurrent.current = { x: e.clientX, y: e.clientY };

    // Cancel long press if finger moved too far
    if (longPressTimer.current && pointerStart.current) {
      const dx = e.clientX - pointerStart.current.x;
      const dy = e.clientY - pointerStart.current.y;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }

    if (!isDraggingRef.current || !draggedEl.current) return;

    cancelAnimationFrame(animFrameId.current);
    animFrameId.current = requestAnimationFrame(() => {
      const el = draggedEl.current;
      if (!el) return;

      const dx = pointerCurrent.current.x - (pointerStart.current?.x ?? 0);
      const dy = pointerCurrent.current.y - (pointerStart.current?.y ?? 0);

      // Subtle tilt based on horizontal movement — feels natural and alive
      const tilt = Math.max(-4, Math.min(4, dx * 0.015));
      el.style.transform = `translate(${dx}px, ${dy}px) scale(1.06) rotate(${tilt}deg)`;

      const newOverIndex = getGridIndex(pointerCurrent.current.x, pointerCurrent.current.y);
      if (overIndexRef.current !== newOverIndex) {
        overIndexRef.current = newOverIndex;
        animateItems(startIndexRef.current, newOverIndex);
        setDragState(prev => ({ ...prev, overIndex: newOverIndex }));
      }
    });
  }, [getGridIndex, animateItems]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointercancel', handlePointerUp);

    if (isDraggingRef.current && draggedEl.current) {
      const dragIdx = startIndexRef.current;
      const overIdx = overIndexRef.current;
      const el = draggedEl.current;
      const cols = columnsRef.current;
      const { w, h } = cellSize.current;

      // Calculate where the card should land (offset from its DOM position)
      const startCol = dragIdx % cols;
      const startRow = Math.floor(dragIdx / cols);
      const overCol = overIdx % cols;
      const overRow = Math.floor(overIdx / cols);
      const targetDx = (overCol - startCol) * (w + GAP);
      const targetDy = (overRow - startRow) * (h + GAP);

      setDragState(prev => ({ ...prev, phase: 'dropping' }));

      // Smoothly fly the card to its target position with spring bounce
      el.style.transition = `transform ${DROP_MS}ms ${SPRING}`;
      el.style.transform = `translate(${targetDx}px, ${targetDy}px) scale(1) rotate(0deg)`;

      // After the drop animation, commit the reorder
      setTimeout(() => {
        if (dragIdx !== overIdx && dragIdx >= 0 && overIdx >= 0) {
          const reordered = [...currentOrder.current];
          const [moved] = reordered.splice(dragIdx, 1);
          reordered.splice(overIdx, 0, moved);
          onReorderRef.current(reordered);
        }

        resetItemTransforms();
        isDraggingRef.current = false;
        draggedEl.current = null;

        setDragState({
          isDragging: false,
          draggedId: null,
          draggedIndex: null,
          overIndex: null,
          phase: 'idle',
        });
      }, DROP_MS + 30);
    } else {
      isDraggingRef.current = false;
      draggedEl.current = null;
      setDragState({
        isDragging: false,
        draggedId: null,
        draggedIndex: null,
        overIndex: null,
        phase: 'idle',
      });
    }
  }, [handlePointerMove, resetItemTransforms]);

  const startDrag = useCallback((itemId: string, index: number) => {
    measureGrid();
    startIndexRef.current = index;
    overIndexRef.current = index;
    isDraggingRef.current = true;

    const el = itemRefs.current.get(itemId);
    if (el) {
      draggedEl.current = el;
      el.style.zIndex = '50';
      el.style.willChange = 'transform';
      // Smooth spring pickup: card lifts up with a satisfying bounce
      el.style.transition = `transform ${PICKUP_MS}ms ${SPRING}`;
      el.style.transform = 'scale(1.06)';
      // After pickup completes, switch to instant following
      setTimeout(() => {
        if (draggedEl.current === el && isDraggingRef.current) {
          el.style.transition = 'none';
        }
      }, PICKUP_MS);
    }

    setDragState({
      isDragging: true,
      draggedId: itemId,
      draggedIndex: index,
      overIndex: index,
      phase: 'dragging',
    });
  }, [measureGrid]);

  const onPointerDown = useCallback((itemId: string, index: number, e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();

    pointerStart.current = { x: e.clientX, y: e.clientY };
    pointerCurrent.current = { x: e.clientX, y: e.clientY };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    if (enabled) {
      startDrag(itemId, index);
    } else {
      longPressTimer.current = setTimeout(() => {
        longPressTimer.current = null;
        onActivate?.();
        startDrag(itemId, index);
      }, LONG_PRESS_MS);
    }
  }, [enabled, onActivate, startDrag, handlePointerMove, handlePointerUp]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  const getItemProps = useCallback((item: T, index: number) => {
    const id = getId(item);
    return {
      ref: (el: HTMLElement | null) => {
        if (el) itemRefs.current.set(id, el);
        else itemRefs.current.delete(id);
      },
      onPointerDown: (e: React.PointerEvent) => onPointerDown(id, index, e),
      'data-dragging': dragState.draggedId === id,
      'data-index': index,
    };
  }, [getId, onPointerDown, dragState.draggedId]);

  return { containerRef, getItemProps, dragState };
}
