import type { LucideIcon } from 'lucide-react'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth, useLogout } from '@/features/auth/useAuth'
import { NotificationBell } from '@/features/audit/NotificationBell'
import { AppBrand } from '@/shared/components/AppBrand'
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher'
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher'
import { UserAvatar } from '@/shared/components/UserMenu'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { cn } from '@/shared/utils/cn'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export function DashboardLayout({ areaLabel, navItems }: { areaLabel: string; navItems: NavItem[] }) {
  const { user } = useAuth()
  const logout = useLogout()
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-dvh bg-background">
      {mobileOpen && (
        <div
          aria-hidden
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-sidebar-foreground/10 bg-sidebar transition-transform duration-200 ease-out',
          'pl-[env(safe-area-inset-left)] lg:static lg:z-auto lg:w-72 lg:translate-x-0 lg:pl-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <AppBrand />
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button
              onClick={() => setMobileOpen(false)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-foreground/10 lg:hidden"
              aria-label={t('common.close')}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <p className="px-5 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          {areaLabel}
        </p>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors',
                  'hover:bg-sidebar-foreground/[0.06] hover:text-sidebar-foreground',
                  isActive && 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary',
                )
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-foreground/10 p-4">
          <div className="mb-3 flex items-center gap-1">
            <ThemeSwitcher compact />
            <LanguageSwitcher compact />
          </div>

          <div className="flex items-center gap-2.5 rounded-lg px-1 py-1">
            <UserAvatar name={user?.name ?? ''} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/50">{user?.email}</p>
            </div>
            <button
              onClick={() => logout.mutate()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/50 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
              aria-label={t('nav.logout')}
              title={t('nav.logout')}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-surface px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-accent"
            aria-label={t('nav.courses')}
          >
            <Menu size={20} />
          </button>
          <AppBrand size="sm" />
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
