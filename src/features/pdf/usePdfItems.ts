import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { pdfApi } from './api'

const pdfKey = (moduleId: string) => ['pdf', moduleId]

export function usePdfItems(moduleId: string) {
  return useQuery({
    queryKey: pdfKey(moduleId),
    queryFn: () => pdfApi.listForModule(moduleId),
    enabled: !!moduleId,
  })
}

export function useUploadPdf(moduleId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({
      file,
      title,
      orderLabel,
      onProgress,
    }: {
      file: File
      title: string
      orderLabel: string
      onProgress?: (percent: number) => void
    }) => pdfApi.upload(moduleId, file, title, orderLabel, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdfKey(moduleId) })
      toast.success(t('pdf.toastUploaded'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('pdf.toastUploadError'))),
  })
}

export function useDeletePdf(moduleId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => pdfApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdfKey(moduleId) })
      toast.success(t('pdf.toastDeleted'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('pdf.toastDeleteError'))),
  })
}

export function useReorderPdf(moduleId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, orderLabel }: { id: string; orderLabel: string }) =>
      pdfApi.reorder(id, orderLabel),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pdfKey(moduleId) }),
    onError: (error) => toast.error(apiErrorMessage(error, t('pdf.toastReorderError'))),
  })
}
