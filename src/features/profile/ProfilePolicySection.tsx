import { Check } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentPolicy, useRevokePolicy } from '@/features/policy/usePolicy'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { formatDate, formatDateTime } from '@/shared/utils/formatDate'

const MS_PER_DAY = 24 * 60 * 60 * 1000

// Only ever renders for an ACCEPTED user — a PENDING/REJECTED user never
// reaches "Meu Perfil" in the first place (see RequireAuth). Lets the user
// review the accepted version and withdraw acceptance, which the backend
// treats as a simultaneous request for account deletion.
export function ProfilePolicySection() {
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const { data } = useCurrentPolicy()
  const revokePolicy = useRevokePolicy()
  const [showPolicyText, setShowPolicyText] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!data?.policyVersion || !data.acceptance || data.acceptance.status !== 'ACCEPTED') {
    return null
  }

  const { policyVersion, acceptance, reconsiderationDays, reviewHoldDays, isEstablishedAccount } = data
  const projectedDeletionDate = new Date(Date.now() + reconsiderationDays * MS_PER_DAY).toISOString()

  async function handleConfirmRevoke() {
    await revokePolicy.mutateAsync()
    setConfirmOpen(false)
    // A consolidated account never faces an imminent deletion deadline (see
    // PolicyReviewHoldPage), so the extra 60s "access has ended" interstitial
    // that exists specifically for the short deletion flow doesn't apply —
    // the review-hold page's own live countdown already makes the situation
    // clear.
    navigate('/policy-required', {
      replace: true,
      state: isEstablishedAccount ? undefined : { justRevoked: true },
    })
  }

  return (
    <>
      <div className="flex items-center gap-2 text-sm text-foreground">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
          <Check size={14} />
        </span>
        {t('policy.profileAccepted')}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('policy.version', { version: policyVersion.version })}
        {acceptance.acceptedAt &&
          ` · ${t('policy.acceptedOn', { date: formatDate(acceptance.acceptedAt, language) })}`}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => setShowPolicyText(true)}>
          {t('policy.viewPolicy')}
        </Button>
        <Button type="button" variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
          {t('policy.revokeAcceptance')}
        </Button>
      </div>

      <Dialog open={showPolicyText} onOpenChange={setShowPolicyText} title={policyVersion.title}>
        <p className="whitespace-pre-wrap text-sm text-foreground">{policyVersion.content}</p>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={
          isEstablishedAccount ? t('policy.revokeReviewConfirmTitle') : t('policy.revokeConfirmTitle')
        }
        description={
          isEstablishedAccount
            ? t('policy.revokeReviewConfirmDescription', { days: reviewHoldDays })
            : t('policy.revokeConfirmDescription', { date: formatDateTime(projectedDeletionDate, language) })
        }
        confirmLabel={t('policy.revokeConfirmButton')}
        isLoading={revokePolicy.isPending}
        onConfirm={handleConfirmRevoke}
      />
    </>
  )
}
