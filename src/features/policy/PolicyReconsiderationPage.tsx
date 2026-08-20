import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useLogout } from '@/features/auth/useAuth'
import { AppBrand } from '@/shared/components/AppBrand'
import { PageSpinner } from '@/shared/components/Spinner'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { formatDateTime } from '@/shared/utils/formatDate'
import { PolicyRevocationNoticeScreen } from './PolicyRevocationNoticeScreen'
import { useAcceptPolicy, useCurrentPolicy } from './usePolicy'

interface LocationState {
  justRevoked?: boolean
}

// Shown while accessState is POLICY_REJECTED_RECOVERABLE — the user
// previously rejected the policy (or just withdrew acceptance from their
// profile) and still has time to reconsider before scheduledDeletionAt.
export function PolicyReconsiderationPage() {
  const { t, language } = useTranslation()
  const location = useLocation()
  const logout = useLogout()
  const { data, isLoading } = useCurrentPolicy()
  const acceptPolicy = useAcceptPolicy()
  const [showPolicyText, setShowPolicyText] = useState(false)

  if (isLoading) return <PageSpinner />
  if (!data?.acceptance?.scheduledDeletionAt) return null

  const justRevoked = (location.state as LocationState | null)?.justRevoked
  if (justRevoked) {
    return <PolicyRevocationNoticeScreen scheduledDeletionAt={data.acceptance.scheduledDeletionAt} />
  }

  const formattedDeadline = formatDateTime(data.acceptance.scheduledDeletionAt, language)

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-xl">
        <AppBrand />
        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
          {t('policy.reconsiderationTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('policy.reconsiderationDescription')}</p>

        <div className="mt-4 rounded-lg border border-danger/30 bg-danger/5 p-4">
          <p className="text-sm font-medium text-foreground">{t('policy.deletionScheduledFor')}</p>
          <p className="mt-1 text-lg font-semibold text-danger">{formattedDeadline}</p>
        </div>

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
            {t('policy.acceptAndKeep')}
          </Button>
          <Button type="button" variant="ghost" onClick={() => logout.mutate()}>
            {t('nav.logout')}
          </Button>
        </div>
      </div>
    </div>
  )
}
