import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import {
  usersApi,
  type CreateUserPayload,
  type StudentsOverviewParams,
  type UpdateUserPayload,
} from './api'

const USERS_KEY = ['users']

export function useUsers() {
  return useQuery({ queryKey: USERS_KEY, queryFn: usersApi.list })
}

export function useStudentsOverview(params: StudentsOverviewParams) {
  return useQuery({
    queryKey: ['users', 'students', params],
    queryFn: () => usersApi.getStudentsOverview(params),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.success(t('users.toastCreated'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('users.toastCreateError'))),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.success(t('users.toastUpdated'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('users.toastUpdateError'))),
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, currentPassword }: { id: string; currentPassword?: string }) =>
      usersApi.remove(id, currentPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.success(t('users.toastDeleted'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('users.toastDeleteError'))),
  })
}

export function useActivateUser() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => usersApi.update(id, { active: true }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      queryClient.invalidateQueries({ queryKey: ['users', id] })
      toast.success(t('users.toastActivated'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('users.toastActivateError'))),
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => usersApi.update(id, { active: false }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      queryClient.invalidateQueries({ queryKey: ['users', id] })
      toast.success(t('users.toastDeactivated'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('users.toastDeactivateError'))),
  })
}

export function useResetUserPassword() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      usersApi.resetPassword(id, newPassword),
    onSuccess: () => toast.success(t('users.toastPasswordReset')),
    onError: (error) => toast.error(apiErrorMessage(error, t('users.toastPasswordResetError'))),
  })
}
