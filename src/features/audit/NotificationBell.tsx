import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { homeRouteForRole, useAuth } from '@/features/auth/useAuth'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/utils/cn'
import { formatDateTime } from '@/shared/utils/formatDate'
import type { AuditNotification, Role } from '@/shared/types/api.types'
import {
  useAuditNotifications,
  useDismissAuditPopup,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from './useAuditNotifications'
import { auditPathForRole, useCanViewNotifications } from './useAudit'

function isUrgent(n: AuditNotification) {
  return n.incident.severity === 'HIGH' || n.incident.severity === 'CRITICAL'
}

// A reactivation-request notification is only actionable on the
// reactivation queue — a viewer with MANAGE_POLICY_REACTIVATION but not
// VIEW_AUDIT_LOGS can't even reach the audit page, so this must not send
// them there.
function targetPathFor(n: AuditNotification, role: Role): string {
  if (n.incident.type === 'POLICY_REACTIVATION_REQUESTED') {
    return `${homeRouteForRole(role)}/reactivation-requests`
  }
  return auditPathForRole(role)
}

// Renders nothing for a viewer without notification access — see
// useCanViewNotifications. Read/unread and popup-dismissed state are both
// per-viewer, per the spec: closing the corner toast (dismissPopup) never
// marks the notification read, and marking read never deletes the
// underlying incident.
export function NotificationBell() {
  const { t, language } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const canView = useCanViewNotifications()
  const [open, setOpen] = useState(false)
  const { data: notifications } = useAuditNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const dismissPopup = useDismissAuditPopup()
  const shownPopups = useRef(new Set<string>())

  const unread = notifications?.filter((n) => !n.readAt) ?? []
  const hasUnreadUrgent = unread.some(isUrgent)

  useEffect(() => {
    if (!notifications || !user) return
    notifications
      .filter((n) => !n.popupDismissedAt && isUrgent(n))
      .forEach((n) => {
        if (shownPopups.current.has(n.incidentId)) return
        shownPopups.current.add(n.incidentId)
        toast.warning(n.incident.type, {
          id: `audit-incident-${n.incidentId}`,
          description: t('audit.notificationToastDescription', { count: n.incident.occurrenceCount }),
          action: {
            label: t('audit.viewDetails'),
            onClick: () => navigate(targetPathFor(n, user.role)),
          },
          onDismiss: () => dismissPopup.mutate(n.incidentId),
          onAutoClose: () => dismissPopup.mutate(n.incidentId),
        })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, user])

  if (!canView) return null

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('audit.notifications')}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-accent"
        >
          <Bell size={18} className={hasUnreadUrgent ? 'text-danger motion-safe:animate-pulse' : ''} />
          {unread.length > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-danger-foreground">
              {unread.length > 9 ? '9+' : unread.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <div className="flex items-center justify-between px-2.5 py-1.5">
          <span className="text-sm font-semibold text-foreground">{t('audit.notifications')}</span>
          {unread.length > 0 && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="text-xs font-medium text-primary hover:underline"
            >
              {t('audit.markAllRead')}
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {!notifications?.length && (
            <p className="px-2.5 py-4 text-center text-sm text-muted-foreground">
              {t('audit.noNotifications')}
            </p>
          )}
          {notifications?.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={cn('flex-col items-start gap-0.5', !n.readAt && 'bg-accent/40')}
              onSelect={() => {
                if (!n.readAt) markRead.mutate(n.incidentId)
                if (user) navigate(targetPathFor(n, user.role))
              }}
            >
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                {!n.readAt && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                {n.incident.type}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(n.incident.lastOccurredAt, language)} ·{' '}
                {t('audit.occurrences', { count: n.incident.occurrenceCount })}
              </span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
