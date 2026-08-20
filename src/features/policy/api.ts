import { api } from '@/shared/api/axiosClient'
import type {
  AdminPolicyStatus,
  CurrentPolicyResponse,
  ReactivationRequestEntry,
  UserPolicyAcceptance,
} from '@/shared/types/api.types'

interface PolicyDecisionResponse {
  policyVersion: { id: string; version: string; title: string; content: string }
  acceptance: UserPolicyAcceptance
}

export const policyApi = {
  getCurrent: () => api.get<CurrentPolicyResponse>('/policy/me').then((r) => r.data),
  accept: () => api.post<PolicyDecisionResponse>('/policy/accept').then((r) => r.data),
  reject: () => api.post<PolicyDecisionResponse>('/policy/reject').then((r) => r.data),
  revoke: () => api.post<PolicyDecisionResponse>('/policy/revoke').then((r) => r.data),
  dismiss: () => api.post('/policy/dismiss').then((r) => r.data),

  // Consolidated-account review-hold management — requires MANAGE_POLICY_REACTIVATION.
  listReactivationRequests: () =>
    api.get<ReactivationRequestEntry[]>('/policy/reactivation-requests').then((r) => r.data),
  getReviewStatus: (userId: string) =>
    api.get<AdminPolicyStatus>(`/policy/users/${userId}/review-status`).then((r) => r.data),
  approveReactivation: (userId: string) =>
    api.post<UserPolicyAcceptance>(`/policy/users/${userId}/reactivation/approve`).then((r) => r.data),
  denyReactivation: (userId: string) =>
    api.post<UserPolicyAcceptance>(`/policy/users/${userId}/reactivation/deny`).then((r) => r.data),
}
