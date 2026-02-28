export interface ProtocolRun {
  id: string;
  protocolId: string;
  startedAt: string;
  completedAt: string | null;
  stoppedEarly: boolean;
  nodesVisited: string[];
  checklistResults: Record<string, boolean>;
}

export interface MoodEntry {
  id: string;
  timestamp: string;
  mood: number;       // 1-5 scale
  pain: number;       // 0-10 scale
  notes?: string;
}
