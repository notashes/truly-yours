export type PaletteId = 'sage-garden' | 'warm-earth' | 'ocean-calm' | 'soft-blossom';

export interface Palette {
  id: PaletteId;
  name: string;
  emoji: string;
  description: string;
  themeColor: string;
  darkThemeColor: string;
  colors: Record<string, string>;
  darkColors: Record<string, string>;
}

export const PALETTE_STORAGE_KEY = 'ty_active_palette';
export const DARK_MODE_KEY = 'ty_dark_mode';
export const DEFAULT_PALETTE_ID: PaletteId = 'sage-garden';

export const PALETTES: Palette[] = [
  {
    id: 'sage-garden',
    name: 'Sage Garden',
    emoji: '🌿',
    description: 'Calming green — nature-inspired',
    themeColor: '#F6F8F3',
    darkThemeColor: '#1A1C18',
    colors: {
      'surface': '#F6F8F3',
      'surface-dim': '#E3E8DC',
      'surface-container': '#EBF0E4',
      'surface-container-low': '#F1F5EB',
      'surface-container-high': '#DFE5D7',
      'surface-variant': '#D4DCCC',
      'primary': '#7B9B7B',
      'primary-light': '#C8DCC8',
      'primary-container': '#D8ECD8',
      'on-primary': '#FFFFFF',
      'on-primary-container': '#0E2410',
      'secondary': '#6B7F6B',
      'secondary-container': '#D4E4D4',
      'on-secondary-container': '#142014',
      'tertiary': '#6B7A5E',
      'tertiary-container': '#D6E2C8',
      'on-surface': '#1A1C18',
      'on-surface-variant': '#434840',
      'outline': '#747970',
      'outline-variant': '#C4CABC',
      'success': '#3B6939',
      'success-container': '#BCEDB6',
      'error': '#BA1A1A',
      'error-container': '#FFDAD6',
    },
    darkColors: {
      'surface': '#1A1C18',
      'surface-dim': '#121410',
      'surface-container': '#1E201C',
      'surface-container-low': '#1A1C18',
      'surface-container-high': '#282B24',
      'surface-variant': '#434840',
      'primary': '#8FB58F',
      'primary-light': '#3D5A3D',
      'primary-container': '#2A4A2A',
      'on-primary': '#1A1C18',
      'on-primary-container': '#C8DCC8',
      'secondary': '#8FA18F',
      'secondary-container': '#2A3C2A',
      'on-secondary-container': '#C4D8C4',
      'tertiary': '#8B9A7E',
      'tertiary-container': '#2E3D24',
      'on-surface': '#E3E8DC',
      'on-surface-variant': '#C4CABC',
      'outline': '#8D9286',
      'outline-variant': '#434840',
      'success': '#6BBF66',
      'success-container': '#1A3A18',
      'error': '#FFB4AB',
      'error-container': '#93000A',
    },
  },
  {
    id: 'warm-earth',
    name: 'Warm Earth',
    emoji: '🏜️',
    description: 'Clay & terracotta on warm cream',
    themeColor: '#FDF8F3',
    darkThemeColor: '#1C1B18',
    colors: {
      'surface': '#FDF8F3',
      'surface-dim': '#EDE7E0',
      'surface-container': '#F3ECE4',
      'surface-container-low': '#F8F2EB',
      'surface-container-high': '#E8E1D8',
      'surface-variant': '#DED7CD',
      'primary': '#C07A5F',
      'primary-light': '#F0D5C7',
      'primary-container': '#FADDD0',
      'on-primary': '#FFFFFF',
      'on-primary-container': '#351208',
      'secondary': '#8B6F5E',
      'secondary-container': '#F2DDD4',
      'on-secondary-container': '#2A1912',
      'tertiary': '#7D6B50',
      'tertiary-container': '#E8D9C4',
      'on-surface': '#1C1B18',
      'on-surface-variant': '#4A4740',
      'outline': '#7B7770',
      'outline-variant': '#CCC6BD',
      'success': '#3B6939',
      'success-container': '#BCEDB6',
      'error': '#BA1A1A',
      'error-container': '#FFDAD6',
    },
    darkColors: {
      'surface': '#1C1B18',
      'surface-dim': '#141310',
      'surface-container': '#21201C',
      'surface-container-low': '#1C1B18',
      'surface-container-high': '#2C2A26',
      'surface-variant': '#4A4740',
      'primary': '#D4957A',
      'primary-light': '#5A3020',
      'primary-container': '#4A2818',
      'on-primary': '#1C1B18',
      'on-primary-container': '#F0D5C7',
      'secondary': '#A5897A',
      'secondary-container': '#3A2820',
      'on-secondary-container': '#E8D0C4',
      'tertiary': '#9A8870',
      'tertiary-container': '#3A3020',
      'on-surface': '#EDE7E0',
      'on-surface-variant': '#CCC6BD',
      'outline': '#948F88',
      'outline-variant': '#4A4740',
      'success': '#6BBF66',
      'success-container': '#1A3A18',
      'error': '#FFB4AB',
      'error-container': '#93000A',
    },
  },
  {
    id: 'ocean-calm',
    name: 'Ocean Calm',
    emoji: '🌊',
    description: 'Dusty blue for calm focus',
    themeColor: '#F3F6F8',
    darkThemeColor: '#181C1E',
    colors: {
      'surface': '#F3F6F8',
      'surface-dim': '#DEE4E8',
      'surface-container': '#E6ECF0',
      'surface-container-low': '#ECF1F4',
      'surface-container-high': '#D8E0E5',
      'surface-variant': '#CDD6DC',
      'primary': '#6E8CA0',
      'primary-light': '#C2D4E0',
      'primary-container': '#D0E3F0',
      'on-primary': '#FFFFFF',
      'on-primary-container': '#0A1E2C',
      'secondary': '#637880',
      'secondary-container': '#CADAE2',
      'on-secondary-container': '#121E24',
      'tertiary': '#6A7B80',
      'tertiary-container': '#D0DDE2',
      'on-surface': '#181C1E',
      'on-surface-variant': '#40474A',
      'outline': '#707880',
      'outline-variant': '#BFC8CE',
      'success': '#3B6939',
      'success-container': '#BCEDB6',
      'error': '#BA1A1A',
      'error-container': '#FFDAD6',
    },
    darkColors: {
      'surface': '#181C1E',
      'surface-dim': '#101416',
      'surface-container': '#1C2124',
      'surface-container-low': '#181C1E',
      'surface-container-high': '#262C30',
      'surface-variant': '#40474A',
      'primary': '#88A8BE',
      'primary-light': '#2A4458',
      'primary-container': '#1C3A50',
      'on-primary': '#181C1E',
      'on-primary-container': '#C2D4E0',
      'secondary': '#809098',
      'secondary-container': '#243038',
      'on-secondary-container': '#BCD0D8',
      'tertiary': '#849498',
      'tertiary-container': '#263034',
      'on-surface': '#DEE4E8',
      'on-surface-variant': '#BFC8CE',
      'outline': '#8A9298',
      'outline-variant': '#40474A',
      'success': '#6BBF66',
      'success-container': '#1A3A18',
      'error': '#FFB4AB',
      'error-container': '#93000A',
    },
  },
  {
    id: 'soft-blossom',
    name: 'Soft Blossom',
    emoji: '🌸',
    description: 'Dusty rose on blush cream',
    themeColor: '#F8F3F6',
    darkThemeColor: '#1C181A',
    colors: {
      'surface': '#F8F3F6',
      'surface-dim': '#EBE2E7',
      'surface-container': '#F0E8EC',
      'surface-container-low': '#F5EDF1',
      'surface-container-high': '#E5DCE2',
      'surface-variant': '#DCD3D8',
      'primary': '#A07B8E',
      'primary-light': '#DEC8D4',
      'primary-container': '#ECD8E2',
      'on-primary': '#FFFFFF',
      'on-primary-container': '#2A0E1C',
      'secondary': '#847078',
      'secondary-container': '#EAD6DE',
      'on-secondary-container': '#241520',
      'tertiary': '#80706B',
      'tertiary-container': '#E2D4CE',
      'on-surface': '#1C181A',
      'on-surface-variant': '#4A4346',
      'outline': '#7C7478',
      'outline-variant': '#CEC4C8',
      'success': '#3B6939',
      'success-container': '#BCEDB6',
      'error': '#BA1A1A',
      'error-container': '#FFDAD6',
    },
    darkColors: {
      'surface': '#1C181A',
      'surface-dim': '#141012',
      'surface-container': '#211C1F',
      'surface-container-low': '#1C181A',
      'surface-container-high': '#2C2628',
      'surface-variant': '#4A4346',
      'primary': '#BA96A8',
      'primary-light': '#4E3040',
      'primary-container': '#422638',
      'on-primary': '#1C181A',
      'on-primary-container': '#DEC8D4',
      'secondary': '#9E8A92',
      'secondary-container': '#362830',
      'on-secondary-container': '#DCC8D0',
      'tertiary': '#9A8A86',
      'tertiary-container': '#362C28',
      'on-surface': '#EBE2E7',
      'on-surface-variant': '#CEC4C8',
      'outline': '#968C90',
      'outline-variant': '#4A4346',
      'success': '#6BBF66',
      'success-container': '#1A3A18',
      'error': '#FFB4AB',
      'error-container': '#93000A',
    },
  },
];

