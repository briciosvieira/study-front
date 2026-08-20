import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react'
import { useState } from 'react'
import { AuditEventDetailDialog } from '@/features/audit/AuditEventDetailDialog'
import { SEVERITY_BADGE_VARIANT } from '@/features/audit/severity'
import { useAuditEvents, useCanExportAudit, useExportAuditPdf, useSecurityIncidents } from '@/features/audit/useAudit'
import { Badge } from '@/shared/components/Badge'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import { ListSkeleton, Skeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Select } from '@/shared/components/ui/select'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { AuditCategory, AuditSeverity } from '@/shared/types/api.types'
import { formatDateTime } from '@/shared/utils/formatDate'

const PAGE_SIZE = 25
const CATEGORIES: AuditCategory[] = [
  'USER',
  'AUTHENTICATION',
  'SECURITY',
  'POLICY',
  'ADMINISTRATION',
  'CONTENT',
  'BLOCKLIST',
  'SYSTEM',
]
const SEVERITIES: AuditSeverity[] = ['INFO', 'WARNING', 'HIGH', 'CRITICAL']

function startOfDayIso(date: string) {
  return `${date}T00:00:00.000Z`
}
function endOfDayIso(date: string) {
  return `${date}T23:59:59.999Z`
}

export function AuditPage() {
  const { t, language } = useTranslation()
  const [tab, setTab] = useState<'events' | 'incidents'>('events')
  const [category, setCategory] = useState('')
  const [severity, setSeverity] = useState('')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [detailEventId, setDetailEventId] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(search)
  const canExport = useCanExportAudit()
  const exportPdf = useExportAuditPdf()

  const eventsParams = {
    page,
    limit: PAGE_SIZE,
    category: category || undefined,
    severity: severity || undefined,
    search: debouncedSearch || undefined,
    dateFrom: dateFrom ? startOfDayIso(dateFrom) : undefined,
    dateTo: dateTo ? endOfDayIso(dateTo) : undefined,
  }

  const { data: eventsData, isLoading: isLoadingEvents } = useAuditEvents(eventsParams)
  const { data: incidentsData, isLoading: isLoadingIncidents } = useSecurityIncidents({
    page,
    limit: PAGE_SIZE,
    severity: severity || undefined,
  })

  const data = tab === 'events' ? eventsData : incidentsData
  const isLoading = tab === 'events' ? isLoadingEvents : isLoadingIncidents
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  function changeFilter(setter: (value: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  return (
    <div>
      <PageHeader
        title={t('audit.title')}
        description={t('audit.subtitle')}
        actions={
          canExport && (
            <Button variant="secondary" onClick={() => exportPdf.mutate(eventsParams)} disabled={exportPdf.isPending}>
              <Download size={16} />
              {t('audit.exportPdf')}
            </Button>
          )
        }
      />

      <div className="mb-4 flex gap-1 border-b border-border">
        <button
          type="button"
          onClick={() => {
            setTab('events')
            setPage(1)
          }}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${tab === 'events' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          {t('audit.tabEvents')}
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('incidents')
            setPage(1)
          }}
          className={`border-b-2 px-3 py-2 text-sm font-medium ${tab === 'incidents' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          {t('audit.tabIncidents')}
        </button>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {tab === 'events' && (
          <Select value={category} onChange={(e) => changeFilter(setCategory, e.target.value)}>
            <option value="">{t('audit.allCategories')}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`audit.category.${c}`)}
              </option>
            ))}
          </Select>
        )}
        <Select value={severity} onChange={(e) => changeFilter(setSeverity, e.target.value)}>
          <option value="">{t('audit.allSeverities')}</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        {tab === 'events' && (
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => changeFilter(setSearch, e.target.value)}
              placeholder={t('audit.searchPlaceholder')}
              className="pl-8"
            />
          </div>
        )}
        {tab === 'events' && (
          <Input type="date" value={dateFrom} onChange={(e) => changeFilter(setDateFrom, e.target.value)} />
        )}
        {tab === 'events' && (
          <Input type="date" value={dateTo} onChange={(e) => changeFilter(setDateTo, e.target.value)} />
        )}
      </div>

      {isLoading && (
        <>
          <div className="sm:hidden">
            <ListSkeleton />
          </div>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card sm:block">
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </>
      )}

      {!isLoading && !data?.items.length && (
        <div className="rounded-xl border border-border bg-card p-6">
          <EmptyState title={t('audit.emptyTitle')} />
        </div>
      )}

      {!isLoading && !!data?.items.length && tab === 'events' && eventsData && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">{t('audit.columnDate')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('audit.columnSeverity')}</th>
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">{t('audit.columnCategory')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('audit.columnEvent')}</th>
                  <th className="hidden px-4 py-2.5 font-medium lg:table-cell">{t('audit.columnUser')}</th>
                  <th className="hidden px-4 py-2.5 font-medium lg:table-cell">{t('audit.columnRoute')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('audit.columnResult')}</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {eventsData.items.map((event) => (
                  <tr key={event.id} className="hover:bg-accent/40">
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                      {formatDateTime(event.createdAt, language)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={SEVERITY_BADGE_VARIANT[event.severity]}>{event.severity}</Badge>
                    </td>
                    <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">{event.category}</td>
                    <td className="px-4 py-2.5 font-medium text-card-foreground">{event.eventType}</td>
                    <td className="hidden px-4 py-2.5 text-muted-foreground lg:table-cell">
                      {event.actorName ?? event.targetName ?? '—'}
                    </td>
                    <td className="hidden px-4 py-2.5 text-muted-foreground lg:table-cell">
                      {event.method && event.route ? `${event.method} ${event.route}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{event.httpStatus ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setDetailEventId(event.id)}>
                          {t('audit.viewDetails')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && !!data?.items.length && tab === 'incidents' && incidentsData && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">{t('audit.columnType')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('audit.columnSeverity')}</th>
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">{t('audit.ipAddress')}</th>
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">{t('audit.columnRoute')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('audit.columnOccurrences')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('audit.columnLastOccurred')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {incidentsData.items.map((incident) => (
                  <tr key={incident.id} className="hover:bg-accent/40">
                    <td className="px-4 py-2.5 font-medium text-card-foreground">{incident.type}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={SEVERITY_BADGE_VARIANT[incident.severity]}>{incident.severity}</Badge>
                    </td>
                    <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">
                      {incident.ipAddress ?? '—'}
                    </td>
                    <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">
                      {incident.route ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{incident.occurrenceCount}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                      {formatDateTime(incident.lastOccurredAt, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
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

      <AuditEventDetailDialog eventId={detailEventId} onOpenChange={(open) => !open && setDetailEventId(null)} />
    </div>
  )
}
