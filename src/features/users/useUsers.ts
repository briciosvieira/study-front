import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { usersApi, type CreateUserPayload, type UpdateUserPayload } from './api'

const USERS_KEY = ['users']

export function useUsers() {
  return useQuery({ queryKey: USERS_KEY, queryFn: usersApi.list })
}

export function useStudents() {
  return useQuery({ queryKey: ['users', 'students'], queryFn: usersApi.listStudents })
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
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      toast.success(t('users.toastDeleted'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('users.toastDeleteError'))),
  })
}
