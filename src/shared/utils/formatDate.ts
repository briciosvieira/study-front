import type { Language } from '@/shared/i18n'

export function formatDate(isoDate: string, language: Language): string {
  return new Intl.DateTimeFormat(language, { dateStyle: 'short' }).format(new Date(isoDate))
}
