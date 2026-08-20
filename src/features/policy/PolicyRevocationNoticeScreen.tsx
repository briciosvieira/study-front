import { useEffect, useState } from 'react'
import { useLogout } from '@/features/auth/useAuth'
import { AppBrand } from '@/shared/components/AppBrand'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { formatDateTime } from '@/shared/utils/formatDate'

const NOTICE_SECONDS = 60

interface PolicyRevocationNoticeScreenProps {
  scheduledDeletionAt: string
}

// Shown once, immediately after a profile-initiated "Retirar aceite".
// Purely informational: by the time this renders, the backend has already
// blocked normal access (accessState is no longer POLICY_ACCEPTED), so this
// countdown is not a grace period — it just gives the user a clear, timed
// heads-up before the session ends. Closing the browser here doesn't change
// anything: the decision was already persisted server-side.
export function PolicyRevocationNoticeScreen({ scheduledDeletionAt }: PolicyRevocationNoticeScreenProps) {
  const { t, language } = useTranslation()
  const logout = useLogout()
  const [secondsLeft, setSecondsLeft] = useState(NOTICE_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) {
      logout.mutate()
      return
    }
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        <AppBrand />
        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
          {t('policy.revocationNoticeTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('policy.revocationNoticeReconsiderUntil', {
            date: formatDateTime(scheduledDeletionAt, language),
          })}
        </p>
        <p className="mt-4 text-sm font-medium text-foreground">
          {t('policy.revocationNoticeCountdown', { seconds: secondsLeft })}
        </p>
        <Button type="button" variant="secondary" className="mt-6 w-full" onClick={() => logout.mutate()}>
          {t('nav.logout')}
        </Button>
      </div>
    </div>
  )
}
