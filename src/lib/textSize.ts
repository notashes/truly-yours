export type TextSizeLevel = 'small' | 'default' | 'large' | 'xl';

const TEXT_SIZE_KEY = 'ty_text_size';

export const TEXT_SIZES: { id: TextSizeLevel; label: string; zoom: number }[] = [
  { id: 'small', label: 'Small', zoom: 0.9 },
  { id: 'default', label: 'Default', zoom: 1.0 },
  { id: 'large', label: 'Large', zoom: 1.15 },
  { id: 'xl', label: 'XL', zoom: 1.3 },
];

export function getStoredTextSize(): TextSizeLevel {
  try {
    const stored = localStorage.getItem(TEXT_SIZE_KEY);
    if (stored && TEXT_SIZES.some(s => s.id === stored)) {
      return stored as TextSizeLevel;
    }
  } catch { /* */ }
  return 'default';
}

export function saveTextSize(level: TextSizeLevel): void {
  try {
    localStorage.setItem(TEXT_SIZE_KEY, level);
  } catch { /* */ }
}

export function applyTextSize(level?: TextSizeLevel): void {
  const size = level ?? getStoredTextSize();
  const entry = TEXT_SIZES.find(s => s.id === size) ?? TEXT_SIZES[1];
  const root = document.getElementById('root');
  if (root) {
    root.style.zoom = entry.zoom === 1 ? '' : String(entry.zoom);
  }
}
