import { api } from '@/shared/api/axiosClient'
import type { Course } from '@/shared/types/api.types'

export interface CreateCoursePayload {
  title: string
  description?: string
}
export type UpdateCoursePayload = Partial<CreateCoursePayload> & { active?: boolean }

export const coursesApi = {
  list: () => api.get<Course[]>('/courses').then((r) => r.data),
  listMine: () => api.get<Course[]>('/courses/mine').then((r) => r.data),
  get: (id: string) => api.get<Course>(`/courses/${id}`).then((r) => r.data),
  create: (payload: CreateCoursePayload) =>
    api.post<Course>('/courses', payload).then((r) => r.data),
  update: (id: string, payload: UpdateCoursePayload) =>
    api.patch<Course>(`/courses/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/courses/${id}`),
  setVisibility: (id: string, studentIds: string[]) =>
    api.put(`/courses/${id}/visibility`, { studentIds }),

  uploadCover: (id: string, file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post<Course>(`/courses/${id}/cover`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100))
        },
      })
      .then((r) => r.data)
  },
  removeCover: (id: string) => api.delete<Course>(`/courses/${id}/cover`).then((r) => r.data),
}
