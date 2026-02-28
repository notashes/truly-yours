export type NodeType = 'question' | 'instruction' | 'checklist' | 'timer' | 'info' | 'weather-question';

export interface QuestionOption {
  label: string;
  emoji?: string;
  nextNodeId: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  optional: boolean;
}

export interface TemperatureRange {
  label: string;
  minTemp: number;
  maxTemp: number;
  nextNodeId: string;
}

interface BaseNode {
  id: string;
  type: NodeType;
  title: string;
  description?: string;
  encouragement?: string;
  subProtocolId?: string;
  returnNodeId?: string;
}

export interface QuestionNode extends BaseNode {
  type: 'question';
  options: QuestionOption[];
}

export interface InstructionNode extends BaseNode {
  type: 'instruction';
  nextNodeId: string | null;
}

export interface ChecklistNode extends BaseNode {
  type: 'checklist';
  items: ChecklistItem[];
  nextNodeId: string | null;
}

export interface TimerNode extends BaseNode {
  type: 'timer';
  durationMinutes: number;
  skipAllowed: boolean;
  nextNodeId: string | null;
}

export interface InfoNode extends BaseNode {
  type: 'info';
  nextNodeId: string | null;
}

export interface WeatherQuestionNode extends BaseNode {
  type: 'weather-question';
  temperatureRanges: TemperatureRange[];
  fallbackNextNodeId: string;
}

export type ProtocolNode =
  | QuestionNode
  | InstructionNode
  | ChecklistNode
  | TimerNode
  | InfoNode
  | WeatherQuestionNode;

export interface Protocol {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  startNodeId: string;
  nodes: Record<string, ProtocolNode>;
  subProtocolIds?: string[];
}
