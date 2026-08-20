import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { homeRouteForRole, useAuth } from '@/features/auth/useAuth'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { Role } from '@/shared/types/api.types'
import { auditApi, type QueryAuditEventsParams, type QueryIncidentsParams } from './api'

// The audit page is registered under every role's own subtree (so it keeps
// that role's sidebar/layout) — this resolves which copy a given user's link
// should point to.
export function auditPathForRole(role: Role): string {
  return `${homeRouteForRole(role)}/audit`
}

// The backend enforces VIEW_AUDIT_LOGS/EXPORT_AUDIT_LOGS on every route
// regardless of these checks — they only exist so the UI doesn't fire
// requests a viewer can never be authorized for.
export function useCanViewAudit() {
  const { user } = useAuth()
  return !!user && (user.role === 'ADMIN' || user.permissions.includes('VIEW_AUDIT_LOGS'))
}

export function useCanExportAudit() {
  const { user } = useAuth()
  return !!user && (user.role === 'ADMIN' || user.permissions.includes('EXPORT_AUDIT_LOGS'))
}

// Broader than useCanViewAudit: AuditNotification is shared infrastructure
// for two audiences — security incidents (VIEW_AUDIT_LOGS) and policy
// reactivation requests (MANAGE_POLICY_REACTIVATION). This gates the bell
// itself and the notification list/mark-read endpoints, not the full audit
// event/incident tables, which stay VIEW_AUDIT_LOGS-only.
export function useCanViewNotifications() {
  const { user } = useAuth()
  return (
    !!user &&
    (user.role === 'ADMIN' ||
      user.permissions.includes('VIEW_AUDIT_LOGS') ||
      user.permissions.includes('MANAGE_POLICY_REACTIVATION'))
  )
}

export function useAuditEvents(params: QueryAuditEventsParams) {
  const canView = useCanViewAudit()
  return useQuery({
    queryKey: ['audit', 'events', params],
    queryFn: () => auditApi.listEvents(params),
    enabled: canView,
  })
}

export function useAuditEvent(id: string | null) {
  const canView = useCanViewAudit()
  return useQuery({
    queryKey: ['audit', 'events', 'detail', id],
    queryFn: () => auditApi.getEvent(id!),
    enabled: canView && !!id,
  })
}

export function useSecurityIncidents(params: QueryIncidentsParams) {
  const canView = useCanViewAudit()
  return useQuery({
    queryKey: ['audit', 'incidents', params],
    queryFn: () => auditApi.listIncidents(params),
    enabled: canView,
  })
}

export function useExportAuditPdf() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (params: QueryAuditEventsParams) => auditApi.exportPdf(params),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `studyja-auditoria-${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('audit.toastExportError'))),
  })
}
