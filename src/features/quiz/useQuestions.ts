import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import {
  questionsApi,
  quizExportApi,
  type CreateQuestionPayload,
  type UpdateQuestionPayload,
} from './api'

// Mirrors the backend's own filename sanitization (quiz-export.service.ts) —
// purely cosmetic (the download-link filename), unrelated to the Excel
// column contract itself, so a small client-side duplicate is fine here.
function sanitizeFilenamePart(title: string): string {
  const decomposed = title.normalize('NFD')
  const withoutAccents = Array.from(decomposed)
    .filter((char) => {
      const codePoint = char.codePointAt(0) ?? 0
      return codePoint < 0x300 || codePoint > 0x36f
    })
    .join('')
  const safe = withoutAccents.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  return safe || 'quiz'
}

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

export function useDownloadQuizExcel() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ moduleId }: { moduleId: string; moduleTitle: string }) =>
      quizExportApi.download(moduleId),
    onSuccess: (blob, variables) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `quiz_${sanitizeFilenamePart(variables.moduleTitle)}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('questions.toastDownloadError'))),
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
