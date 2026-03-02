import { useState, useRef } from 'react';
import { useContentStore } from '@/store/useContentStore';
import { PALETTES, applyPalette, savePaletteId, getStoredPaletteId, type PaletteId } from '@/lib/theme';

export function SettingsPage() {
  const { exportBackup, importBackup } = useContentStore();
  const [activePalette, setActivePalette] = useState<PaletteId>(getStoredPaletteId);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="px-5 pt-12 pb-6">
      <h1 className="text-[28px] font-bold text-on-surface tracking-tight mb-6">Settings</h1>

      {/* Theme */}
      <h2 className="text-sm font-semibold text-on-surface mb-3">Theme</h2>
      <div className="grid grid-cols-2 gap-3">
        {PALETTES.map(palette => {
          const isActive = palette.id === activePalette;
          const swatches = [
            palette.colors['primary'],
            palette.colors['secondary'],
            palette.colors['tertiary'],
            palette.colors['surface-dim'],
            palette.colors['primary-container'],
          ];
          return (
            <button
              key={palette.id}
              onClick={() => {
                setActivePalette(palette.id);
                savePaletteId(palette.id);
                applyPalette(palette.id);
              }}
              className={`rounded-2xl p-4 text-left transition-all
                ${isActive
                  ? 'bg-primary-container ring-2 ring-primary'
                  : 'bg-surface-container-low hover:bg-surface-container'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{palette.emoji}</span>
                <span className="text-sm font-medium text-on-surface flex-1">{palette.name}</span>
                {isActive && (
                  <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mb-3">{palette.description}</p>
              <div className="flex gap-1.5">
                {swatches.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border border-black/10"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Backup / Restore */}
      <div className="mt-10 pt-6 border-t border-outline-variant">
        <h2 className="text-sm font-semibold text-on-surface mb-3">Backup & Restore</h2>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const json = exportBackup();
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `truly-yours-backup-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex-1 py-3 rounded-2xl bg-surface-container-low text-on-surface text-sm font-medium
              hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-3 rounded-2xl bg-surface-container-low text-on-surface text-sm font-medium
              hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Import
          </button>
        </div>
        {importStatus === 'success' && (
          <p className="text-sm text-primary mt-2 text-center">Backup restored successfully!</p>
        )}
        {importStatus === 'error' && (
          <p className="text-sm text-error mt-2 text-center">Invalid backup file. Please try again.</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const ok = importBackup(reader.result as string);
              setImportStatus(ok ? 'success' : 'error');
              setTimeout(() => setImportStatus('idle'), 3000);
            };
            reader.readAsText(file);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
