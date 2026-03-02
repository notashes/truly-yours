import { useState, useCallback, useMemo } from 'react';
import type { Protocol, ProtocolNode } from '@/types/protocol';
import type { ProtocolRun } from '@/types/history';

interface ProtocolContext {
  protocol: Protocol;
  currentNodeId: string;
  returnNodeId?: string;
}

interface RunnerState {
  stack: ProtocolContext[];
  status: 'idle' | 'running' | 'completed' | 'stopped';
  mainProtocolId: string | null;
  nodesVisited: string[];
  checklistResults: Record<string, boolean>;
  startedAt: string | null;
}

const STORAGE_KEY = 'ty_runner_state';

function estimateMaxDepth(protocol: Protocol): number {
  const visited = new Set<string>();
  let maxDepth = 0;

  function walk(nodeId: string, depth: number) {
    if (visited.has(nodeId) || depth > 50) return;
    visited.add(nodeId);
    maxDepth = Math.max(maxDepth, depth);

    const node = protocol.nodes[nodeId];
    if (!node) return;

    if (node.type === 'question') {
      for (const opt of node.options) {
        walk(opt.nextNodeId, depth + 1);
      }
    } else if (node.type === 'weather-question') {
      for (const range of node.temperatureRanges) {
        walk(range.nextNodeId, depth + 1);
      }
      walk(node.fallbackNextNodeId, depth + 1);
    } else if ('nextNodeId' in node && node.nextNodeId) {
      walk(node.nextNodeId, depth + 1);
    }
  }

  walk(protocol.startNodeId, 0);
  return maxDepth || 1;
}

function saveState(state: RunnerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full
  }
}

function clearSavedState() {
  localStorage.removeItem(STORAGE_KEY);
}

/** Peek at saved runner state without loading it into React state.
 *  Only returns protocol ID if there is meaningful progress (more than the start node). */
export function getSavedRunnerProtocolId(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as RunnerState;
    if (data.status === 'running' && data.mainProtocolId && data.stack.length > 0 && data.nodesVisited.length > 1) {
      return data.mainProtocolId;
    }
  } catch { /* corrupt */ }
  return null;
}

