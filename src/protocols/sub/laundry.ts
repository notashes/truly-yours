import type { Protocol } from '@/types/protocol';

export const laundryProtocol: Protocol = {
  id: 'laundry',
  name: 'Laundry',
  emoji: '🧺',
  description: 'Get those clothes clean',
  color: 'cyan',
  startNodeId: 'start',
  nodes: {
    start: {
      id: 'start',
      type: 'info',
      title: 'Laundry time!',
      description: "Let's get those clothes clean.",
      nextNodeId: 'steps',
    },
    steps: {
      id: 'steps',
      type: 'checklist',
      title: 'Loading the machine',
      items: [
        { id: 'clothes', label: 'Get the clothes in the machine', optional: false },
        { id: 'product', label: 'Add the liquid product', optional: false },
        { id: 'start-machine', label: 'Start it on the right button', optional: false },
      ],
      encouragement: "The machine does the hard part now!",
      nextNodeId: 'timer',
    },
    timer: {
      id: 'timer',
      type: 'timer',
      title: 'Laundry running!',
      description: "Go do something nice! The timer will remind you to come back.",
      durationMinutes: 240,
      skipAllowed: true,
      encouragement: "Time to empty the machine!",
      nextNodeId: 'empty',
    },
    empty: {
      id: 'empty',
      type: 'instruction',
      title: 'Time to put out the laundry!',
      description: 'Hope you had fun — now it\'s the laundry putting out break hehe.',
      encouragement: 'Clean clothes! You did it!',
      nextNodeId: null,
    },
  },
};
