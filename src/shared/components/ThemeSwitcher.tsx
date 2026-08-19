import { Check, Palette } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { THEME_SWATCHES, THEMES } from '@/shared/theme/themes'
import { useTheme } from '@/shared/theme/ThemeProvider'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function ThemeSwitcher({ compact, className }: { compact?: boolean; className?: string }) {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? 'icon' : 'sm'}
          aria-label={t('theme.label')}
          className={className}
        >
          <Palette size={16} />
          {!compact && t('theme.label')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{t('theme.label')}</DropdownMenuLabel>
        {THEMES.map((option) => {
          const swatch = THEME_SWATCHES[option]
          return (
            <DropdownMenuItem key={option} onSelect={() => setTheme(option)}>
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-border"
                style={{
                  background: `linear-gradient(135deg, ${swatch.background} 50%, ${swatch.primary} 50%)`,
                }}
              />
              <span className="flex-1">{t(`theme.${option}`)}</span>
              {theme === option && <Check size={14} className="text-primary" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
