import { useState, useRef } from 'react';
import { useContentStore } from '@/store/useContentStore';
import { PALETTES, applyPalette, savePaletteId, getStoredPaletteId, isDarkMode, saveDarkMode, type PaletteId } from '@/lib/theme';
import { TEXT_SIZES, getStoredTextSize, saveTextSize, applyTextSize, type TextSizeLevel } from '@/lib/textSize';
import { getReminders, saveReminders, requestNotificationPermission, getNotificationPermission, scheduleReminders, type Reminder } from '@/lib/notifications';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function SettingsPage() {
  const { exportBackup, importBackup, allProtocols } = useContentStore();
  const [activePalette, setActivePalette] = useState<PaletteId>(getStoredPaletteId);
  const [darkMode, setDarkMode] = useState(isDarkMode);
  const [textSize, setTextSize] = useState<TextSizeLevel>(getStoredTextSize);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [reminders, setRemindersState] = useState<Reminder[]>(getReminders);
  const [notifPerm, setNotifPerm] = useState(getNotificationPermission);
  const [addingReminder, setAddingReminder] = useState(false);
  const [newProtocolId, setNewProtocolId] = useState('');
  const [newTime, setNewTime] = useState('21:00');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mainProtocols = Object.values(allProtocols).filter(p => !p.isSubProtocol);

  const handleToggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    saveDarkMode(next);
    applyPalette(activePalette);
  };

  const handleSelectPalette = (id: PaletteId) => {
    setActivePalette(id);
    savePaletteId(id);
    applyPalette(id);
  };

  const handleTextSize = (level: TextSizeLevel) => {
    setTextSize(level);
    saveTextSize(level);
    applyTextSize(level);
  };

  const updateReminders = (updated: Reminder[]) => {
    setRemindersState(updated);
    saveReminders(updated);
    scheduleReminders();
  };

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotifPerm(perm);
    if (perm === 'granted') scheduleReminders();
  };

  const handleAddReminder = () => {
    if (!newProtocolId) return;
    const proto = allProtocols[newProtocolId];
    if (!proto) return;
    const reminder: Reminder = {
      id: `reminder_${Date.now()}`,
      protocolId: newProtocolId,
      protocolName: proto.name,
      protocolEmoji: proto.emoji,
      time: newTime,
      days: [],
      enabled: true,
    };
    updateReminders([...reminders, reminder]);
    setAddingReminder(false);
    setNewProtocolId('');
    setNewTime('21:00');
  };

  const toggleReminderDay = (reminderId: string, day: number) => {
    updateReminders(reminders.map(r => {
      if (r.id !== reminderId) return r;
      const days = r.days.includes(day) ? r.days.filter(d => d !== day) : [...r.days, day];
      return { ...r, days };
    }));
  };

  const toggleReminderEnabled = (reminderId: string) => {
    updateReminders(reminders.map(r =>
      r.id === reminderId ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const deleteReminder = (reminderId: string) => {
    updateReminders(reminders.filter(r => r.id !== reminderId));
  };

  return (
    <div className="px-5 pt-12 pb-6">
      <h1 className="text-[28px] font-bold text-on-surface tracking-tight mb-6">Settings</h1>

      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-on-surface">Dark Mode</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Easier on the eyes at night</p>
        </div>
        <button
          onClick={handleToggleDark}
          className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
            darkMode ? 'bg-primary' : 'bg-outline-variant'
          }`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
              darkMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Theme */}
      <h2 className="text-sm font-semibold text-on-surface mb-3">Theme</h2>
      <div className="grid grid-cols-2 gap-3">
        {PALETTES.map(palette => {
          const isActive = palette.id === activePalette;
          const displayColors = darkMode ? palette.darkColors : palette.colors;
          const swatches = [
            displayColors['primary'],
            displayColors['secondary'],
            displayColors['tertiary'],
            displayColors['surface-dim'],
            displayColors['primary-container'],
          ];
          return (
            <button
              key={palette.id}
              onClick={() => handleSelectPalette(palette.id)}
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

      {/* Text Size */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-on-surface mb-1">Text Size</h2>
        <p className="text-xs text-on-surface-variant mb-3">Adjust for comfortable reading</p>
        <div className="flex gap-2">
          {TEXT_SIZES.map(size => {
            const isActive = size.id === textSize;
            return (
              <button
                key={size.id}
                onClick={() => handleTextSize(size.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}`}
              >
                {size.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reminders */}
      <div className="mt-8 pt-6 border-t border-outline-variant">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-on-surface">Reminders</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Gentle nudges for your routines</p>
          </div>
          {notifPerm === 'granted' && (
            <button
              onClick={() => setAddingReminder(true)}
              className="p-2 rounded-full hover:bg-surface-variant transition-colors"
            >
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          )}
        </div>

        {notifPerm !== 'granted' && notifPerm !== 'unsupported' && (
          <button
            onClick={handleEnableNotifications}
            className="w-full py-3 rounded-2xl bg-primary text-on-primary text-sm font-medium transition-all active:scale-[0.97]"
          >
            Enable Notifications
          </button>
        )}

        {notifPerm === 'unsupported' && (
          <p className="text-xs text-on-surface-variant text-center py-4">Notifications are not supported in this browser</p>
        )}

        {notifPerm === 'denied' && (
          <p className="text-xs text-on-surface-variant text-center py-4">Notifications are blocked. Enable them in your browser settings.</p>
        )}

        {notifPerm === 'granted' && (
          <div className="flex flex-col gap-3">
            {reminders.length === 0 && !addingReminder && (
              <p className="text-xs text-on-surface-variant text-center py-4">No reminders yet. Tap + to add one.</p>
            )}

            {reminders.map(r => (
              <div key={r.id} className={`bg-surface-container-low rounded-2xl p-4 ${!r.enabled ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{r.protocolEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{r.protocolName}</p>
                    <p className="text-xs text-on-surface-variant">{r.time}</p>
                  </div>
                  <button
                    onClick={() => toggleReminderEnabled(r.id)}
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                      r.enabled ? 'bg-primary' : 'bg-outline-variant'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        r.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="p-1.5 rounded-full hover:bg-error-container transition-colors"
                  >
                    <svg className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Day-of-week toggles */}
                <div className="flex gap-1">
                  {DAY_LABELS.map((label, idx) => {
                    const active = r.days.length === 0 || r.days.includes(idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleReminderDay(r.id, idx)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                          active
                            ? 'bg-primary/15 text-primary'
                            : 'bg-surface-container text-outline'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {r.days.length === 0 && (
                  <p className="text-[10px] text-on-surface-variant mt-1 text-center">Every day (tap days to customize)</p>
                )}
              </div>
            ))}

            {/* Add reminder form */}
            {addingReminder && (
              <div className="bg-surface-container-low rounded-2xl p-4">
                <p className="text-sm font-medium text-on-surface mb-3">New reminder</p>
                <select
                  value={newProtocolId}
                  onChange={e => setNewProtocolId(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-surface-container text-on-surface text-sm mb-3
                    border-none outline-none"
                >
                  <option value="">Choose a protocol...</option>
                  {mainProtocols.map(p => (
                    <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-surface-container text-on-surface text-sm mb-3
                    border-none outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setAddingReminder(false)}
                    className="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddReminder}
                    disabled={!newProtocolId}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-medium
                      disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Backup / Restore */}
      <div className="mt-8 pt-6 border-t border-outline-variant">
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
