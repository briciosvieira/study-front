import { Check, Languages } from 'lucide-react'
import { LANGUAGES, LANGUAGE_LABELS } from '@/shared/i18n'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function LanguageSwitcher({ compact, className }: { compact?: boolean; className?: string }) {
  const { language, setLanguage, t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? 'icon' : 'sm'}
          aria-label={t('language.label')}
          className={className}
        >
          <Languages size={16} />
          {!compact && LANGUAGE_LABELS[language].short}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{t('language.label')}</DropdownMenuLabel>
        {LANGUAGES.map((option) => (
          <DropdownMenuItem key={option} onSelect={() => setLanguage(option)}>
            <span className="w-6 shrink-0 text-xs font-semibold text-muted-foreground">
              {LANGUAGE_LABELS[option].short}
            </span>
            <span className="flex-1">{LANGUAGE_LABELS[option].full}</span>
            {language === option && <Check size={14} className="text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
