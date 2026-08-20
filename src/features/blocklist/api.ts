import { api } from '@/shared/api/axiosClient'
import type { EmailBlocklistEntry, PaginatedResult } from '@/shared/types/api.types'

export interface ListBlocklistParams {
  page?: number
  limit?: number
  includeRemoved?: boolean
}

export const blocklistApi = {
  list: (params?: ListBlocklistParams) =>
    api
      .get<PaginatedResult<EmailBlocklistEntry>>('/email-blocklist', { params })
      .then((r) => r.data),
  remove: (id: string) => api.delete(`/email-blocklist/${id}`),
}
