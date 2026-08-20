import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { templateLibraryApi, type ListTemplatesParams, type UpdateTemplatePayload } from './api'

const templatesKey = (params: ListTemplatesParams) => ['template-library', params]

export function useTemplates(params: ListTemplatesParams) {
  return useQuery({
    queryKey: templatesKey(params),
    queryFn: () => templateLibraryApi.list(params),
    placeholderData: (previous) => previous,
  })
}

export function useUploadTemplate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({
      file,
      name,
      description,
      onProgress,
    }: {
      file: File
      name: string
      description?: string
      onProgress?: (percent: number) => void
    }) => templateLibraryApi.upload(file, name, description, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-library'] })
      toast.success(t('templateLibrary.toastUploaded'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('templateLibrary.toastUploadError'))),
  })
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTemplatePayload }) =>
      templateLibraryApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-library'] })
      toast.success(t('templateLibrary.toastUpdated'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('templateLibrary.toastUpdateError'))),
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => templateLibraryApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-library'] })
      toast.success(t('templateLibrary.toastDeleted'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('templateLibrary.toastDeleteError'))),
  })
}

export function useDownloadTemplate() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => templateLibraryApi.getDownloadUrl(id),
    onSuccess: (downloadUrl) => {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer')
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('templateLibrary.toastDownloadError'))),
  })
}
