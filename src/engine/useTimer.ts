import { useState, useEffect, useCallback, useRef } from 'react';

interface TimerState {
  remainingSeconds: number;
  isRunning: boolean;
  isComplete: boolean;
}

export function useTimer(durationMinutes: number) {
  const totalSeconds = durationMinutes * 60;
  const startTimeRef = useRef<number | null>(null);
  const [state, setState] = useState<TimerState>({
    remainingSeconds: totalSeconds,
    isRunning: false,
    isComplete: false,
  });

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    setState({ remainingSeconds: totalSeconds, isRunning: true, isComplete: false });
  }, [totalSeconds]);

  const skip = useCallback(() => {
    setState({ remainingSeconds: 0, isRunning: false, isComplete: true });
  }, []);

  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsed);

      if (remaining <= 0) {
        setState({ remainingSeconds: 0, isRunning: false, isComplete: true });
        clearInterval(interval);
      } else {
        setState(prev => ({ ...prev, remainingSeconds: remaining }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning, totalSeconds]);

  return { ...state, start, skip };
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
