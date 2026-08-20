import { api } from '@/shared/api/axiosClient'
import type { AuditEvent, AuditNotification, PaginatedResult, SecurityIncident } from '@/shared/types/api.types'

export interface QueryAuditEventsParams {
  page?: number
  limit?: number
  category?: string
  severity?: string
  eventType?: string
  actorUserId?: string
  targetUserId?: string
  method?: string
  httpStatus?: number
  ipAddress?: string
  requestId?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

export interface QueryIncidentsParams {
  page?: number
  limit?: number
  severity?: string
}

export const auditApi = {
  listEvents: (params: QueryAuditEventsParams) =>
    api.get<PaginatedResult<AuditEvent>>('/audit/events', { params }).then((r) => r.data),
  getEvent: (id: string) => api.get<AuditEvent>(`/audit/events/${id}`).then((r) => r.data),
  listIncidents: (params: QueryIncidentsParams) =>
    api.get<PaginatedResult<SecurityIncident>>('/audit/incidents', { params }).then((r) => r.data),
  listNotifications: () => api.get<AuditNotification[]>('/audit/notifications').then((r) => r.data),
  markAllRead: () => api.post('/audit/notifications/read-all'),
  markRead: (incidentId: string) => api.post(`/audit/notifications/${incidentId}/read`),
  dismissPopup: (incidentId: string) => api.post(`/audit/notifications/${incidentId}/dismiss-popup`),
  exportPdf: (params: QueryAuditEventsParams) =>
    api.get('/audit/export', { params, responseType: 'blob' }).then((r) => r.data as Blob),
}
