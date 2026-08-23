import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { videoApi } from './api'

const videoKey = (moduleId: string) => ['video', moduleId]

export function useVideoItems(moduleId: string) {
  return useQuery({
    queryKey: videoKey(moduleId),
    queryFn: () => videoApi.listForModule(moduleId),
    enabled: !!moduleId,
  })
}

export function useUploadVideo(moduleId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({
      file,
      title,
      onProgress,
    }: {
      file: File
      title: string
      onProgress?: (percent: number) => void
    }) => videoApi.upload(moduleId, file, title, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKey(moduleId) })
      toast.success(t('video.toastUploaded'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('video.toastUploadError'))),
  })
}

export function useDeleteVideo(moduleId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => videoApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKey(moduleId) })
      toast.success(t('video.toastDeleted'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('video.toastDeleteError'))),
  })
}

export function useReorderVideo(moduleId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, orderLabel }: { id: string; orderLabel: string }) =>
      videoApi.reorder(id, orderLabel),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: videoKey(moduleId) }),
    onError: (error) => toast.error(apiErrorMessage(error, t('video.toastReorderError'))),
  })
}

export function useUpdateVideo(moduleId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({
      id,
      title,
      description,
      file,
      onProgress,
    }: {
      id: string
      title?: string
      description?: string
      file?: File
      onProgress?: (percent: number) => void
    }) => videoApi.update(id, { title, description, file, onProgress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKey(moduleId) })
      toast.success(t('video.toastUpdated'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('video.toastUpdateError'))),
  })
}

export function useDownloadVideo() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => videoApi.getDownloadUrl(id),
    onSuccess: (downloadUrl) => {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer')
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('video.toastDownloadError'))),
  })
}
