import type { Protocol } from '@/types/protocol';

export const showerProtocol: Protocol = {
  id: 'shower',
  name: 'Shower Routine',
  emoji: '🚿',
  description: 'Gentle shower guide',
  color: 'blue',
  source: 'default',
  startNodeId: 'start',
  nodes: {
    start: {
      id: 'start',
      type: 'info',
      title: 'Shower Time!',
      description: "Let's figure out what works for your body today.",
      encouragement: "Showing up for hygiene is always an achievement.",
      nextNodeId: 'sensory-check',
    },

    'sensory-check': {
      id: 'sensory-check',
      type: 'question',
      title: 'How does your body feel about water today?',
      options: [
        { label: 'Worst sensory day ever', emoji: '😣', nextNodeId: 'wipes' },
        { label: 'A bit sensitive', emoji: '🤔', nextNodeId: 'sensitive-scalp' },
        { label: 'Feeling good!', emoji: '🚿', nextNodeId: 'full-shower-check' },
      ],
    },

    // === WIPES PATH ===
    wipes: {
      id: 'wipes',
      type: 'instruction',
      title: 'Use body wipes',
      description: "That's completely valid. Wipes are hygiene too.",
      encouragement: "You listened to your body. That's self-care.",
      nextNodeId: 'post-shower',
    },

    // === SENSITIVE PATH ===
    'sensitive-scalp': {
      id: 'sensitive-scalp',
      type: 'question',
      title: 'Is your scalp itchy?',
      options: [
        { label: 'No, scalp is fine', emoji: '👍', nextNodeId: 'no-shampoo-start' },
        { label: 'Yes, it needs washing', emoji: '😬', nextNodeId: 'shampoo-start' },
      ],
    },

    // === FULL SHOWER CHECK ===
    'full-shower-check': {
      id: 'full-shower-check',
      type: 'question',
      title: 'Has it been 3 days or more since last shampoo?',
      options: [
        { label: 'Yes, time for shampoo', emoji: '🧴', nextNodeId: 'shampoo-start' },
        { label: 'No, hair is fine', emoji: '✨', nextNodeId: 'no-shampoo-start' },
      ],
    },

    // === SHAMPOO PATH ===
    'shampoo-start': {
      id: 'shampoo-start',
      type: 'instruction',
      title: 'Get your hair wet',
      description: 'Start the shower and get your hair wet first.',
      encouragement: "You're doing great!",
      nextNodeId: 'shampoo-apply',
    },
    'shampoo-apply': {
      id: 'shampoo-apply',
      type: 'instruction',
      title: 'Put shampoo and rub',
      description: 'Massage the shampoo into your scalp.',
      nextNodeId: 'shampoo-body-wet',
    },
    'shampoo-body-wet': {
      id: 'shampoo-body-wet',
      type: 'instruction',
      title: 'Wet the rest of your body',
      nextNodeId: 'shampoo-soap',
    },
    'shampoo-soap': {
      id: 'shampoo-soap',
      type: 'instruction',
      title: 'Soap your body and face',
      nextNodeId: 'shampoo-rinse',
    },
    'shampoo-rinse': {
      id: 'shampoo-rinse',
      type: 'instruction',
      title: 'Rinse everything!',
      description: 'Insist a lot on the hair to get all the shampoo out.',
      encouragement: 'Almost there!',
      nextNodeId: 'post-shower',
    },

    // === NO SHAMPOO PATH ===
    'no-shampoo-start': {
      id: 'no-shampoo-start',
      type: 'instruction',
      title: 'Wet your body (not the hair)',
      nextNodeId: 'no-shampoo-soap',
    },
    'no-shampoo-soap': {
      id: 'no-shampoo-soap',
      type: 'instruction',
      title: 'Soap everywhere',
      nextNodeId: 'no-shampoo-rinse',
    },
    'no-shampoo-rinse': {
      id: 'no-shampoo-rinse',
      type: 'instruction',
      title: 'Rinse!',
      nextNodeId: 'no-shampoo-hair-optional',
    },
    'no-shampoo-hair-optional': {
      id: 'no-shampoo-hair-optional',
      type: 'question',
      title: 'Want to wet and brush your hair?',
      options: [
        { label: 'Yes please', emoji: '💆', nextNodeId: 'brush-hair' },
        { label: 'No thanks', emoji: '👋', nextNodeId: 'post-shower' },
      ],
    },
    'brush-hair': {
      id: 'brush-hair',
      type: 'instruction',
      title: 'Wet your hair and brush it',
      encouragement: 'Nice, your hair will thank you!',
      nextNodeId: 'post-shower',
    },

    // === POST SHOWER ===
    'post-shower': {
      id: 'post-shower',
      type: 'checklist',
      title: 'Post-shower care',
      description: 'The finishing touches!',
      items: [
        { id: 'moisturize', label: 'Moisturizer', optional: false },
        { id: 'deodorant', label: 'Deodorant', optional: false },
        { id: 'brush-teeth', label: 'Brush teeth', optional: false },
      ],
      encouragement: "You did amazing! Your body is taken care of.",
      nextNodeId: null,
    },
  },
};
