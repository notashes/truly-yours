import type { Protocol } from '@/types/protocol';

export const cleaningProtocol: Protocol = {
  id: 'cleaning',
  name: 'Cleaning Time',
  emoji: '🧹',
  description: 'Step-by-step cleaning guide',
  color: 'teal',
  source: 'default',
  startNodeId: 'start',
  subProtocolIds: ['laundry', 'shopping'],
  nodes: {
    start: {
      id: 'start',
      type: 'info',
      title: 'Cleaning time!',
      description: "Let's figure out what kind of cleaning works today.",
      nextNodeId: 'feel-check',
    },

    'feel-check': {
      id: 'feel-check',
      type: 'question',
      title: 'How do you feel about water today?',
      options: [
        { label: 'Water ick — no wet stuff today', emoji: '🚫💧', nextNodeId: 'dry-cleaning-start' },
        { label: 'Water is fine!', emoji: '💧', nextNodeId: 'music' },
      ],
    },

    // === WET CLEANING PATH (Option B) ===
    music: {
      id: 'music',
      type: 'instruction',
      title: 'Put on music or audiobook!',
      description: 'Pop in your headphones. Play music or your current audiobook.',
      nextNodeId: 'eaten-check',
    },
    'eaten-check': {
      id: 'eaten-check',
      type: 'info',
      title: 'You have just eaten! Good job!',
      description: "Now your hands are going to get wet, so let's start with the dishes!",
      encouragement: 'Fueling your body is step one!',
      nextNodeId: 'dishes',
    },
    dishes: {
      id: 'dishes',
      type: 'instruction',
      title: 'Wash the dishes!',
      encouragement: 'Yay! Good job!',
      nextNodeId: 'table',
    },
    table: {
      id: 'table',
      type: 'instruction',
      title: 'Clean up the table areas',
      description: 'Your hands are already wet — take advantage of it!',
      encouragement: 'Amazing work!',
      nextNodeId: 'extra-check',
    },

    // Check for laundry / shopping needs
    'extra-check': {
      id: 'extra-check',
      type: 'question',
      title: 'Any extra tasks today?',
      options: [
        { label: 'Laundry bin is full', emoji: '🧺', nextNodeId: 'do-laundry' },
        { label: 'Need to buy food', emoji: '🛒', nextNodeId: 'do-shopping' },
        { label: 'No extra tasks', emoji: '✅', nextNodeId: 'nose-check' },
      ],
    },

    'do-laundry': {
      id: 'do-laundry',
      type: 'info',
      title: 'Laundry time!',
      subProtocolId: 'laundry',
      returnNodeId: 'after-extra',
      nextNodeId: null,
    },
    'do-shopping': {
      id: 'do-shopping',
      type: 'info',
      title: 'Shopping time!',
      subProtocolId: 'shopping',
      returnNodeId: 'after-extra',
      nextNodeId: null,
    },
    'after-extra': {
      id: 'after-extra',
      type: 'info',
      title: 'Extra task done!',
      encouragement: "You're on a roll!",
      nextNodeId: 'nose-check',
    },

    // Bathroom cleaning sequence
    'nose-check': {
      id: 'nose-check',
      type: 'question',
      title: 'Is your nose okay?',
      description: '(For handling cleaning products)',
      options: [
        { label: 'Yes, nose is fine', emoji: '👃', nextNodeId: 'past-week-check' },
        { label: 'No, too sensitive', emoji: '🤧', nextNodeId: 'done-wet' },
      ],
    },
    'past-week-check': {
      id: 'past-week-check',
      type: 'question',
      title: 'Did you do bathroom cleaning this past week?',
      options: [
        { label: 'Yes, already done this week', emoji: '✅', nextNodeId: 'dry-cleaning-start' },
        { label: 'No, not yet', emoji: '🫣', nextNodeId: 'bathroom-start' },
      ],
    },

    // Bathroom sequence
    'bathroom-start': {
      id: 'bathroom-start',
      type: 'info',
      title: "Let's go to the bathroom!",
      description: "Take the sponge (the one for bath and sink) and the cleaning product.",
      nextNodeId: 'sink',
    },
    sink: {
      id: 'sink',
      type: 'checklist',
      title: 'Sink cleaning',
      items: [
        { id: 'rub', label: 'Rub the sink with product all around', optional: false },
        { id: 'rinse', label: 'Rinse with water', optional: false },
      ],
      encouragement: 'Amazing job!',
      nextNodeId: 'bathtub-check',
    },
    'bathtub-check': {
      id: 'bathtub-check',
      type: 'question',
      title: 'Want to do the bathtub too?',
      description: "Only if you're not too tired!",
      options: [
        { label: "Yes, let's do it!", emoji: '🛁', nextNodeId: 'bathtub' },
        { label: 'No, stopping here', emoji: '🛑', nextNodeId: 'done-wet' },
      ],
    },
    bathtub: {
      id: 'bathtub',
      type: 'instruction',
      title: 'Clean the bathtub!',
      description: 'Same thing — sponge and product, scrub, then rinse.',
      encouragement: 'Wow amazing job!!!',
      nextNodeId: 'toilet-check',
    },
    'toilet-check': {
      id: 'toilet-check',
      type: 'question',
      title: 'More energy?? Wow!',
      description: "There's the toilet too!",
      options: [
        { label: "Let's do it!", emoji: '🚽', nextNodeId: 'toilet' },
        { label: 'Done for today', emoji: '🎉', nextNodeId: 'done-wet' },
      ],
    },
    toilet: {
      id: 'toilet',
      type: 'instruction',
      title: 'Clean the toilet!',
      description: 'Take the sponge and product for that (the toilet one!) and go ahead!',
      encouragement: 'Wooow you did so good! You had such an amazing wet cleaning day!!!!',
      nextNodeId: 'done-wet',
    },

    'done-wet': {
      id: 'done-wet',
      type: 'info',
      title: 'Wet cleaning complete!',
      encouragement: 'You did incredible work today!',
      nextNodeId: null,
    },

    // === DRY CLEANING PATH (Op 1) ===
    'dry-cleaning-start': {
      id: 'dry-cleaning-start',
      type: 'info',
      title: 'Dry cleaning time!',
      encouragement: 'Amazing girl!',
      nextNodeId: 'leftovers',
    },
    leftovers: {
      id: 'leftovers',
      type: 'instruction',
      title: 'Put away dishes — you\'ll do them later',
      description: "Just put leftovers in boxes. We're not wasting anything!",
      encouragement: 'Great job!!',
      nextNodeId: 'sweep',
    },
    sweep: {
      id: 'sweep',
      type: 'instruction',
      title: 'Sweep the floor!',
      encouragement: 'Great job!!',
      nextNodeId: 'sweep-trash',
    },
    'sweep-trash': {
      id: 'sweep-trash',
      type: 'instruction',
      title: 'Throw the dirt in the trash can!',
      encouragement: 'Great job!!',
      nextNodeId: 'trash-check',
    },
    'trash-check': {
      id: 'trash-check',
      type: 'question',
      title: 'Are the trash cans full or almost full?',
      description: 'Check for compost as well!',
      options: [
        { label: 'Yes, they need emptying', emoji: '🗑️', nextNodeId: 'trash-out-check' },
        { label: 'No, they\'re fine', emoji: '👍', nextNodeId: 'dry-done' },
      ],
    },
    'trash-out-check': {
      id: 'trash-out-check',
      type: 'question',
      title: 'Close the bags!',
      description: 'Are you going out later today?',
      options: [
        { label: 'Yes, going out later', emoji: '🚶', nextNodeId: 'trash-door' },
        { label: 'No, not going out', emoji: '🏠', nextNodeId: 'trash-now' },
      ],
    },
    'trash-door': {
      id: 'trash-door',
      type: 'instruction',
      title: 'Put the bags by the door',
      description: "You'll take them down when you go out later.",
      encouragement: 'Amazing! Good job!!!!!',
      nextNodeId: 'dry-done',
    },
    'trash-now': {
      id: 'trash-now',
      type: 'instruction',
      title: 'Get them down right now love!',
      encouragement: 'Amazing! Good job!!!!!',
      nextNodeId: 'dry-done',
    },
    'dry-done': {
      id: 'dry-done',
      type: 'info',
      title: 'Dry cleaning complete!',
      encouragement: 'You did such a good job today!',
      nextNodeId: null,
    },
  },
};
