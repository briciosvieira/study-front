import { Braces, Code2, Terminal } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher'
import { LoginBrand } from '@/shared/components/LoginBrand'
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

export function AuthLayout() {
  const { t } = useTranslation()

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background lg:flex-row">
      {/* extremely subtle theme-driven glow — no photo, just tokens */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[32rem] w-[32rem] rounded-full opacity-[0.12] blur-3xl"
        style={{ background: 'var(--primary)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 -z-10 h-[32rem] w-[32rem] rounded-full opacity-[0.08] blur-3xl"
        style={{ background: 'var(--accent-foreground)' }}
      />

      <div className="flex items-center justify-end gap-1 p-4 pt-[max(1rem,env(safe-area-inset-top))] lg:hidden">
        <LanguageSwitcher compact />
        <ThemeSwitcher compact />
      </div>

      {/* Brand panel — hidden on mobile, primary showcase on desktop */}
      <div className="relative hidden overflow-hidden bg-sidebar lg:flex lg:w-1/2 lg:flex-col lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(var(--sidebar-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--sidebar-foreground) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* brand + tagline read as one composed block, vertically centered in
            the space above the decorative icons — not spread apart by
            justify-between, which is what pushed them far apart before */}
        <div className="relative flex flex-1 flex-col justify-center gap-10 xl:gap-12">
          <LoginBrand />

          <div className="max-w-md">
            <h1 className="text-4xl font-semibold tracking-tight text-sidebar-foreground xl:text-[2.75rem]">
              {t('auth.tagline')}
            </h1>
            <p className="mt-4 text-sidebar-foreground/70">{t('auth.heroSubtitle')}</p>
          </div>
        </div>

        <div className="relative flex items-center gap-4 text-sidebar-foreground/40">
          <Code2 size={22} />
          <Terminal size={22} />
          <Braces size={22} />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <div className="hidden w-full max-w-sm items-center justify-end gap-1 pb-5 lg:flex lg:max-w-md">
          <LanguageSwitcher compact />
          <ThemeSwitcher compact />
        </div>

        <div className="mb-8 lg:hidden">
          <LoginBrand compact />
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl lg:max-w-md">
          <Outlet />
        </div>

        <Link
          to="/about"
          className="mt-6 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {t('auth.aboutLink')}
        </Link>
      </div>
    </div>
  )
}
