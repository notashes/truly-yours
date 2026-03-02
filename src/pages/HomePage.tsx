import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentStore } from '@/store/useContentStore';
import { WeatherDisplay } from '@/components/weather/WeatherDisplay';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { useDragReorder } from '@/hooks/useDragReorder';
import { useHaptic } from '@/hooks/useHaptic';
import type { HomeItem } from '@/types/content';

function getPrefixedId(item: HomeItem): string {
  return item.type === 'protocol' ? `p:${item.id}` : `c:${item.id}`;
}

export function HomePage() {
  const navigate = useNavigate();
  const { homeItems, allModes, reorderHome } = useContentStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const haptic = useHaptic();
  const lastOverRef = useRef<number | null>(null);

  const { containerRef, getItemProps, dragState } = useDragReorder({
    items: homeItems,
    columns: 2,
    onReorder: (reordered) => {
      reorderHome(reordered.map(getPrefixedId));
      haptic.drop();
    },
    getId: getPrefixedId,
    enabled: isEditMode,
    onActivate: () => {
      setIsEditMode(true);
      haptic.pickup();
    },
  });

  // Haptic tick when hovering over a new grid slot
  useEffect(() => {
    if (dragState.isDragging && dragState.overIndex !== null && dragState.overIndex !== lastOverRef.current) {
      haptic.tick();
    }
    lastOverRef.current = dragState.overIndex;
  }, [dragState.isDragging, dragState.overIndex, haptic]);

  // Whether a drag or drop animation is actively happening
  const isActiveDrag = dragState.phase === 'dragging' || dragState.phase === 'dropping';

  return (
    <div className="px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[28px] font-bold text-on-surface tracking-tight">Truly Yours</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            {isEditMode ? 'Drag to rearrange' : 'What would you like to do?'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <button
              onClick={() => setIsEditMode(false)}
              className="px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-medium
                transition-all active:scale-95"
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={() => { setIsEditMode(true); haptic.pickup(); }}
                className="p-2 rounded-full hover:bg-surface-variant transition-colors"
                title="Rearrange items"
              >
                <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <WeatherDisplay />
            </>
          )}
        </div>
      </div>

      {/* Mode switcher — only show when there are user modes and not editing */}
      {allModes.length > 1 && !isEditMode && (
        <div className="mb-6">
          <ModeSwitcher />
        </div>
      )}

      {/* Unified home grid */}
      <div
        ref={containerRef}
        className="grid grid-cols-2 gap-3"
        style={isEditMode || dragState.isDragging ? { touchAction: 'none' } : undefined}
      >
        {homeItems.map((item, i) => {
          const prefixedId = getPrefixedId(item);
          const itemProps = getItemProps(item, i);
          const isDraggedCard = dragState.draggedId === prefixedId;

          if (item.type === 'protocol') {
            const protocol = item.data;
            return (
              <button
                key={prefixedId}
                ref={itemProps.ref}
                onPointerDown={itemProps.onPointerDown}
                onClick={() => {
                  if (isEditMode || dragState.isDragging) return;
                  navigate(`/protocol/${protocol.id}`);
                }}
                className={`bg-surface-container-low rounded-[20px] p-5
                  flex flex-col items-center gap-3 text-center select-none
                  ${isDraggedCard
                    ? 'drag-lifted z-50'
                    : isEditMode && !isActiveDrag
                      ? 'animate-wiggle cursor-grab'
                      : isEditMode && isActiveDrag
                        ? 'cursor-grab'
                        : 'hover:bg-surface-container transition-all active:scale-[0.97] ripple cursor-pointer'
                  }`}
                style={{
                  willChange: isEditMode || dragState.isDragging ? 'transform' : undefined,
                  animationDelay: isEditMode && !isActiveDrag && !isDraggedCard ? `${i * 60}ms` : undefined,
                }}
              >
                <div className={`w-12 h-12 rounded-full bg-primary-container flex items-center justify-center
                  transition-transform duration-200
                  ${isDraggedCard && dragState.phase === 'dragging' ? 'scale-110' : ''}`}>
                  <span className="text-2xl">{protocol.emoji}</span>
                </div>
                <span className="text-sm font-medium text-on-surface leading-tight">{protocol.name}</span>
              </button>
            );
          }

          // Checklist card
          const checklist = item.data;
          return (
            <button
              key={prefixedId}
              ref={itemProps.ref}
              onPointerDown={itemProps.onPointerDown}
              onClick={() => {
                if (isEditMode || dragState.isDragging) return;
                navigate(`/manage/checklists/${checklist.id}`);
              }}
              className={`bg-surface-container-low rounded-[20px] p-5
                flex flex-col items-center gap-3 text-center select-none
                ${isDraggedCard
                  ? 'drag-lifted z-50'
                  : isEditMode && !isActiveDrag
                    ? 'animate-wiggle cursor-grab'
                    : isEditMode && isActiveDrag
                      ? 'cursor-grab'
                      : 'hover:bg-surface-container transition-all active:scale-[0.97] ripple cursor-pointer'
                }`}
              style={{
                willChange: isEditMode || dragState.isDragging ? 'transform' : undefined,
                animationDelay: isEditMode && !isActiveDrag && !isDraggedCard ? `${i * 60}ms` : undefined,
              }}
            >
              <div className={`w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center
                transition-transform duration-200
                ${isDraggedCard && dragState.phase === 'dragging' ? 'scale-110' : ''}`}>
                <span className="text-2xl">{checklist.emoji}</span>
              </div>
              <span className="text-sm font-medium text-on-surface leading-tight">{checklist.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
