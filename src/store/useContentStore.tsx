import { createContext, useContext, useMemo, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { protocols as defaultProtocolsMap, mainProtocols as defaultMainProtocols } from '@/protocols';
import { PALETTE_STORAGE_KEY, applyPalette, type PaletteId } from '@/lib/theme';
import type { Protocol } from '@/types/protocol';
import type { ReferenceList, StandaloneChecklist, Mode, HomeItem } from '@/types/content';

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
  homeItems: HomeItem[];
  reorderHome: (orderedPrefixedIds: string[]) => void;
  exportBackup: () => string;
  importBackup: (json: string) => boolean;
}

const ContentStoreContext = createContext<ContentStoreValue | null>(null);

export function ContentStoreProvider({ children }: { children: ReactNode }) {
  const [userProtocols, setUserProtocols] = useLocalStorage<Record<string, Protocol>>('ty_user_protocols', {});
  const [checklists, setChecklists] = useLocalStorage<Record<string, StandaloneChecklist>>('ty_user_checklists', {});
  const [referenceLists, setReferenceLists] = useLocalStorage<Record<string, ReferenceList>>('ty_reference_lists', {});
  const [modes, setModes] = useLocalStorage<Record<string, Mode>>('ty_modes', {});
  const [activeModeId, setActiveModeId] = useLocalStorage<string | null>('ty_active_mode', null);
  const [defaultProtocolOrder, setDefaultProtocolOrder] = useLocalStorage<string[]>('ty_default_protocol_order', []);
  const [homeOrder, setHomeOrder] = useLocalStorage<string[]>('ty_home_order', []);

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
    if (currentMode.id === '__default__') {
      // If user has a custom order for default mode, use it
      if (defaultProtocolOrder.length > 0) {
        const ordered = defaultProtocolOrder
          .map(id => allProtocols[id])
          .filter((p): p is Protocol => p != null && !p.isSubProtocol);
        // Append any new protocols not yet in the saved order
        const orderedSet = new Set(defaultProtocolOrder);
        const modeIdSet = new Set(currentMode.protocolIds);
        const newModeProtos = currentMode.protocolIds
          .filter(id => !orderedSet.has(id))
          .map(id => allProtocols[id])
          .filter((p): p is Protocol => p != null && !p.isSubProtocol);
        const newExtras = Object.values(userProtocols)
          .filter(p => !p.isSubProtocol && !orderedSet.has(p.id) && !modeIdSet.has(p.id));
        return [...ordered, ...newModeProtos, ...newExtras];
      }
      // Default: mode protos + extras
      const modeProtos = currentMode.protocolIds
        .map(id => allProtocols[id])
        .filter((p): p is Protocol => p != null && !p.isSubProtocol);
      const modeIdSet = new Set(currentMode.protocolIds);
      const extras = Object.values(userProtocols)
        .filter(p => !p.isSubProtocol && !modeIdSet.has(p.id));
      return [...modeProtos, ...extras];
    }

    return currentMode.protocolIds
      .map(id => allProtocols[id])
      .filter((p): p is Protocol => p != null && !p.isSubProtocol);
  }, [currentMode, allProtocols, userProtocols, defaultProtocolOrder]);

  const visibleChecklists = useMemo<StandaloneChecklist[]>(() => {
    if (currentMode.checklistIds.length === 0) return Object.values(checklists);
    return currentMode.checklistIds
      .map(id => checklists[id])
      .filter((c): c is StandaloneChecklist => c != null);
  }, [currentMode, checklists]);

  // === UNIFIED HOME ITEMS ===
  const homeItems = useMemo<HomeItem[]>(() => {
    if (currentMode.id !== '__default__') {
      // Custom mode: protocols in mode order, then checklists
      const items: HomeItem[] = [];
      for (const id of currentMode.protocolIds) {
        const p = allProtocols[id];
        if (p && !p.isSubProtocol) items.push({ type: 'protocol', id: p.id, data: p });
      }
      const clIds = currentMode.checklistIds.length > 0 ? currentMode.checklistIds : Object.keys(checklists);
      for (const id of clIds) {
        const c = checklists[id];
        if (c) items.push({ type: 'checklist', id: c.id, data: c });
      }
      return items;
    }

    // Default mode — use homeOrder if available
    if (homeOrder.length > 0) {
      const items: HomeItem[] = [];
      const seen = new Set<string>();
      for (const entry of homeOrder) {
        if (seen.has(entry)) continue;
        seen.add(entry);
        const colonIdx = entry.indexOf(':');
        if (colonIdx === -1) continue;
        const prefix = entry.slice(0, colonIdx);
        const id = entry.slice(colonIdx + 1);
        if (prefix === 'p') {
          const p = allProtocols[id];
          if (p && !p.isSubProtocol) items.push({ type: 'protocol', id, data: p });
        } else if (prefix === 'c') {
          const c = checklists[id];
          if (c) items.push({ type: 'checklist', id, data: c });
        }
      }
      // Append new protocols not yet in homeOrder
      const modeIdSet = new Set(currentMode.protocolIds);
      for (const id of currentMode.protocolIds) {
        if (!seen.has(`p:${id}`)) {
          const p = allProtocols[id];
          if (p && !p.isSubProtocol) items.push({ type: 'protocol', id, data: p });
        }
      }
      for (const p of Object.values(userProtocols)) {
        if (!p.isSubProtocol && !seen.has(`p:${p.id}`) && !modeIdSet.has(p.id)) {
          items.push({ type: 'protocol', id: p.id, data: p });
        }
      }
      // Append new checklists not yet in homeOrder
      for (const c of Object.values(checklists)) {
        if (!seen.has(`c:${c.id}`)) {
          items.push({ type: 'checklist', id: c.id, data: c });
        }
      }
      return items;
    }

    // Migrate from old defaultProtocolOrder, or build fresh
    const items: HomeItem[] = [];
    if (defaultProtocolOrder.length > 0) {
      const seen = new Set<string>();
      for (const id of defaultProtocolOrder) {
        const p = allProtocols[id];
        if (p && !p.isSubProtocol) { items.push({ type: 'protocol', id, data: p }); seen.add(id); }
      }
      const modeIdSet = new Set(currentMode.protocolIds);
      for (const id of currentMode.protocolIds) {
        if (!seen.has(id)) { const p = allProtocols[id]; if (p && !p.isSubProtocol) items.push({ type: 'protocol', id, data: p }); }
      }
      for (const p of Object.values(userProtocols)) {
        if (!p.isSubProtocol && !seen.has(p.id) && !modeIdSet.has(p.id)) items.push({ type: 'protocol', id: p.id, data: p });
      }
    } else {
      const modeIdSet = new Set(currentMode.protocolIds);
      for (const id of currentMode.protocolIds) {
        const p = allProtocols[id]; if (p && !p.isSubProtocol) items.push({ type: 'protocol', id, data: p });
      }
      for (const p of Object.values(userProtocols)) {
        if (!p.isSubProtocol && !modeIdSet.has(p.id)) items.push({ type: 'protocol', id: p.id, data: p });
      }
    }
    // Append all checklists
    for (const c of Object.values(checklists)) {
      items.push({ type: 'checklist', id: c.id, data: c });
    }
    return items;
  }, [currentMode, allProtocols, userProtocols, checklists, homeOrder, defaultProtocolOrder]);

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

  const reorderHome = useCallback((orderedPrefixedIds: string[]) => {
    if (currentMode.id === '__default__') {
      setHomeOrder(orderedPrefixedIds);
    } else {
      // For custom modes, split back into protocolIds and checklistIds
      const protocolIds: string[] = [];
      const checklistIds: string[] = [];
      for (const entry of orderedPrefixedIds) {
        const colonIdx = entry.indexOf(':');
        if (colonIdx === -1) continue;
        const prefix = entry.slice(0, colonIdx);
        const id = entry.slice(colonIdx + 1);
        if (prefix === 'p') protocolIds.push(id);
        else if (prefix === 'c') checklistIds.push(id);
      }
      saveMode({
        ...currentMode,
        protocolIds,
        checklistIds,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [currentMode, setHomeOrder, saveMode]);

  const exportBackup = useCallback(() => {
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      ty_user_protocols: userProtocols,
      ty_user_checklists: checklists,
      ty_reference_lists: referenceLists,
      ty_modes: modes,
      ty_active_mode: activeModeId,
      ty_default_protocol_order: defaultProtocolOrder,
      ty_home_order: homeOrder,
      ty_active_palette: localStorage.getItem(PALETTE_STORAGE_KEY) || null,
      ty_history: JSON.parse(localStorage.getItem('ty_history') || '[]'),
      ty_moods: JSON.parse(localStorage.getItem('ty_moods') || '[]'),
    }, null, 2);
  }, [userProtocols, checklists, referenceLists, modes, activeModeId, defaultProtocolOrder, homeOrder]);

  const importBackup = useCallback((json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (!data.version) return false;
      if (data.ty_user_protocols) setUserProtocols(data.ty_user_protocols);
      if (data.ty_user_checklists) setChecklists(data.ty_user_checklists);
      if (data.ty_reference_lists) setReferenceLists(data.ty_reference_lists);
      if (data.ty_modes) setModes(data.ty_modes);
      if (data.ty_active_mode !== undefined) setActiveModeId(data.ty_active_mode);
      if (data.ty_default_protocol_order) setDefaultProtocolOrder(data.ty_default_protocol_order);
      if (data.ty_home_order) setHomeOrder(data.ty_home_order);
      if (data.ty_active_palette) {
        localStorage.setItem(PALETTE_STORAGE_KEY, data.ty_active_palette);
        applyPalette(data.ty_active_palette as PaletteId);
      }
      if (data.ty_history) localStorage.setItem('ty_history', JSON.stringify(data.ty_history));
      if (data.ty_moods) localStorage.setItem('ty_moods', JSON.stringify(data.ty_moods));
      return true;
    } catch {
      return false;
    }
  }, [setUserProtocols, setChecklists, setReferenceLists, setModes, setActiveModeId, setDefaultProtocolOrder, setHomeOrder]);

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
    homeItems,
    reorderHome,
    exportBackup,
    importBackup,
  }), [
    allProtocols, visibleProtocols, checklists, visibleChecklists,
    referenceLists, allModes, currentMode, activeModeId,
    saveProtocol, deleteProtocol, duplicateProtocol,
    saveChecklist, deleteChecklist, saveReferenceList, deleteReferenceList,
    saveMode, deleteMode, setActiveMode, homeItems, reorderHome, exportBackup, importBackup,
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
