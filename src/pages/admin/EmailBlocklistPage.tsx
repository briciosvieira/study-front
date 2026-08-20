import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/shared/components/Badge'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import { ListSkeleton, Skeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { formatDateTime } from '@/shared/utils/formatDate'
import { useBlocklist, useRemoveFromBlocklist } from '@/features/blocklist/useBlocklist'
import type { EmailBlocklistEntry } from '@/shared/types/api.types'

const PAGE_SIZE = 20

export function EmailBlocklistPage() {
  const { t, language } = useTranslation()
  const [page, setPage] = useState(1)
  const [includeRemoved, setIncludeRemoved] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<EmailBlocklistEntry | null>(null)

  const { data, isLoading } = useBlocklist({ page, limit: PAGE_SIZE, includeRemoved })
  const removeEntry = useRemoveFromBlocklist()

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  return (
    <div>
      <PageHeader
        title={t('blocklist.title')}
        description={t('blocklist.subtitle')}
        actions={
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={includeRemoved}
              onCheckedChange={(checked) => {
                setIncludeRemoved(checked === true)
                setPage(1)
              }}
            />
            {t('blocklist.includeRemoved')}
          </label>
        }
      />

      {isLoading && (
        <>
          <div className="sm:hidden">
            <ListSkeleton />
          </div>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card sm:block">
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </>
      )}

      {!isLoading && !data?.items.length && (
        <div className="rounded-xl border border-border bg-card p-6">
          <EmptyState title={t('blocklist.emptyTitle')} />
        </div>
      )}

      {!isLoading && !!data?.items.length && (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-surface-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">{t('blocklist.columnEmail')}</th>
                    <th className="px-4 py-2.5 font-medium">{t('blocklist.columnReason')}</th>
                    <th className="hidden px-4 py-2.5 font-medium md:table-cell">
                      {t('blocklist.columnCreatedAt')}
                    </th>
                    <th className="px-4 py-2.5 font-medium">{t('blocklist.columnStatus')}</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((entry) => (
                    <tr key={entry.id} className="hover:bg-accent/40">
                      <td className="px-4 py-2.5 font-mono text-xs text-card-foreground">
                        {entry.maskedEmail ?? '—'}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{entry.reason}</td>
                      <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">
                        {formatDateTime(entry.createdAt, language)}
                      </td>
                      <td className="px-4 py-2.5">
                        {entry.removedAt ? (
                          <Badge variant="muted">{t('blocklist.statusRemoved')}</Badge>
                        ) : (
                          <Badge variant="danger">{t('blocklist.statusActive')}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end">
                          {!entry.removedAt && (
                            <button
                              type="button"
                              onClick={() => setRemoveTarget(entry)}
                              aria-label={t('blocklist.remove')}
                              title={t('blocklist.remove')}
                              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-danger"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft size={14} />
                {t('common.previous')}
              </Button>
              <span>{t('common.pageOf', { page, total: totalPages })}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                {t('common.next')}
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title={t('blocklist.removeConfirmTitle')}
        description={t('blocklist.removeConfirmDescription', { email: removeTarget?.maskedEmail ?? '' })}
        confirmLabel={t('blocklist.remove')}
        isLoading={removeEntry.isPending}
        onConfirm={() =>
          removeTarget && removeEntry.mutate(removeTarget.id, { onSuccess: () => setRemoveTarget(null) })
        }
      />
    </div>
  )
}
