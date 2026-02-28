import { useLocalStorage } from './useLocalStorage';
import type { ProtocolRun, MoodEntry } from '@/types/history';

const MAX_HISTORY = 100;

export function useHistory() {
  const [runs, setRuns] = useLocalStorage<ProtocolRun[]>('ty_history', []);
  const [moods, setMoods] = useLocalStorage<MoodEntry[]>('ty_moods', []);

  const addRun = (run: ProtocolRun) => {
    setRuns(prev => [run, ...prev].slice(0, MAX_HISTORY));
  };

  const addMood = (entry: MoodEntry) => {
    setMoods(prev => [entry, ...prev].slice(0, MAX_HISTORY));
  };

  return { runs, addRun, moods, addMood };
}
