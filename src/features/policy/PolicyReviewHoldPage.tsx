import { useEffect, useState } from 'react'
import { useLogout } from '@/features/auth/useAuth'
import { AppBrand } from '@/shared/components/AppBrand'
import { PageSpinner } from '@/shared/components/Spinner'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { useAcceptPolicy, useCurrentPolicy } from './usePolicy'

// Ticks once a minute — day/hour/minute precision is all the UI shows, no
// need for a per-second re-render. Recomputed from the stored deadline every
// tick, so an F5 mid-window always shows the correct remaining time (the
// backend is the only source of truth, per section 13 of the review-hold spec).
function useCountdown(targetIso: string | null) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  if (!targetIso) return null
  const diffMs = Math.max(0, new Date(targetIso).getTime() - now)
  const days = Math.floor(diffMs / 86_400_000)
  const hours = Math.floor((diffMs % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000)
  return { days, hours, minutes }
}

// Shown while accessState is POLICY_REVIEW_HOLD — a consolidated (>=
// ESTABLISHED_ACCOUNT_DAYS old) account that withdrew/rejected the policy.
// Re-accepting here does NOT restore access by itself (see usePolicy's
// useAcceptPolicy, which server-side routes into a reactivation request for
// this state) — it only asks an admin to review it.
export function PolicyReviewHoldPage() {
  const { t } = useTranslation()
  const logout = useLogout()
  const { data, isLoading } = useCurrentPolicy()
  const acceptPolicy = useAcceptPolicy()
  const [showPolicyText, setShowPolicyText] = useState(false)
  const countdown = useCountdown(data?.acceptance?.policyReviewUntil ?? null)

  if (isLoading) return <PageSpinner />
  if (!data?.acceptance) return null

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-xl">
        <AppBrand />
        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
          {t('policy.reviewHoldTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('policy.reviewHoldDescription')}</p>

        {countdown && (
          <div className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-4 text-center">
            <p className="text-sm font-medium text-foreground">{t('policy.reviewHoldRemaining')}</p>
            <p className="mt-1 text-lg font-semibold text-warning">
              {t('policy.reviewHoldCountdown', countdown)}
            </p>
          </div>
        )}

        {showPolicyText && data.policyVersion && (
          <div className="mt-4 max-h-64 overflow-y-auto rounded-lg border border-border bg-surface p-4 text-sm text-foreground">
            <p className="whitespace-pre-wrap">{data.policyVersion.content}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <Button type="button" variant="secondary" onClick={() => setShowPolicyText((v) => !v)}>
            {t('policy.viewPolicy')}
          </Button>
          <Button type="button" disabled={acceptPolicy.isPending} onClick={() => acceptPolicy.mutate()}>
            {t('policy.requestReactivation')}
          </Button>
          <Button type="button" variant="ghost" onClick={() => logout.mutate()}>
            {t('nav.logout')}
          </Button>
        </div>
      </div>
    </div>
  )
}
