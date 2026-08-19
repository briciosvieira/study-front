import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppBrand } from '@/shared/components/AppBrand'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh bg-background px-4 py-16">
      <div className="mx-auto max-w-xl">
        <Link
          to="/login"
          className="mb-8 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} />
          {t('about.backToLogin')}
        </Link>

        <AppBrand size="lg" className="mb-8" />

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('about.title')}</h1>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>{t('about.intro')}</p>
          <p>{t('about.purpose')}</p>
          <p>{t('about.restricted')}</p>
        </div>
      </div>
    </div>
  )
}
