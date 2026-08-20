import { useLogout } from '@/features/auth/useAuth'
import { AppBrand } from '@/shared/components/AppBrand'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

// Shown while accessState is POLICY_REJECTED_EXPIRED — the reconsideration
// deadline has already passed and the deletion job hasn't run yet (or is
// about to). There is no accept option here: the backend already rejects
// /policy/accept for this state (DELETION_PENDING_EXECUTION).
export function PolicyDeletionPendingPage() {
  const { t } = useTranslation()
  const logout = useLogout()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        <AppBrand />
        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
          {t('policy.deletionPendingTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('policy.deletionPendingDescription')}</p>
        <Button type="button" variant="secondary" className="mt-6 w-full" onClick={() => logout.mutate()}>
          {t('nav.logout')}
        </Button>
      </div>
    </div>
  )
}
