import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { auditApi } from './api'
import { useCanViewNotifications } from './useAudit'

const NOTIFICATIONS_KEY = ['audit', 'notifications']

// No dedicated realtime channel in this app yet — light polling is the
// established fallback for "near real-time" here (see spec section 141).
const POLL_INTERVAL_MS = 45_000

export function useAuditNotifications() {
  const canView = useCanViewNotifications()
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => auditApi.listNotifications(),
    enabled: canView,
    refetchInterval: canView ? POLL_INTERVAL_MS : false,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (incidentId: string) => auditApi.markRead(incidentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => auditApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  })
}

export function useDismissAuditPopup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (incidentId: string) => auditApi.dismissPopup(incidentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  })
}
