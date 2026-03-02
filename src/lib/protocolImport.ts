import type { Protocol } from '@/types/protocol';

export interface ImportResult {
  success: boolean;
  protocol?: Protocol;
  error?: string;
}

export function parseProtocolFile(text: string): ImportResult {
  try {
    const data = JSON.parse(text);
    if (data.type !== 'truly-yours-protocol' || !data.protocol?.id) {
      return { success: false, error: 'Not a valid protocol file' };
    }
    const proto = data.protocol as Protocol;
    const newId = `imported_${Date.now()}`;
    const now = new Date().toISOString();
    return {
      success: true,
      protocol: { ...proto, id: newId, source: 'user', createdAt: now, updatedAt: now },
    };
  } catch {
    return { success: false, error: 'Invalid file' };
  }
}
