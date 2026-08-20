import { useLogout } from '@/features/auth/useAuth'
import { AppBrand } from '@/shared/components/AppBrand'
import { PageSpinner } from '@/shared/components/Spinner'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { formatDateTime } from '@/shared/utils/formatDate'
import { useCurrentPolicy } from './usePolicy'

// Shown while accessState is REACTIVATION_REQUESTED — the user already
// re-accepted during a review hold and is waiting on an admin decision.
// Never promises reactivation (see section 41 of the review-hold spec) —
// only confirms the request was recorded.
export function PolicyReactivationRequestedPage() {
  const { t, language } = useTranslation()
  const logout = useLogout()
  const { data, isLoading } = useCurrentPolicy()

  if (isLoading) return <PageSpinner />

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        <AppBrand />
        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
          {t('policy.reactivationRequestedTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('policy.reactivationRequestedDescription')}</p>
        {data?.acceptance?.reactivationRequestedAt && (
          <p className="mt-4 text-xs text-muted-foreground">
            {t('policy.reactivationRequestedOn', {
              date: formatDateTime(data.acceptance.reactivationRequestedAt, language),
            })}
          </p>
        )}
        <Button type="button" variant="secondary" className="mt-6 w-full" onClick={() => logout.mutate()}>
          {t('nav.logout')}
        </Button>
      </div>
    </div>
  )
}
