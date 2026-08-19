import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  DICTIONARIES,
  detectBrowserLanguage,
  isLanguage,
  LANGUAGE_STORAGE_KEY,
  type Language,
} from './index'

type TranslateParams = Record<string, string | number>

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: TranslateParams) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'pt-BR'
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return isLanguage(stored) ? stored : detectBrowserLanguage()
}

function lookup(dictionary: unknown, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((node, segment) => {
    if (node && typeof node === 'object' && segment in node) {
      return (node as Record<string, unknown>)[segment]
    }
    return undefined
  }, dictionary)
  return typeof value === 'string' ? value : undefined
}

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, token: string) =>
    token in params ? String(params[token]) : match,
  )
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage)

  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }, [language])

  function setLanguage(next: Language) {
    setLanguageState(next)
  }

  // falls back to the pt-BR string (and finally the raw key) so a missing
  // translation never renders blank while a dictionary is still catching up
  const t = useMemo(() => {
    const dictionary = DICTIONARIES[language];
    return (key: string, params?: TranslateParams) => {
      const template = lookup(dictionary, key) ?? lookup(DICTIONARIES['pt-BR'], key) ?? key
      return interpolate(template, params)
    }
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- context + provider + hook are one cohesive unit
export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
