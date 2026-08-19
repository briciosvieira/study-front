import en from './en'
import es from './es'
import ptBR, { type Dictionary } from './pt-BR'

export const LANGUAGES = ['pt-BR', 'en', 'es'] as const
export type Language = (typeof LANGUAGES)[number]

export const LANGUAGE_STORAGE_KEY = 'lf-code-studio-language'

export const LANGUAGE_LABELS: Record<Language, { short: string; full: string }> = {
  'pt-BR': { short: 'PT', full: 'Português' },
  en: { short: 'EN', full: 'English' },
  es: { short: 'ES', full: 'Español' },
}

export const DICTIONARIES: Record<Language, Dictionary> = {
  'pt-BR': ptBR,
  en,
  es,
}

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value)
}

export function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'pt-BR'
  const nav = navigator.language?.toLowerCase() ?? ''
  if (nav.startsWith('pt')) return 'pt-BR'
  if (nav.startsWith('es')) return 'es'
  if (nav.startsWith('en')) return 'en'
  return 'pt-BR'
}

export type { Dictionary }
