import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authApi } from '@/features/auth/api'
import { useAuthStore } from '@/features/auth/authStore'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { policyApi } from './api'

const POLICY_KEY = ['policy', 'me']

export function useCurrentPolicy() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: POLICY_KEY,
    queryFn: () => policyApi.getCurrent(),
    enabled: !!user,
  })
}

// Every decision mutation refetches /auth/me afterward and writes the fresh
// user (with its recomputed accessState) into the auth store — this is what
// makes RequireAuth immediately route to the right screen next render,
// without a manual reload and without the frontend trying to compute
// accessState itself.
function useRefreshUserAfterPolicyChange() {
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()
  return async () => {
    const user = await authApi.me()
    setUser(user)
    await queryClient.invalidateQueries({ queryKey: POLICY_KEY })
  }
}

export function useAcceptPolicy() {
  const refresh = useRefreshUserAfterPolicyChange()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: () => policyApi.accept(),
    onSuccess: async () => {
      await refresh()
      toast.success(t('policy.toastAccepted'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('policy.toastAcceptError'))),
  })
}

export function useRejectPolicy() {
  const refresh = useRefreshUserAfterPolicyChange()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: () => policyApi.reject(),
    onSuccess: async () => {
      await refresh()
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('policy.toastRejectError'))),
  })
}

export function useRevokePolicy() {
  const refresh = useRefreshUserAfterPolicyChange()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: () => policyApi.revoke(),
    onSuccess: async () => {
      await refresh()
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('policy.toastRevokeError'))),
  })
}

export function useDismissPolicyModal() {
  return useMutation({
    mutationFn: () => policyApi.dismiss(),
  })
}

const REACTIVATION_REQUESTS_KEY = ['policy', 'reactivation-requests']
const REVIEW_STATUS_KEY = (userId: string) => ['policy', 'review-status', userId]

// Admin-facing (or MANAGE_POLICY_REACTIVATION-delegated) queue of accounts
// currently under a consolidated review hold.
export function useReactivationRequests() {
  return useQuery({
    queryKey: REACTIVATION_REQUESTS_KEY,
    queryFn: () => policyApi.listReactivationRequests(),
  })
}

export function useReviewStatus(userId: string) {
  return useQuery({
    queryKey: REVIEW_STATUS_KEY(userId),
    queryFn: () => policyApi.getReviewStatus(userId),
    enabled: !!userId,
  })
}

export function useApproveReactivation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (userId: string) => policyApi.approveReactivation(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: REACTIVATION_REQUESTS_KEY })
      queryClient.invalidateQueries({ queryKey: REVIEW_STATUS_KEY(userId) })
      toast.success(t('policy.toastReactivationApproved'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('policy.toastReactivationError'))),
  })
}

export function useDenyReactivation() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (userId: string) => policyApi.denyReactivation(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: REACTIVATION_REQUESTS_KEY })
      queryClient.invalidateQueries({ queryKey: REVIEW_STATUS_KEY(userId) })
      toast.success(t('policy.toastReactivationDenied'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('policy.toastReactivationError'))),
  })
}
