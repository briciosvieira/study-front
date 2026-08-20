import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLogout } from '@/features/auth/useAuth'
import { AppBrand } from '@/shared/components/AppBrand'
import { Button } from '@/shared/components/ui/button'
import { PageSpinner } from '@/shared/components/Spinner'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { useAcceptPolicy, useCurrentPolicy, useDismissPolicyModal, useRejectPolicy } from './usePolicy'

// Shown while accessState is POLICY_PENDING — a full page rather than a
// true overlay (there's no app content to show underneath yet for a
// PENDING user), styled like the app's other centered-card auth screens.
export function PolicyAcceptanceModal() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useLogout()
  const { data, isLoading } = useCurrentPolicy()
  const acceptPolicy = useAcceptPolicy()
  const rejectPolicy = useRejectPolicy()
  const dismissModal = useDismissPolicyModal()

  if (isLoading) return <PageSpinner />
  if (!data?.policyVersion) return null

  const isBusy = acceptPolicy.isPending || rejectPolicy.isPending

  async function handleDismiss() {
    await dismissModal.mutateAsync()
    await logout.mutateAsync()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
        <button
          type="button"
          onClick={handleDismiss}
          disabled={isBusy || dismissModal.isPending}
          aria-label={t('common.close')}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X size={18} />
        </button>

        <AppBrand />
        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
          {data.policyVersion.title}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('policy.version', { version: data.policyVersion.version })}
        </p>

        <div className="mt-4 max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-surface p-4 text-sm leading-6 text-foreground sm:p-5">
          <div className="whitespace-pre-wrap break-words">{data.policyVersion.content}</div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy}
            onClick={() => rejectPolicy.mutate()}
          >
            {t('policy.reject')}
          </Button>
          <Button type="button" disabled={isBusy} onClick={() => acceptPolicy.mutate()}>
            {t('policy.accept')}
          </Button>
        </div>
      </div>
    </div>
  )
}
