export interface Reminder {
  id: string;
  protocolId: string;
  protocolName: string;
  protocolEmoji: string;
  time: string;        // "HH:MM" format
  days: number[];      // 0=Sun, 1=Mon...6=Sat. Empty = every day
  enabled: boolean;
}

const REMINDERS_KEY = 'ty_reminders';
let activeTimers: number[] = [];

export function getReminders(): Reminder[] {
  try {
    return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]');
  } catch { return []; }
}

export function saveReminders(reminders: Reminder[]): void {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch { /* */ }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

function showNotification(reminder: Reminder) {
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(`${reminder.protocolEmoji} ${reminder.protocolName}`, {
      body: 'Time for your routine',
      tag: reminder.id,

    });
  } catch {
    // Service worker only environments
    navigator.serviceWorker?.ready?.then(reg => {
      reg.showNotification(`${reminder.protocolEmoji} ${reminder.protocolName}`, {
        body: 'Time for your routine',
        tag: reminder.id,
  
      });
    });
  }
}

export function scheduleReminders(): void {
  // Clear existing timers
  for (const t of activeTimers) clearTimeout(t);
  activeTimers = [];

  if (Notification.permission !== 'granted') return;

  const reminders = getReminders();
  const now = new Date();
  const today = now.getDay(); // 0=Sun

  for (const r of reminders) {
    if (!r.enabled) continue;
    // Check if today is in the days list (empty = every day)
    if (r.days.length > 0 && !r.days.includes(today)) continue;

    const [h, m] = r.time.split(':').map(Number);
    const target = new Date(now);
    target.setHours(h, m, 0, 0);

    const delay = target.getTime() - now.getTime();
    if (delay <= 0) continue; // Already passed today

    const timer = window.setTimeout(() => showNotification(r), delay);
    activeTimers.push(timer);
  }
}

export function cancelScheduledReminders(): void {
  for (const t of activeTimers) clearTimeout(t);
  activeTimers = [];
}
