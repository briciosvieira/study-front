import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { questionsApi, type CreateQuestionPayload, type UpdateQuestionPayload } from './api'

const questionsKey = (moduleId: string) => ['questions', moduleId]

export function useQuestions(moduleId: string) {
  return useQuery({
    queryKey: questionsKey(moduleId),
    queryFn: () => questionsApi.listForModule(moduleId),
    enabled: !!moduleId,
  })
}

export function useCreateQuestion(moduleId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (payload: CreateQuestionPayload) => questionsApi.create(moduleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionsKey(moduleId) })
      toast.success(t('questions.toastCreated'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('questions.toastCreateError'))),
  })
}

export function useUpdateQuestion(moduleId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateQuestionPayload }) =>
      questionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionsKey(moduleId) })
      toast.success(t('questions.toastUpdated'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('questions.toastUpdateError'))),
  })
}

export function useDeleteQuestion(moduleId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => questionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionsKey(moduleId) })
      toast.success(t('questions.toastDeleted'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('questions.toastDeleteError'))),
  })
}
