import type { Protocol } from '@/types/protocol';

export const whatToWearProtocol: Protocol = {
  id: 'what-to-wear',
  name: 'What to Wear',
  emoji: '👗',
  description: 'Weather-based outfit picker',
  color: 'pink',
  source: 'default',
  startNodeId: 'start',
  nodes: {
    start: {
      id: 'start',
      type: 'question',
      title: 'How does your body temperature feel?',
      description: 'This adjusts the weather suggestion for you.',
      options: [
        { label: "I feel cold inside", emoji: '🥶', nextNodeId: 'weather-cold' },
        { label: "I feel hot inside", emoji: '🥵', nextNodeId: 'weather-hot' },
        { label: "Normal / no strong feeling", emoji: '😊', nextNodeId: 'weather-normal' },
      ],
    },

    // Weather nodes (adjusted by inner feeling: cold = -10, hot = +10, normal = as-is)
    'weather-cold': {
      id: 'weather-cold',
      type: 'weather-question',
      title: 'Checking the weather (adjusted -10°C for cold feeling)...',
      temperatureRanges: [
        { label: 'Very cold (below -5°C felt)', minTemp: -100, maxTemp: 5, nextNodeId: 'outfit-freezing' },
        { label: 'Cold (5-15°C felt)', minTemp: 5, maxTemp: 25, nextNodeId: 'outfit-cold' },
        { label: 'Mild (15-25°C felt)', minTemp: 25, maxTemp: 35, nextNodeId: 'outfit-mild' },
        { label: 'Warm (25-35°C felt)', minTemp: 35, maxTemp: 45, nextNodeId: 'outfit-warm' },
        { label: 'Hot (35°C+ felt)', minTemp: 45, maxTemp: 100, nextNodeId: 'outfit-hot' },
      ],
      fallbackNextNodeId: 'manual-temp',
    },
    'weather-hot': {
      id: 'weather-hot',
      type: 'weather-question',
      title: 'Checking the weather (adjusted +10°C for hot feeling)...',
      temperatureRanges: [
        { label: 'Very cold (below -5°C felt)', minTemp: -100, maxTemp: -15, nextNodeId: 'outfit-freezing' },
        { label: 'Cold (5-15°C felt)', minTemp: -15, maxTemp: 5, nextNodeId: 'outfit-cold' },
        { label: 'Mild (15-25°C felt)', minTemp: 5, maxTemp: 15, nextNodeId: 'outfit-mild' },
        { label: 'Warm (25-35°C felt)', minTemp: 15, maxTemp: 25, nextNodeId: 'outfit-warm' },
        { label: 'Hot (35°C+ felt)', minTemp: 25, maxTemp: 100, nextNodeId: 'outfit-hot' },
      ],
      fallbackNextNodeId: 'manual-temp',
    },
    'weather-normal': {
      id: 'weather-normal',
      type: 'weather-question',
      title: 'Checking the weather...',
      temperatureRanges: [
        { label: 'Very cold (below -5°C)', minTemp: -100, maxTemp: -5, nextNodeId: 'outfit-freezing' },
        { label: 'Cold (5-15°C)', minTemp: -5, maxTemp: 15, nextNodeId: 'outfit-cold' },
        { label: 'Mild (15-25°C)', minTemp: 15, maxTemp: 25, nextNodeId: 'outfit-mild' },
        { label: 'Warm (25-35°C)', minTemp: 25, maxTemp: 35, nextNodeId: 'outfit-warm' },
        { label: 'Hot (35°C+)', minTemp: 35, maxTemp: 100, nextNodeId: 'outfit-hot' },
      ],
      fallbackNextNodeId: 'manual-temp',
    },

    // Fallback manual temperature
    'manual-temp': {
      id: 'manual-temp',
      type: 'question',
      title: "What's it like outside?",
      options: [
        { label: 'Freezing cold', emoji: '🥶', nextNodeId: 'outfit-freezing' },
        { label: 'Cold', emoji: '🧣', nextNodeId: 'outfit-cold' },
        { label: 'Mild', emoji: '🌤️', nextNodeId: 'outfit-mild' },
        { label: 'Warm/Hot', emoji: '☀️', nextNodeId: 'outfit-warm' },
      ],
    },

    // === OUTFIT SUGGESTIONS ===
    'outfit-freezing': {
      id: 'outfit-freezing',
      type: 'question',
      title: 'Very cold outfit!',
      description: 'Pick a base layer:',
      options: [
        { label: 'Turtle neck + jumper', emoji: '🧥', nextNodeId: 'freezing-option1' },
        { label: 'Tee + warm jumper or tech jumper', emoji: '👕', nextNodeId: 'freezing-option2' },
      ],
    },
    'freezing-option1': {
      id: 'freezing-option1',
      type: 'checklist',
      title: 'Layer up!',
      items: [
        { id: 'turtleneck', label: 'Turtle neck', optional: false },
        { id: 'jumper', label: 'Any jumper on top', optional: false },
        { id: 'pants', label: 'Pants', optional: false },
        { id: 'leggings', label: 'Leggings under pants (optional if sensory ick)', optional: true },
      ],
      nextNodeId: 'freezing-outside',
    },
    'freezing-option2': {
      id: 'freezing-option2',
      type: 'checklist',
      title: 'Layer up!',
      items: [
        { id: 'tee', label: 'Tee (or long tee)', optional: false },
        { id: 'jumper', label: 'Black warm jumper or Decath tech jumper', optional: false },
        { id: 'pants', label: 'Pants', optional: false },
        { id: 'leggings', label: 'Leggings (optional)', optional: true },
      ],
      nextNodeId: 'freezing-outside2',
    },
    'freezing-outside': {
      id: 'freezing-outside',
      type: 'checklist',
      title: 'Outside add:',
      items: [
        { id: 'beanie', label: 'Beanie', optional: false },
        { id: 'gloves', label: 'Gloves', optional: false },
        { id: 'coat', label: 'Big coat', optional: false },
      ],
      encouragement: "Bundle up! You'll be cozy!",
      nextNodeId: null,
    },
    'freezing-outside2': {
      id: 'freezing-outside2',
      type: 'checklist',
      title: 'Outside add:',
      items: [
        { id: 'coat', label: 'Big coat', optional: false },
        { id: 'gloves', label: 'Gloves', optional: false },
        { id: 'neck', label: 'Neck cover', optional: false },
      ],
      encouragement: "You're going to be so warm and cozy!",
      nextNodeId: null,
    },

    'outfit-cold': {
      id: 'outfit-cold',
      type: 'checklist',
      title: 'Cold weather outfit',
      items: [
        { id: 'tee', label: 'Tee', optional: false },
        { id: 'jumper', label: 'Any jumper from the list', optional: false },
        { id: 'bottom', label: 'Pants or skirt with leggings', optional: false },
      ],
      nextNodeId: 'cold-outside',
    },
    'cold-outside': {
      id: 'cold-outside',
      type: 'checklist',
      title: 'Outside add:',
      items: [
        { id: 'coat', label: 'Mid coat', optional: false },
        { id: 'gloves', label: 'Gloves', optional: false },
        { id: 'beanie', label: 'Beanie', optional: true },
        { id: 'neck', label: 'Neck cover (can remove later)', optional: true },
      ],
      encouragement: 'Looking good!',
      nextNodeId: null,
    },

    'outfit-mild': {
      id: 'outfit-mild',
      type: 'checklist',
      title: 'Mild weather outfit',
      items: [
        { id: 'tee', label: 'Tee', optional: false },
        { id: 'layer', label: 'Jumper or jacket', optional: false },
        { id: 'pants', label: 'Pants', optional: false },
      ],
      encouragement: 'Nice and comfy!',
      nextNodeId: null,
    },

    'outfit-warm': {
      id: 'outfit-warm',
      type: 'question',
      title: 'Warm weather — pick a vibe!',
      options: [
        { label: 'Tee + shorts or light pants', emoji: '👕', nextNodeId: 'warm-casual' },
        { label: 'A dress!', emoji: '👗', nextNodeId: 'warm-dress' },
      ],
    },
    'warm-casual': {
      id: 'warm-casual',
      type: 'checklist',
      title: 'Warm casual outfit',
      items: [
        { id: 'tee', label: 'Tee', optional: false },
        { id: 'bottom', label: 'Shorts, green pants, skirt, yellow pants, or black thin pants', optional: false },
      ],
      encouragement: 'Looking fresh!',
      nextNodeId: null,
    },
    'warm-dress': {
      id: 'warm-dress',
      type: 'instruction',
      title: 'Dress time!',
      description: 'Indian dress, pink dress, or another favorite!',
      encouragement: 'You look amazing!',
      nextNodeId: null,
    },

    'outfit-hot': {
      id: 'outfit-hot',
      type: 'question',
      title: "It's hot! Stay cool!",
      options: [
        { label: 'Pink dress', emoji: '👗', nextNodeId: 'hot-dress' },
        { label: 'Tank top + shorts', emoji: '🩳', nextNodeId: 'hot-casual' },
        { label: 'Stay in pyjamas', emoji: '😴', nextNodeId: 'hot-pj' },
      ],
    },
    'hot-dress': {
      id: 'hot-dress',
      type: 'instruction',
      title: 'Pink dress it is!',
      encouragement: 'Perfect choice for a hot day!',
      nextNodeId: null,
    },
    'hot-casual': {
      id: 'hot-casual',
      type: 'instruction',
      title: 'Tank top and shorts!',
      encouragement: 'Stay cool and comfy!',
      nextNodeId: null,
    },
    'hot-pj': {
      id: 'hot-pj',
      type: 'instruction',
      title: 'Pyjamas are a valid outfit!',
      encouragement: 'Comfort is king on hot days!',
      nextNodeId: null,
    },
  },
};
