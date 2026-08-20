import { useLogout } from '@/features/auth/useAuth'
import { AppBrand } from '@/shared/components/AppBrand'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

// Shown while accessState is PENDING_ADMIN_DECISION — the consolidated
// account's review window has passed with no admin decision yet. There is
// no accept/reactivate action here (re-accepting wouldn't change anything —
// the account is already ACCEPTED and simply waiting) and no auto-delete
// ever happens for this state (see section 21/24 of the review-hold spec).
export function PolicySuspendedPage() {
  const { t } = useTranslation()
  const logout = useLogout()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        <AppBrand />
        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
          {t('policy.suspendedTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('policy.suspendedDescription')}</p>
        <Button type="button" variant="secondary" className="mt-6 w-full" onClick={() => logout.mutate()}>
          {t('nav.logout')}
        </Button>
      </div>
    </div>
  )
}
