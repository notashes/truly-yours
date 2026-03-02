import { useState } from 'react';
import { useContentStore } from '@/store/useContentStore';
import { BottomSheet } from '@/components/ui/BottomSheet';

export function ModeSwitcher() {
  const { allModes, currentMode, setActiveMode } = useContentStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low hover:bg-surface-container transition-colors"
      >
        <span className="text-sm">{currentMode.emoji}</span>
        <span className="text-sm font-medium text-on-surface">{currentMode.name}</span>
        <svg className="w-4 h-4 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Switch mode">
        <div className="flex flex-col gap-2">
          {allModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id === '__default__' ? null : mode.id);
                setOpen(false);
              }}
              className={`flex items-center gap-3 p-4 rounded-2xl text-left transition-colors
                ${currentMode.id === mode.id
                  ? 'bg-primary-container'
                  : 'hover:bg-surface-container-low'}`}
            >
              <span className="text-xl">{mode.emoji}</span>
              <div className="flex-1">
                <p className={`font-medium text-sm ${currentMode.id === mode.id ? 'text-on-primary-container' : 'text-on-surface'}`}>
                  {mode.name}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {mode.protocolIds.length} protocol{mode.protocolIds.length !== 1 ? 's' : ''}
                </p>
              </div>
              {currentMode.id === mode.id && (
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
