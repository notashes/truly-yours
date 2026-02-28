import type { Protocol } from '@/types/protocol';

export const bedtimeProtocol: Protocol = {
  id: 'bedtime',
  name: 'Bedtime Routine',
  emoji: '🌙',
  description: 'Wind down for sleep',
  color: 'indigo',
  startNodeId: 'start',
  nodes: {
    start: {
      id: 'start',
      type: 'info',
      title: 'Time to wind down',
      description: "Let's get you ready for sleep. One step at a time.",
      encouragement: 'You showed up, and that matters.',
      nextNodeId: 'checklist',
    },
    checklist: {
      id: 'checklist',
      type: 'checklist',
      title: 'Bedtime steps',
      description: 'Check them off as you go. No rush.',
      items: [
        { id: 'brush', label: 'Brush teeth', optional: false },
        { id: 'floss', label: 'Floss', optional: false },
        { id: 'wash-face', label: 'Wash face (or wipes if icky)', optional: true },
        { id: 'moisturize', label: 'Moisturize', optional: false },
        { id: 'pee', label: 'Pee', optional: false },
      ],
      encouragement: "You're taking care of yourself. That's huge.",
      nextNodeId: null,
    },
  },
};
