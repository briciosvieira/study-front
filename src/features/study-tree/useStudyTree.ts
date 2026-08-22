import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { studyTreeApi } from './api'

const treeKey = (courseId: string) => ['study-tree', courseId]

export function useStudyTree(courseId: string) {
  return useQuery({
    queryKey: treeKey(courseId),
    queryFn: () => studyTreeApi.getTree(courseId),
    enabled: !!courseId,
  })
}

// No optimistic update here — nothing else in this codebase does that for
// mutations yet, and a tree refetch is cheap enough that waiting for the
// server (like every other mutation in the app) is the simpler, more
// consistent choice. The checkbox itself shows a disabled state while its
// own request is in flight (see StudyTreeLeafRow).
export function useCheckNode(courseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (nodeId: string) => studyTreeApi.checkNode(courseId, nodeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: treeKey(courseId) }),
    onError: (error) => toast.error(apiErrorMessage(error, t('studyTree.toastCheckError'))),
  })
}

export function useUncheckNode(courseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (nodeId: string) => studyTreeApi.uncheckNode(courseId, nodeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: treeKey(courseId) }),
    onError: (error) => toast.error(apiErrorMessage(error, t('studyTree.toastUncheckError'))),
  })
}

export function useImportTree(courseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (file: File) => studyTreeApi.importTree(courseId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treeKey(courseId) })
      toast.success(t('studyTree.toastImported'))
    },
    // Deliberately no generic error toast — the import dialog renders the
    // backend's line-by-line validation errors inline instead of flattening
    // them into a single toast message.
  })
}

export function useDeleteTree(courseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: () => studyTreeApi.deleteTree(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treeKey(courseId) })
      toast.success(t('studyTree.toastDeleted'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('studyTree.toastDeleteError'))),
  })
}

export function useDownloadTemplate() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (courseId: string) => studyTreeApi.downloadTemplate(courseId),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'modelo-arvore-de-estudos.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('studyTree.toastTemplateError'))),
  })
}
