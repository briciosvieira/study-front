import { api } from '@/shared/api/axiosClient'
import type {
  AvailableStudent,
  Course,
  EnrolledStudent,
  PaginatedResult,
} from '@/shared/types/api.types'

export interface StudentListParams {
  search?: string
  page?: number
  limit?: number
}

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

  getStudents: (id: string, params?: StudentListParams) =>
    api
      .get<PaginatedResult<EnrolledStudent>>(`/courses/${id}/students`, { params })
      .then((r) => r.data),
  getAvailableStudents: (id: string, params?: StudentListParams) =>
    api
      .get<PaginatedResult<AvailableStudent>>(`/courses/${id}/available-students`, { params })
      .then((r) => r.data),
  addStudents: (id: string, userIds: string[]) =>
    api.post(`/courses/${id}/students`, { userIds }).then((r) => r.data),
  removeStudent: (id: string, userId: string) =>
    api.delete(`/courses/${id}/students/${userId}`).then((r) => r.data),

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
