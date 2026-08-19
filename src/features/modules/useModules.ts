import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { modulesApi, type CreateModulePayload, type UpdateModulePayload } from './api'

const modulesKey = (courseId: string) => ['modules', courseId]

export function useModules(courseId: string) {
  return useQuery({
    queryKey: modulesKey(courseId),
    queryFn: () => modulesApi.listForCourse(courseId),
    enabled: !!courseId,
  })
}

export function useCreateModule(courseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (payload: CreateModulePayload) => modulesApi.create(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modulesKey(courseId) })
      toast.success(t('modules.toastCreated'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('modules.toastCreateError'))),
  })
}

export function useUpdateModule(courseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateModulePayload }) =>
      modulesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modulesKey(courseId) })
      toast.success(t('modules.toastUpdated'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('modules.toastUpdateError'))),
  })
}

export function useDeleteModule(courseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => modulesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modulesKey(courseId) })
      toast.success(t('modules.toastDeleted'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('modules.toastDeleteError'))),
  })
}

export function useSetModuleVisibility(courseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      modulesApi.setVisibility(id, visible),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: modulesKey(courseId) }),
    onError: (error) => toast.error(apiErrorMessage(error, t('modules.toastVisibilityError'))),
  })
}
