const encouragements = [
  "You're doing this, and that's already amazing.",
  "One step at a time. You've got this.",
  "Hey, you showed up. That's the hardest part.",
  "Progress, not perfection.",
  "Your future self is thanking you right now.",
  "Small steps still move you forward.",
  "Look at you go!",
  "You're taking care of yourself. That matters.",
  "Every little bit counts.",
  "You're doing so well.",
  "Proud of you for doing this.",
  "This is you being kind to yourself.",
  "You showed up, and that's everything.",
  "One thing at a time. You're doing great.",
  "You've got more strength than you think.",
  "This moment right here? You're winning it.",
  "Gentle progress is still progress.",
  "You deserve this care.",
  "The fact that you started is huge.",
  "Keep going, you're wonderful.",
];

const stopEarlyMessages = [
  "That's enough for now, and that's completely okay.",
  "You did what you could. That counts.",
  "Stopping is a valid choice. Always.",
  "You showed up. That's what matters most.",
  "Rest is productive too.",
  "You can always come back to this later.",
  "No guilt. You did something, and that's enough.",
];

export function getEncouragement(specific?: string): string {
  if (specific) return specific;
  return encouragements[Math.floor(Math.random() * encouragements.length)];
}

export function getStopEarlyMessage(): string {
  return stopEarlyMessages[Math.floor(Math.random() * stopEarlyMessages.length)];
}
