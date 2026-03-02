import type { Protocol } from '@/types/protocol';

export const shoppingProtocol: Protocol = {
  id: 'shopping',
  name: 'Food Shopping',
  emoji: '🛒',
  description: 'Get the food you need',
  color: 'green',
  source: 'default',
  isSubProtocol: true,
  startNodeId: 'start',
  nodes: {
    start: {
      id: 'start',
      type: 'info',
      title: 'We need food!',
      description: "Let's make a list so you don't forget anything.",
      nextNodeId: 'list',
    },
    list: {
      id: 'list',
      type: 'instruction',
      title: 'Make a shopping list',
      description: 'Check what\'s missing from the stuff you always need. Think about what Agathe needs too!',
      encouragement: 'Planning ahead is a superpower!',
      nextNodeId: 'go',
    },
    go: {
      id: 'go',
      type: 'instruction',
      title: 'Time to shop!',
      description: 'Take your list, bags, keys, and wallet. You\'ve got this!',
      encouragement: 'Future you will be so grateful for a stocked kitchen!',
      nextNodeId: null,
    },
  },
};
