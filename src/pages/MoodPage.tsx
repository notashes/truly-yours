import { useState } from 'react';
import { useHistory } from '@/hooks/useHistory';
import { BigButton } from '@/components/ui/BigButton';
import type { MoodEntry } from '@/types/history';

const moodEmojis = [
  { value: 1, emoji: '😢', label: 'Rough' },
  { value: 2, emoji: '😔', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😊', label: 'Great' },
];

export function MoodPage() {
  const { moods, addMood } = useHistory();
  const [mood, setMood] = useState(3);
  const [pain, setPain] = useState(0);
  const [notes, setNotes] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = () => {
    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      mood,
      pain,
      notes: notes.trim() || undefined,
    };
    addMood(entry);
    setNotes('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const todayEntries = moods.filter(m => {
    const d = new Date(m.timestamp);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  return (
    <div className="px-5 pt-12 pb-6">
      <h1 className="text-[28px] font-bold text-on-surface tracking-tight mb-1">How are you?</h1>
      <p className="text-on-surface-variant text-sm mb-8">No right or wrong answers. Just checking in.</p>

      {/* Mood selector */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Mood</p>
        <div className="flex justify-between gap-1.5">
          {moodEmojis.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl transition-all cursor-pointer flex-1
                ${mood === m.value
                  ? 'bg-primary-container scale-105'
                  : 'bg-surface-container-low hover:bg-surface-container'
                }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className={`text-[11px] font-medium ${mood === m.value ? 'text-on-primary-container' : 'text-on-surface-variant'}`}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pain slider */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Pain level</p>
          <span className="text-sm font-semibold text-on-surface bg-surface-container rounded-full px-2.5 py-0.5">{pain}/10</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          value={pain}
          onChange={e => setPain(Number(e.target.value))}
          className="w-full h-1 rounded-full appearance-none bg-surface-variant
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:elevation-2 [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-outline">None</span>
          <span className="text-[11px] text-outline">Moderate</span>
          <span className="text-[11px] text-outline">Worst</span>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Notes (optional)</p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Anything you want to note..."
          rows={3}
          className="w-full rounded-2xl bg-surface-container-low px-4 py-3 text-on-surface text-sm
            placeholder:text-outline focus:outline-2 focus:outline-primary focus:-outline-offset-2 resize-none"
        />
      </div>

      <BigButton onClick={handleSave}>
        {justSaved ? 'Saved!' : 'Save check-in'}
      </BigButton>

      {/* Today's entries */}
      {todayEntries.length > 0 && (
        <div className="mt-10">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Today's check-ins</p>
          <div className="flex flex-col gap-2">
            {todayEntries.map(entry => (
              <div key={entry.id} className="bg-surface-container-low rounded-2xl p-3.5 flex items-center gap-3">
                <span className="text-xl">{moodEmojis[entry.mood - 1]?.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface font-medium">
                    Pain: {entry.pain}/10
                  </p>
                  {entry.notes && <p className="text-xs text-on-surface-variant mt-0.5 truncate">{entry.notes}</p>}
                </div>
                <span className="text-xs text-outline flex-shrink-0">
                  {new Date(entry.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