export function useProtocolRunner(allProtocols: Record<string, Protocol>) {
  const [state, setState] = useState<RunnerState>({
    stack: [],
    status: 'idle',
    mainProtocolId: null,
    nodesVisited: [],
    checklistResults: {},
    startedAt: null,
  });

  const currentContext = state.stack[state.stack.length - 1] ?? null;
  const currentNode: ProtocolNode | null = currentContext
    ? currentContext.protocol.nodes[currentContext.currentNodeId] ?? null
    : null;

  const mainProtocol = state.stack[0]?.protocol ?? null;

  const progress = useMemo(() => {
    if (!mainProtocol) return 0;
    const maxDepth = estimateMaxDepth(mainProtocol);
    return Math.min(state.nodesVisited.length / maxDepth, 0.95);
  }, [mainProtocol, state.nodesVisited.length]);

  const advance = useCallback((nextNodeId: string | null) => {
    setState(prev => {
      if (nextNodeId === null) {
        // Pop the stack
        const newStack = prev.stack.slice(0, -1);
        if (newStack.length === 0) {
          // Protocol complete
          const newState: RunnerState = { ...prev, stack: [], status: 'completed' };
          clearSavedState();
          return newState;
        }
        // Return to parent's returnNodeId
        const parent = newStack[newStack.length - 1];
        const returnId = prev.stack[prev.stack.length - 1]?.returnNodeId;
        if (returnId) {
          newStack[newStack.length - 1] = { ...parent, currentNodeId: returnId };
        }
        const newState: RunnerState = {
          ...prev,
          stack: newStack,
          nodesVisited: [...prev.nodesVisited, returnId ?? parent.currentNodeId],
        };
        saveState(newState);
        return newState;
      }

      // Move to next node in current context
      const newStack = [...prev.stack];
      const top = { ...newStack[newStack.length - 1], currentNodeId: nextNodeId };
      newStack[newStack.length - 1] = top;

      // Check if the new node triggers a sub-protocol
      const newNode = top.protocol.nodes[nextNodeId];
      if (newNode?.subProtocolId) {
        const subProtocol = allProtocols[newNode.subProtocolId];
        if (subProtocol) {
          newStack.push({
            protocol: subProtocol,
            currentNodeId: subProtocol.startNodeId,
            returnNodeId: newNode.returnNodeId,
          });
        }
      }

      const newState: RunnerState = {
        ...prev,
        stack: newStack,
        nodesVisited: [...prev.nodesVisited, nextNodeId],
      };
      saveState(newState);
      return newState;
    });
  }, [allProtocols]);

  const start = useCallback((protocolId: string) => {
    const protocol = allProtocols[protocolId];
    if (!protocol) return;

    const newState: RunnerState = {
      stack: [{ protocol, currentNodeId: protocol.startNodeId }],
      status: 'running',
      mainProtocolId: protocolId,
      nodesVisited: [protocol.startNodeId],
      checklistResults: {},
      startedAt: new Date().toISOString(),
    };
    saveState(newState);
    setState(newState);
  }, [allProtocols]);

  const resume = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as RunnerState;
      if (saved.status !== 'running' || saved.stack.length === 0) return;
      // Rebuild stack with latest protocol definitions where possible
      const rebuiltStack = saved.stack.map(ctx => {
        const latest = allProtocols[ctx.protocol.id];
        return { ...ctx, protocol: latest ?? ctx.protocol };
      });
      setState({ ...saved, stack: rebuiltStack });
    } catch { /* corrupt state, ignore */ }
  }, [allProtocols]);

  const selectOption = useCallback((nextNodeId: string) => {
    advance(nextNodeId);
  }, [advance]);

  const completeInstruction = useCallback(() => {
    if (currentNode?.type === 'instruction') {
      advance(currentNode.nextNodeId);
    }
  }, [currentNode, advance]);

  const toggleChecklistItem = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      checklistResults: {
        ...prev.checklistResults,
        [itemId]: !prev.checklistResults[itemId],
      },
    }));
  }, []);

  const completeChecklist = useCallback(() => {
    if (currentNode?.type === 'checklist') {
      advance(currentNode.nextNodeId);
    }
  }, [currentNode, advance]);

  const completeTimer = useCallback(() => {
    if (currentNode?.type === 'timer') {
      advance(currentNode.nextNodeId);
    }
  }, [currentNode, advance]);

  const completeInfo = useCallback(() => {
    if (currentNode?.type === 'info') {
      advance(currentNode.nextNodeId);
    }
  }, [currentNode, advance]);

  const completeReferenceListLink = useCallback(() => {
    if (currentNode?.type === 'reference-list-link') {
      advance(currentNode.nextNodeId);
    }
  }, [currentNode, advance]);

  const selectWeatherOption = useCallback((nextNodeId: string) => {
    advance(nextNodeId);
  }, [advance]);

  const stopEarly = useCallback(() => {
    setState(prev => {
      clearSavedState();
      return { ...prev, stack: [], status: 'stopped' };
    });
  }, []);

  const reset = useCallback(() => {
    clearSavedState();
    setState({
      stack: [],
      status: 'idle',
      mainProtocolId: null,
      nodesVisited: [],
      checklistResults: {},
      startedAt: null,
    });
  }, []);

  const getRun = useCallback((): ProtocolRun | null => {
    if (!state.mainProtocolId || !state.startedAt) return null;
    return {
      id: crypto.randomUUID(),
      protocolId: state.mainProtocolId,
      startedAt: state.startedAt,
      completedAt: state.status === 'completed' ? new Date().toISOString() : null,
      stoppedEarly: state.status === 'stopped',
      nodesVisited: state.nodesVisited,
      checklistResults: state.checklistResults,
    };
  }, [state]);

  return {
    currentNode,
    currentProtocolName: currentContext?.protocol.name ?? '',
    mainProtocolName: mainProtocol?.name ?? '',
    progress,
    status: state.status,
    checklistResults: state.checklistResults,
    start,
    resume,
    selectOption,
    completeInstruction,
    toggleChecklistItem,
    completeChecklist,
    completeTimer,
    completeInfo,
    completeReferenceListLink,
    selectWeatherOption,
    stopEarly,
    reset,
    getRun,
  };
}
