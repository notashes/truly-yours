import type { ChecklistItem, Protocol } from './protocol';

export type ContentSource = 'default' | 'user' | 'user-modified';

export interface ReferenceListItem {
  id: string;
  label: string;
  emoji?: string;
  notes?: string;
  children?: ReferenceListItem[];
}

export interface ReferenceList {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  items: ReferenceListItem[];
  source: ContentSource;
  createdAt: string;
  updatedAt: string;
}

export interface StandaloneChecklist {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  items: ChecklistItem[];
  source: ContentSource;
  createdAt: string;
  updatedAt: string;
}

export type HomeItem =
  | { type: 'protocol'; id: string; data: Protocol }
  | { type: 'checklist'; id: string; data: StandaloneChecklist };

export interface Mode {
  id: string;
  name: string;
  emoji: string;
  color: string;
  protocolIds: string[];
  checklistIds: string[];
  source: ContentSource;
  createdAt: string;
  updatedAt: string;
}
