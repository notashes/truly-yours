import { useState, useMemo } from 'react';
import type { ProtocolRun } from '@/types/history';

interface CalendarDotsProps {
  runs: ProtocolRun[];
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Monday = 0, Sunday = 6 */
function getMondayBasedDay(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function CalendarDots({ runs }: CalendarDotsProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Build a map of day → { completed: number, partial: number }
  const dayMap = useMemo(() => {
    const map = new Map<number, { completed: number; partial: number }>();
    for (const run of runs) {
      const d = new Date(run.startedAt);
      if (d.getFullYear() !== viewYear || d.getMonth() !== viewMonth) continue;
      const day = d.getDate();
      const entry = map.get(day) ?? { completed: 0, partial: 0 };
      if (run.stoppedEarly) {
        entry.partial++;
      } else {
        entry.completed++;
      }
      map.set(day, entry);
    }
    return map;
  }, [runs, viewYear, viewMonth]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getMondayBasedDay(new Date(viewYear, viewMonth, 1));

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const todayDate = today.getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (isCurrentMonth) return; // Don't go past current month
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="mb-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-surface-container transition-colors">
          <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-medium text-on-surface">{monthLabel}</span>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className={`p-1.5 rounded-full transition-colors ${
            isCurrentMonth ? 'opacity-30' : 'hover:bg-surface-container'
          }`}
        >
          <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] text-on-surface-variant font-medium">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const entry = dayMap.get(day);
          const isToday = isCurrentMonth && day === todayDate;

          return (
            <div
              key={day}
              className={`h-9 flex flex-col items-center justify-center rounded-lg
                ${isToday ? 'ring-1.5 ring-primary bg-primary/5' : ''}`}
            >
              <span className={`text-xs leading-none ${
                isToday ? 'font-semibold text-primary' : 'text-on-surface-variant'
              }`}>
                {day}
              </span>
              {entry && (
                <div className="flex gap-0.5 mt-0.5">
                  {entry.completed > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                  {entry.partial > 0 && entry.completed === 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] text-on-surface-variant">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-outline-variant" />
          <span className="text-[10px] text-on-surface-variant">Partial</span>
        </div>
      </div>
    </div>
  );
}
