import { cn } from '@/shared/utils/cn'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

// LF CodeStudio (the company) and StudyJA (this product) are proper names
// and must never be run through t() — only the caption below them is
// translated. `compact` is the mobile lockup shown above the login card;
// the non-compact form is the hero mark on the desktop brand panel, which
// already sits above its own tagline/subtitle, so it skips the caption.
export function LoginBrand({ className, compact }: { className?: string; compact?: boolean }) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-col', compact && 'items-center text-center', className)}>
      <span
        className={cn(
          'font-semibold uppercase text-muted-foreground',
          compact ? 'text-[0.65rem] tracking-[0.3em]' : 'text-xs tracking-[0.35em] xl:text-sm',
        )}
      >
        LF CodeStudio
      </span>
      <span
        className={cn(
          'bg-gradient-to-r from-primary to-primary/60 bg-clip-text font-extrabold leading-none tracking-tight text-transparent',
          compact ? 'text-4xl sm:text-5xl' : 'text-5xl xl:text-6xl',
        )}
      >
        StudyJA
      </span>
      {compact && <span className="mt-3 text-sm text-muted-foreground">{t('auth.tagline')}</span>}
    </div>
  )
}