export function applyPalette(paletteId: PaletteId): void {
  const palette = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0];
  const dark = isDarkMode();
  const colors = dark ? palette.darkColors : palette.colors;
  const root = document.documentElement;

  for (const [name, value] of Object.entries(colors)) {
    root.style.setProperty(`--color-${name}`, value);
  }

  const themeColor = dark ? palette.darkThemeColor : palette.themeColor;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', themeColor);
  }
}

export function getStoredPaletteId(): PaletteId {
  try {
    const stored = localStorage.getItem(PALETTE_STORAGE_KEY);
    if (stored && PALETTES.some(p => p.id === stored)) {
      return stored as PaletteId;
    }
  } catch { /* localStorage unavailable */ }
  return DEFAULT_PALETTE_ID;
}

export function savePaletteId(id: PaletteId): void {
  try {
    localStorage.setItem(PALETTE_STORAGE_KEY, id);
  } catch { /* localStorage unavailable */ }
}

export function isDarkMode(): boolean {
  try {
    return localStorage.getItem(DARK_MODE_KEY) === 'true';
  } catch { return false; }
}

export function saveDarkMode(dark: boolean): void {
  try {
    localStorage.setItem(DARK_MODE_KEY, dark ? 'true' : 'false');
  } catch { /* localStorage unavailable */ }
}

export function applyTheme(): void {
  applyPalette(getStoredPaletteId());
}
