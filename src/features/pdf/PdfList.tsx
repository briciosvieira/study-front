import { FileText, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/shared/components/EmptyState'
import { OrderBadge } from '@/shared/components/OrderBadge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { PdfItem } from '@/shared/types/api.types'
import { useDeletePdf, useReorderPdf } from './usePdfItems'

export function PdfList({
  moduleId,
  items,
  canDelete,
  readOnly,
}: {
  moduleId: string
  items: PdfItem[]
  canDelete?: boolean
  readOnly?: boolean
}) {
  const { t } = useTranslation()
  const deletePdf = useDeletePdf(moduleId)
  const reorderPdf = useReorderPdf(moduleId)

  if (!items.length) {
    return <EmptyState title={t('pdf.empty')} icon={FileText} />
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30"
        >
          <Link to={`/modules/${moduleId}/pdf/${item.id}`} className="flex items-center gap-3">
            <OrderBadge label={item.orderLabel} />
            <p className="text-sm font-medium text-card-foreground hover:text-primary">{item.title}</p>
          </Link>

          {!readOnly && (
            <div className="flex items-center gap-2">
              <Input
                defaultValue={item.orderLabel}
                className="h-8 w-16 text-center text-xs"
                onBlur={(e) => {
                  if (e.target.value && e.target.value !== item.orderLabel) {
                    reorderPdf.mutate({ id: item.id, orderLabel: e.target.value })
                  }
                }}
              />
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deletePdf.mutate(item.id)}
                  aria-label={t('common.delete')}
                >
                  <Trash2 size={16} className="text-danger" />
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
