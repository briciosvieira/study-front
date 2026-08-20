import type { ReactNode } from 'react'
import { Badge } from '@/shared/components/Badge'
import { PageSpinner } from '@/shared/components/Spinner'
import { Dialog } from '@/shared/components/ui/dialog'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { formatDateTime } from '@/shared/utils/formatDate'
import { useAuditEvent } from './useAudit'
import { SEVERITY_BADGE_VARIANT } from './severity'

export function AuditEventDetailDialog({
  eventId,
  onOpenChange,
}: {
  eventId: string | null
  onOpenChange: (open: boolean) => void
}) {
  const { t, language } = useTranslation()
  const { data: event, isLoading } = useAuditEvent(eventId)

  return (
    <Dialog open={!!eventId} onOpenChange={onOpenChange} title={t('audit.detailsTitle')}>
      {isLoading || !event ? (
        <PageSpinner />
      ) : (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Row label={t('audit.columnEvent')} value={event.eventType} />
          <Row label={t('audit.columnDate')} value={formatDateTime(event.createdAt, language)} />
          <Row
            label={t('audit.columnSeverity')}
            value={<Badge variant={SEVERITY_BADGE_VARIANT[event.severity]}>{event.severity}</Badge>}
          />
          <Row label={t('audit.columnCategory')} value={event.category} />
          <Row label={t('audit.actor')} value={event.actorName ?? '—'} />
          <Row
            label={t('audit.target')}
            value={event.targetName ?? event.targetEmailMasked ?? '—'}
          />
          <Row
            label={t('audit.resource')}
            value={event.resourceType ? `${event.resourceType} (${event.resourceId ?? '—'})` : '—'}
          />
          <Row label={t('audit.columnMethod')} value={event.method ?? '—'} />
          <Row label={t('audit.columnRoute')} value={event.route ?? '—'} />
          <Row label={t('audit.columnStatus')} value={event.httpStatus?.toString() ?? '—'} />
          <Row label={t('audit.ipAddress')} value={event.ipAddress ?? '—'} />
          <Row label={t('audit.userAgent')} value={event.userAgent ?? '—'} />
          <Row label={t('audit.requestId')} value={event.requestId ?? '—'} />

          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className="col-span-full">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('audit.metadata')}
              </dt>
              <dd className="mt-1 overflow-x-auto rounded-lg border border-border bg-surface p-3 font-mono text-xs text-foreground">
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(event.metadata, null, 2)}
                </pre>
              </dd>
            </div>
          )}
        </dl>
      )}
    </Dialog>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-card-foreground">{value}</dd>
    </div>
  )
}
