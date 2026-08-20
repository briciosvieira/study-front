import { useApproveReactivation, useDenyReactivation } from '@/features/policy/usePolicy'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { PolicyAcceptanceStatus } from '@/shared/types/api.types'
import { formatDateTime } from '@/shared/utils/formatDate'
import { useUserPolicyStatus } from './useUserCourses'

const STATUS_BADGE_VARIANT: Record<PolicyAcceptanceStatus, 'success' | 'muted' | 'danger'> = {
  ACCEPTED: 'success',
  PENDING: 'muted',
  REJECTED: 'danger',
}

// View-only for the ordinary PENDING/ACCEPTED/REJECTED case, per section 30
// of the original policy spec: an admin can see another user's decision but
// never accept/reject on their behalf. The one exception is the
// review-hold approve/deny action below, which is a distinct, explicitly
// admin-owned decision (see section 10 of the review-hold complement) — not
// "accepting on the user's behalf".
export function UserPolicyStatusCard({ userId }: { userId: string }) {
  const { t, language } = useTranslation()
  const { data, isLoading } = useUserPolicyStatus(userId)
  const approveReactivation = useApproveReactivation()
  const denyReactivation = useDenyReactivation()

  if (isLoading) return null

  const acceptance = data?.acceptance
  const underReview = !!acceptance?.policyReviewUntil
  const reviewExpired = underReview && new Date(acceptance!.policyReviewUntil!).getTime() <= Date.now()
  const hasPendingRequest = underReview && !!acceptance?.reactivationRequestedAt

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">{t('policy.adminStatusTitle')}</h3>

      {!acceptance ? (
        <p className="mt-2 text-sm text-muted-foreground">{t('policy.adminStatusNone')}</p>
      ) : (
        <>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">{t('policy.adminStatusStatus')}</dt>
              <dd>
                {underReview ? (
                  <Badge variant={hasPendingRequest ? 'primary' : reviewExpired ? 'danger' : 'warning'}>
                    {t(
                      hasPendingRequest
                        ? 'policy.statusREACTIVATION_REQUESTED'
                        : reviewExpired
                          ? 'policy.statusPENDING_ADMIN_DECISION'
                          : 'policy.statusPOLICY_REVIEW_HOLD',
                    )}
                  </Badge>
                ) : (
                  <Badge variant={STATUS_BADGE_VARIANT[acceptance.status]}>
                    {t(`policy.status${acceptance.status}`)}
                  </Badge>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">{t('policy.adminStatusVersion')}</dt>
              <dd className="text-card-foreground">{acceptance.policyVersion.version}</dd>
            </div>

            {!underReview && acceptance.status === 'ACCEPTED' && acceptance.acceptedAt && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">{t('policy.adminAcceptedAt')}</dt>
                <dd className="text-card-foreground">{formatDateTime(acceptance.acceptedAt, language)}</dd>
              </div>
            )}
            {!underReview && acceptance.status === 'REJECTED' && acceptance.rejectedAt && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">{t('policy.adminRejectedAt')}</dt>
                <dd className="text-card-foreground">{formatDateTime(acceptance.rejectedAt, language)}</dd>
              </div>
            )}
            {!underReview && acceptance.status === 'REJECTED' && acceptance.deletionPausedAt && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">{t('policy.adminScheduledDeletion')}</dt>
                <dd className="font-medium text-warning">{t('policy.adminDeletionPaused')}</dd>
              </div>
            )}
            {!underReview &&
              acceptance.status === 'REJECTED' &&
              !acceptance.deletionPausedAt &&
              acceptance.scheduledDeletionAt && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">{t('policy.adminScheduledDeletion')}</dt>
                  <dd className="font-medium text-danger">
                    {formatDateTime(acceptance.scheduledDeletionAt, language)}
                  </dd>
                </div>
              )}

            {underReview && (
              <>
                {acceptance.policyReviewStartedAt && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">{t('policy.adminReviewStarted')}</dt>
                    <dd className="text-card-foreground">
                      {formatDateTime(acceptance.policyReviewStartedAt, language)}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">{t('policy.adminReviewUntil')}</dt>
                  <dd className={`font-medium ${reviewExpired ? 'text-danger' : 'text-warning'}`}>
                    {formatDateTime(acceptance.policyReviewUntil!, language)}
                  </dd>
                </div>
                {hasPendingRequest && acceptance.reactivationRequestedAt && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">{t('policy.adminReactivationRequestedAt')}</dt>
                    <dd className="text-card-foreground">
                      {formatDateTime(acceptance.reactivationRequestedAt, language)}
                    </dd>
                  </div>
                )}
              </>
            )}
          </dl>

          {underReview && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              <Button
                type="button"
                size="sm"
                disabled={approveReactivation.isPending}
                onClick={() => approveReactivation.mutate(userId)}
              >
                {t('policy.adminApproveReactivation')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={denyReactivation.isPending}
                onClick={() => denyReactivation.mutate(userId)}
              >
                {t('policy.adminDenyReactivation')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
