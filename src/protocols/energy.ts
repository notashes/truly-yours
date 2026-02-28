import type { Protocol } from '@/types/protocol';

export const energyProtocol: Protocol = {
  id: 'energy',
  name: 'Energy & Activity',
  emoji: '⚡',
  description: 'Match activity to your energy',
  color: 'purple',
  startNodeId: 'start',
  nodes: {
    start: {
      id: 'start',
      type: 'question',
      title: 'How is your energy right now?',
      description: 'Be honest — all levels are valid.',
      options: [
        { label: 'Tired/depressed, birds would help', emoji: '🐦', nextNodeId: 'level-1' },
        { label: 'Hyper, no focus whatsoever', emoji: '🌀', nextNodeId: 'level-2' },
        { label: 'Could hyperfocus, have time', emoji: '🎯', nextNodeId: 'level-3' },
        { label: 'Could focus but not much time', emoji: '⏰', nextNodeId: 'level-4' },
      ],
    },

    // We need a second question for level 5 since we can only have 4 options
    'start-continued': {
      id: 'start-continued',
      type: 'info',
      title: 'One more option!',
      description: 'Energetic and not overstimulated? Go outside and ebird!',
      nextNodeId: 'level-5',
    },

    // === LEVEL 1: Tired/depressed ===
    'level-1': {
      id: 'level-1',
      type: 'info',
      title: "Let's be gentle today",
      description: 'Stay on your bed or a comfy place. Music if it\'s not overwhelming.',
      nextNodeId: 'level-1-options',
    },
    'level-1-options': {
      id: 'level-1-options',
      type: 'question',
      title: 'What feels doable?',
      options: [
        { label: 'Look through nature books', emoji: '📖', nextNodeId: 'level-1-books' },
        { label: 'Bird quizzes on BirdID', emoji: '🐤', nextNodeId: 'level-1-birdid' },
        { label: 'Just look at bird catalog', emoji: '👀', nextNodeId: 'level-1-catalog' },
        { label: 'Draw a bird maybe', emoji: '✏️', nextNodeId: 'level-1-draw' },
      ],
    },
    'level-1-books': {
      id: 'level-1-books',
      type: 'instruction',
      title: 'Take a nature book',
      description: 'All you have to do is open the book and look at them. That\'s it.',
      encouragement: 'Even just looking at something beautiful counts.',
      nextNodeId: null,
    },
    'level-1-birdid': {
      id: 'level-1-birdid',
      type: 'instruction',
      title: 'Open BirdID',
      description: 'Try some quizzes or just browse through species. No pressure.',
      encouragement: 'Learning while resting. That\'s pretty cool.',
      nextNodeId: null,
    },
    'level-1-catalog': {
      id: 'level-1-catalog',
      type: 'instruction',
      title: 'Browse bird species',
      description: 'Just scroll through and look. No goals needed.',
      encouragement: 'Sometimes just looking at something alive helps.',
      nextNodeId: null,
    },
    'level-1-draw': {
      id: 'level-1-draw',
      type: 'instruction',
      title: 'Draw if you feel like it',
      description: "Grab paper and a pen. Draw a bird, or anything. Or just doodle. It's all good.",
      encouragement: "Creating something, even a small doodle, is wonderful.",
      nextNodeId: null,
    },

    // === LEVEL 2: Hyper no focus ===
    'level-2': {
      id: 'level-2',
      type: 'question',
      title: 'Channel that energy!',
      description: 'You can move around while doing any of these.',
      options: [
        { label: 'Tell Loki/plushie about the world', emoji: '🧸', nextNodeId: 'level-2-talk' },
        { label: 'Arrange figurines, make a scene', emoji: '🎭', nextNodeId: 'level-2-figurines' },
        { label: 'Pace around and stim', emoji: '🚶', nextNodeId: 'level-2-stim' },
      ],
    },
    'level-2-talk': {
      id: 'level-2-talk',
      type: 'instruction',
      title: 'Grab your plushie or Loki',
      description: 'Tell them about the latest thing you learnt about the world! Pace, dance, stim while you talk.',
      encouragement: 'Teaching someone (even a plushie) helps you process!',
      nextNodeId: null,
    },
    'level-2-figurines': {
      id: 'level-2-figurines',
      type: 'instruction',
      title: 'Set up a scene!',
      description: 'Arrange figurines, make a scene, create a story. Move around freely while doing it.',
      encouragement: 'Creativity is a superpower.',
      nextNodeId: null,
    },
    'level-2-stim': {
      id: 'level-2-stim',
      type: 'instruction',
      title: 'Move your body!',
      description: 'Pace, dance, stim — whatever your body needs right now. No rules.',
      encouragement: 'Movement is self-regulation. You know what you need.',
      nextNodeId: null,
    },

    // === LEVEL 3: Hyperfocus potential + time ===
    'level-3': {
      id: 'level-3',
      type: 'question',
      title: 'What kind of focus?',
      options: [
        { label: 'Specific project (drawing, anatomy...)', emoji: '🎨', nextNodeId: 'level-3-setup' },
        { label: 'Continue course (reading/videos)', emoji: '📚', nextNodeId: 'level-3-setup' },
      ],
    },
    'level-3-setup': {
      id: 'level-3-setup',
      type: 'checklist',
      title: 'Set up your focus zone',
      items: [
        { id: 'tea', label: 'Make tea or hot chocolate', optional: false },
        { id: 'water', label: 'Have water nearby', optional: false },
        { id: 'pee', label: 'Go pee', optional: false },
        { id: 'music', label: 'Put on lyrics-less music (or duck noises)', optional: true },
        { id: 'stuff', label: 'Get all the stuff you need (PC, notebook, crayons...)', optional: false },
      ],
      encouragement: 'Your focus zone is ready!',
      nextNodeId: 'level-3-go',
    },
    'level-3-go': {
      id: 'level-3-go',
      type: 'info',
      title: 'Get started!',
      description: "Don't hesitate to take breaks to pace around or move when you feel like it.",
      nextNodeId: 'level-3-timer',
    },
    'level-3-timer': {
      id: 'level-3-timer',
      type: 'timer',
      title: 'Focus session',
      description: 'When this finishes, you must stop. You can also stop before!',
      durationMinutes: 240,
      skipAllowed: true,
      encouragement: 'What an amazing focus session!',
      nextNodeId: null,
    },

    // === LEVEL 4: Focus but not much time ===
    'level-4': {
      id: 'level-4',
      type: 'question',
      title: 'Quick focus session!',
      description: 'Just get started — keep water nearby, stim freely.',
      options: [
        { label: 'Read book or watch course videos', emoji: '📱', nextNodeId: 'level-4-go' },
        { label: 'Study bird identification', emoji: '🐦', nextNodeId: 'level-4-birds' },
      ],
    },
    'level-4-go': {
      id: 'level-4-go',
      type: 'instruction',
      title: 'Get started!',
      description: 'On your phone or PC, just dive in. Have a notebook nearby for notes or sketches. Add focus music if it feels good.',
      encouragement: 'Even a short session adds up over time!',
      nextNodeId: null,
    },
    'level-4-birds': {
      id: 'level-4-birds',
      type: 'instruction',
      title: 'Bird study time!',
      description: 'Look up species you have questions about, study identification features. Same cozy settings.',
      encouragement: 'Every bird you learn is a small victory!',
      nextNodeId: null,
    },

    // === LEVEL 5: Energetic, go outside ===
    'level-5': {
      id: 'level-5',
      type: 'checklist',
      title: "Let's go birding!",
      description: 'Grab your things:',
      items: [
        { id: 'snacks-human', label: 'Human snacks', optional: false },
        { id: 'snacks-bird', label: 'Bird snacks', optional: true },
        { id: 'water', label: 'Water bottle', optional: false },
        { id: 'keys', label: 'Keys', optional: false },
      ],
      nextNodeId: 'level-5-where',
    },
    'level-5-where': {
      id: 'level-5-where',
      type: 'question',
      title: 'Where to go?',
      options: [
        { label: 'Gerland', emoji: '🌿', nextNodeId: 'level-5-go' },
        { label: 'La Tête d\'Or', emoji: '🏞️', nextNodeId: 'level-5-go' },
        { label: 'Blandan', emoji: '🌳', nextNodeId: 'level-5-go' },
      ],
    },
    'level-5-go': {
      id: 'level-5-go',
      type: 'info',
      title: 'Have fun!',
      description: "Be careful — if you feel any pain, don't ignore it! Sit down, you can do stationary observations too. Even if you stay at a spot 5 minutes from home, it's good.",
      encouragement: 'Getting outside is amazing. Enjoy the birds!',
      nextNodeId: null,
    },
  },
};
