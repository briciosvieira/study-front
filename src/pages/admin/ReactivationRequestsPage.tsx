import { useApproveReactivation, useDenyReactivation, useReactivationRequests } from '@/features/policy/usePolicy'
import { Badge } from '@/shared/components/Badge'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import { ListSkeleton, Skeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { formatDateTime } from '@/shared/utils/formatDate'
import type { ReactivationRequestEntry } from '@/shared/types/api.types'

function rowStatus(entry: ReactivationRequestEntry) {
  if (entry.reactivationRequestedAt) return 'REACTIVATION_REQUESTED' as const
  if (entry.policyReviewUntil && new Date(entry.policyReviewUntil).getTime() <= Date.now()) {
    return 'PENDING_ADMIN_DECISION' as const
  }
  return 'POLICY_REVIEW_HOLD' as const
}

const STATUS_BADGE_VARIANT = {
  REACTIVATION_REQUESTED: 'primary',
  PENDING_ADMIN_DECISION: 'danger',
  POLICY_REVIEW_HOLD: 'warning',
} as const

// The queue an ADMIN (or a delegated MANAGE_POLICY_REACTIVATION holder)
// reviews — one screen for every account currently under a consolidated
// review hold, regardless of which sub-state it's in. Approve/deny here call
// the same endpoints as the per-user card on the admin user-detail page.
export function ReactivationRequestsPage() {
  const { t, language } = useTranslation()
  const { data, isLoading } = useReactivationRequests()
  const approveReactivation = useApproveReactivation()
  const denyReactivation = useDenyReactivation()

  return (
    <div>
      <PageHeader title={t('policy.reactivationQueueTitle')} description={t('policy.reactivationQueueSubtitle')} />

      {isLoading && (
        <>
          <div className="sm:hidden">
            <ListSkeleton />
          </div>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card sm:block">
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </>
      )}

      {!isLoading && !data?.length && (
        <div className="rounded-xl border border-border bg-card p-6">
          <EmptyState title={t('policy.reactivationQueueEmpty')} />
        </div>
      )}

      {!isLoading && !!data?.length && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">{t('policy.columnUser')}</th>
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">{t('audit.columnStatus')}</th>
                  <th className="hidden px-4 py-2.5 font-medium lg:table-cell">{t('policy.adminReviewUntil')}</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((entry) => {
                  const status = rowStatus(entry)
                  return (
                    <tr key={entry.id} className="hover:bg-accent/40">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-card-foreground">{entry.user.name}</p>
                        <p className="text-xs text-muted-foreground">{entry.user.email}</p>
                      </td>
                      <td className="hidden px-4 py-2.5 md:table-cell">
                        <Badge variant={STATUS_BADGE_VARIANT[status]}>{t(`policy.status${status}`)}</Badge>
                      </td>
                      <td className="hidden px-4 py-2.5 text-muted-foreground lg:table-cell">
                        {entry.policyReviewUntil ? formatDateTime(entry.policyReviewUntil, language) : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={approveReactivation.isPending}
                            onClick={() => approveReactivation.mutate(entry.user.id)}
                          >
                            {t('policy.adminApproveReactivation')}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={denyReactivation.isPending}
                            onClick={() => denyReactivation.mutate(entry.user.id)}
                          >
                            {t('policy.adminDenyReactivation')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
