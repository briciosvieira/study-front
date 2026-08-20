export const THEMES = ['light', 'slate', 'dark', 'rose', 'blue'] as const
export type Theme = (typeof THEMES)[number]

export const THEME_STORAGE_KEY = 'lf-code-studio-theme'

// Small swatch used by ThemeSwitcher to preview each palette without
// duplicating the full token set defined in index.css.
export const THEME_SWATCHES: Record<Theme, { background: string; primary: string }> = {
  light: { background: '#fafafa', primary: '#18181b' },
  slate: { background: '#20252a', primary: '#7f95aa' },
  dark: { background: '#0c0c0e', primary: '#f4f4f5' },
  rose: { background: '#fffafb', primary: '#b1436a' },
  blue: { background: '#f7f9fd', primary: '#3358d6' },
}

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}

// Sonner ships its own light/dark palette and doesn't read our --card/--foreground
// tokens automatically, so without this it always renders light (white) toasts —
// this keeps it in sync with whichever of our themes is active.
const DARK_LIKE_THEMES: readonly Theme[] = ['dark', 'slate']

export function toSonnerTheme(theme: Theme): 'light' | 'dark' {
  return DARK_LIKE_THEMES.includes(theme) ? 'dark' : 'light'
}
