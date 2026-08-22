import { api } from '@/shared/api/axiosClient'
import type {
  StudyTreeCheckResult,
  StudyTreeData,
  StudyTreeImportResult,
} from '@/shared/types/api.types'

export const studyTreeApi = {
  getTree: (courseId: string) =>
    api.get<StudyTreeData | null>(`/courses/${courseId}/study-tree`).then((r) => r.data),

  importTree: (courseId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post<StudyTreeImportResult>(`/courses/${courseId}/study-tree/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  deleteTree: (courseId: string) => api.delete(`/courses/${courseId}/study-tree`),

  downloadTemplate: (courseId: string) =>
    api
      .get(`/courses/${courseId}/study-tree/template`, { responseType: 'blob' })
      .then((r) => r.data as Blob),

  checkNode: (courseId: string, nodeId: string) =>
    api
      .post<StudyTreeCheckResult>(`/courses/${courseId}/study-tree/nodes/${nodeId}/check`)
      .then((r) => r.data),

  uncheckNode: (courseId: string, nodeId: string) =>
    api
      .delete<StudyTreeCheckResult>(`/courses/${courseId}/study-tree/nodes/${nodeId}/check`)
      .then((r) => r.data),
}
