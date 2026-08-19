import { Link, Outlet } from 'react-router-dom'
import { AppBrand } from '@/shared/components/AppBrand'
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher'
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher'
import { UserMenu } from '@/shared/components/UserMenu'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

export function StudentLayout() {
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <Link to="/student" className="shrink-0">
              <AppBrand size="sm" />
            </Link>
            <Link
              to="/student"
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block"
            >
              {t('nav.myCourses')}
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <LanguageSwitcher compact />
            <ThemeSwitcher compact />
            <div className="ml-1">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
