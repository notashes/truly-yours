import type {
  Protocol, ProtocolNode, NodeType, QuestionOption,
  ChecklistItem, TemperatureRange,
} from '@/types/protocol';

// === Builder data model (internal only, not persisted) ===

export interface BuilderStep {
  tempId: string;
  type: NodeType;
  title: string;
  description?: string;
  encouragement?: string;
  // question
  options?: BuilderBranch[];
  // checklist
  checklistItems?: ChecklistItem[];
  // timer
  durationMinutes?: number;
  skipAllowed?: boolean;
  // reference-list-link
  referenceListId?: string;
  // weather-question
  temperatureRanges?: TemperatureRange[];
  fallbackNextNodeId?: string;
}

export interface BuilderBranch {
  label: string;
  emoji?: string;
  steps: BuilderStep[];
}

// === Flat node map → Builder tree ===

export function protocolToBuilderSteps(protocol: Protocol): BuilderStep[] {
  const { nodes, startNodeId } = protocol;
  const steps: BuilderStep[] = [];
  const visited = new Set<string>();

  function walkLinear(nodeId: string | null): BuilderStep[] {
    const result: BuilderStep[] = [];
    let current = nodeId;

    while (current && !visited.has(current)) {
      visited.add(current);
      const node = nodes[current];
      if (!node) break;

      const step = nodeToStep(node);
      result.push(step);

      if (node.type === 'question') {
        // Each option starts a branch — walk each
        step.options = node.options.map(opt => ({
          label: opt.label,
          emoji: opt.emoji,
          steps: walkLinear(opt.nextNodeId),
        }));
        break; // question is a branching point, stop linear walk
      } else if (node.type === 'weather-question') {
        // Weather questions also branch — stop linear walk
        break;
      } else if ('nextNodeId' in node) {
        current = node.nextNodeId;
      } else {
        break;
      }
    }

    return result;
  }

  function nodeToStep(node: ProtocolNode): BuilderStep {
    const base: BuilderStep = {
      tempId: node.id,
      type: node.type,
      title: node.title,
      description: node.description,
      encouragement: node.encouragement,
    };

    switch (node.type) {
      case 'question':
        base.options = []; // filled by walkLinear
        break;
      case 'checklist':
        base.checklistItems = node.items.map(i => ({ ...i }));
        break;
      case 'timer':
        base.durationMinutes = node.durationMinutes;
        base.skipAllowed = node.skipAllowed;
        break;
      case 'reference-list-link':
        base.referenceListId = node.referenceListId;
        break;
      case 'weather-question':
        base.temperatureRanges = node.temperatureRanges.map(r => ({ ...r }));
        base.fallbackNextNodeId = node.fallbackNextNodeId;
        break;
    }

    return base;
  }

  steps.push(...walkLinear(startNodeId));
  return steps;
}

// === Builder tree → Flat node map ===

let counter = 0;
function nextId(): string {
  return `node_${Date.now()}_${counter++}`;
}

export function builderStepsToProtocol(
  steps: BuilderStep[],
  metadata: { id: string; name: string; emoji: string; description: string; color: string },
): Protocol {
  counter = 0;
  const nodes: Record<string, ProtocolNode> = {};

  function buildChain(chain: BuilderStep[], terminatorId: string | null): string | null {
    if (chain.length === 0) return terminatorId;

    // Process in reverse so each step knows its "next"
    let nextNodeId: string | null = terminatorId;

    for (let i = chain.length - 1; i >= 0; i--) {
      const step = chain[i];
      const nodeId = step.tempId.startsWith('node_') ? step.tempId : nextId();
      const node = stepToNode(step, nodeId, nextNodeId);
      nodes[nodeId] = node;
      nextNodeId = nodeId;
    }

    return nextNodeId;
  }

  // Create a terminal node that ends the protocol (nextNodeId: null)
  let terminalNodeId: string | null = null;
  function getTerminalNodeId(): string {
    if (!terminalNodeId) {
      terminalNodeId = nextId();
      nodes[terminalNodeId] = {
        id: terminalNodeId,
        type: 'info',
        title: 'All done!',
        encouragement: "You did it!",
        nextNodeId: null,
      };
    }
    return terminalNodeId;
  }

  function stepToNode(step: BuilderStep, nodeId: string, nextNodeId: string | null): ProtocolNode {
    const base = {
      id: nodeId,
      title: step.title,
      description: step.description || undefined,
      encouragement: step.encouragement || undefined,
    };

    switch (step.type) {
      case 'question': {
        const options: QuestionOption[] = (step.options ?? []).map(branch => {
          const branchStart = buildChain(branch.steps, nextNodeId);
          // If branch leads nowhere (null), point to a terminal node
          const resolvedNext = branchStart ?? nextNodeId ?? getTerminalNodeId();
          return {
            label: branch.label,
            emoji: branch.emoji || undefined,
            nextNodeId: resolvedNext,
          };
        });
        return { ...base, type: 'question', options } as ProtocolNode;
      }
      case 'checklist':
        return {
          ...base,
          type: 'checklist',
          items: step.checklistItems ?? [],
          nextNodeId,
        } as ProtocolNode;
      case 'timer':
        return {
          ...base,
          type: 'timer',
          durationMinutes: step.durationMinutes ?? 1,
          skipAllowed: step.skipAllowed ?? true,
          nextNodeId,
        } as ProtocolNode;
      case 'instruction':
        return { ...base, type: 'instruction', nextNodeId } as ProtocolNode;
      case 'info':
        return { ...base, type: 'info', nextNodeId } as ProtocolNode;
      case 'reference-list-link':
        return {
          ...base,
          type: 'reference-list-link',
          referenceListId: step.referenceListId ?? '',
          nextNodeId,
        } as ProtocolNode;
      case 'weather-question':
        return {
          ...base,
          type: 'weather-question',
          temperatureRanges: step.temperatureRanges ?? [],
          fallbackNextNodeId: nextNodeId ?? getTerminalNodeId(),
        } as ProtocolNode;
      default:
        return { ...base, type: 'info', nextNodeId } as ProtocolNode;
    }
  }

  const startNodeId = buildChain(steps, null);

  const now = new Date().toISOString();
  return {
    ...metadata,
    startNodeId: startNodeId ?? 'empty',
    nodes,
    source: 'user',
    createdAt: now,
    updatedAt: now,
  };
}
