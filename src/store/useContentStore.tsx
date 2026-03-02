import { createContext, useContext, useMemo, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { protocols as defaultProtocolsMap, mainProtocols as defaultMainProtocols } from '@/protocols';
import type { Protocol } from '@/types/protocol';
import type { ReferenceList, StandaloneChecklist, Mode } from '@/types/content';

const DEFAULT_MODE: Mode = {
  id: '__default__',
  name: 'Normal',
  emoji: '✨',
  color: 'primary',
  protocolIds: defaultMainProtocols.map(p => p.id),
  checklistIds: [],
  source: 'default',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

interface ContentStoreValue {
  allProtocols: Record<string, Protocol>;
  visibleProtocols: Protocol[];
  allChecklists: Record<string, StandaloneChecklist>;
  visibleChecklists: StandaloneChecklist[];
  allReferenceLists: Record<string, ReferenceList>;
  allModes: Mode[];
  currentMode: Mode;
  activeModeId: string | null;
  saveProtocol: (protocol: Protocol) => void;
  deleteProtocol: (id: string) => void;
  duplicateProtocol: (id: string) => Protocol | null;
  saveChecklist: (checklist: StandaloneChecklist) => void;
  deleteChecklist: (id: string) => void;
  saveReferenceList: (list: ReferenceList) => void;
  deleteReferenceList: (id: string) => void;
  saveMode: (mode: Mode) => void;
  deleteMode: (id: string) => void;
  setActiveMode: (id: string | null) => void;
}

const ContentStoreContext = createContext<ContentStoreValue | null>(null);

export function ContentStoreProvider({ children }: { children: ReactNode }) {
  const [userProtocols, setUserProtocols] = useLocalStorage<Record<string, Protocol>>('ty_user_protocols', {});
  const [checklists, setChecklists] = useLocalStorage<Record<string, StandaloneChecklist>>('ty_user_checklists', {});
  const [referenceLists, setReferenceLists] = useLocalStorage<Record<string, ReferenceList>>('ty_reference_lists', {});
  const [modes, setModes] = useLocalStorage<Record<string, Mode>>('ty_modes', {});
  const [activeModeId, setActiveModeId] = useLocalStorage<string | null>('ty_active_mode', null);

  const allProtocols = useMemo<Record<string, Protocol>>(() => {
    const merged = { ...defaultProtocolsMap };
    for (const [id, proto] of Object.entries(userProtocols)) {
      merged[id] = proto;
    }
    return merged;
  }, [userProtocols]);

  const allModes = useMemo<Mode[]>(() => {
    return [DEFAULT_MODE, ...Object.values(modes)];
  }, [modes]);

  const currentMode = useMemo<Mode>(() => {
    if (!activeModeId) return DEFAULT_MODE;
    return modes[activeModeId] ?? DEFAULT_MODE;
  }, [activeModeId, modes]);

  const visibleProtocols = useMemo<Protocol[]>(() => {
    const modeProtos = currentMode.protocolIds
      .map(id => allProtocols[id])
      .filter((p): p is Protocol => p != null && !p.isSubProtocol);

    if (currentMode.id === '__default__') {
      const modeIdSet = new Set(currentMode.protocolIds);
      const extras = Object.values(userProtocols)
        .filter(p => !p.isSubProtocol && !modeIdSet.has(p.id));
      return [...modeProtos, ...extras];
    }

    return modeProtos;
  }, [currentMode, allProtocols, userProtocols]);

  const visibleChecklists = useMemo<StandaloneChecklist[]>(() => {
    if (currentMode.checklistIds.length === 0) return Object.values(checklists);
    return currentMode.checklistIds
      .map(id => checklists[id])
      .filter((c): c is StandaloneChecklist => c != null);
  }, [currentMode, checklists]);

  // === PROTOCOL CRUD ===
  const saveProtocol = useCallback((protocol: Protocol) => {
    setUserProtocols(prev => ({ ...prev, [protocol.id]: protocol }));
  }, [setUserProtocols]);

  const deleteProtocol = useCallback((id: string) => {
    setUserProtocols(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [setUserProtocols]);

  const duplicateProtocol = useCallback((id: string): Protocol | null => {
    const original = allProtocols[id];
    if (!original) return null;
    const newId = `${id}_copy_${Date.now()}`;
    const now = new Date().toISOString();
    const copy: Protocol = {
      ...original,
      id: newId,
      name: `${original.name} (copy)`,
      source: 'user',
      baseProtocolId: original.source === 'default' ? original.id : original.baseProtocolId,
      createdAt: now,
      updatedAt: now,
    };
    setUserProtocols(prev => ({ ...prev, [newId]: copy }));
    return copy;
  }, [allProtocols, setUserProtocols]);

  // === CHECKLIST CRUD ===
  const saveChecklist = useCallback((checklist: StandaloneChecklist) => {
    setChecklists(prev => ({ ...prev, [checklist.id]: checklist }));
  }, [setChecklists]);

  const deleteChecklist = useCallback((id: string) => {
    setChecklists(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [setChecklists]);

  // === REFERENCE LIST CRUD ===
  const saveReferenceList = useCallback((list: ReferenceList) => {
    setReferenceLists(prev => ({ ...prev, [list.id]: list }));
  }, [setReferenceLists]);

  const deleteReferenceList = useCallback((id: string) => {
    setReferenceLists(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [setReferenceLists]);

  // === MODE CRUD ===
  const saveMode = useCallback((mode: Mode) => {
    setModes(prev => ({ ...prev, [mode.id]: mode }));
  }, [setModes]);

  const deleteMode = useCallback((id: string) => {
    setModes(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setActiveModeId(prev => prev === id ? null : prev);
  }, [setModes, setActiveModeId]);

  const setActiveMode = useCallback((id: string | null) => {
    setActiveModeId(id === '__default__' ? null : id);
  }, [setActiveModeId]);

  const value = useMemo<ContentStoreValue>(() => ({
    allProtocols,
    visibleProtocols,
    allChecklists: checklists,
    visibleChecklists,
    allReferenceLists: referenceLists,
    allModes,
    currentMode,
    activeModeId,
    saveProtocol,
    deleteProtocol,
    duplicateProtocol,
    saveChecklist,
    deleteChecklist,
    saveReferenceList,
    deleteReferenceList,
    saveMode,
    deleteMode,
    setActiveMode,
  }), [
    allProtocols, visibleProtocols, checklists, visibleChecklists,
    referenceLists, allModes, currentMode, activeModeId,
    saveProtocol, deleteProtocol, duplicateProtocol,
    saveChecklist, deleteChecklist, saveReferenceList, deleteReferenceList,
    saveMode, deleteMode, setActiveMode,
  ]);

  return (
    <ContentStoreContext.Provider value={value}>
      {children}
    </ContentStoreContext.Provider>
  );
}

export function useContentStore(): ContentStoreValue {
  const ctx = useContext(ContentStoreContext);
  if (!ctx) throw new Error('useContentStore must be used within ContentStoreProvider');
  return ctx;
}
