import { api } from '@/shared/api/axiosClient'
import type { CourseModule, ModuleType } from '@/shared/types/api.types'

export interface CreateModulePayload {
  type: ModuleType
  title: string
  coverUrl?: string
  studyPriority?: number
}
export type UpdateModulePayload = Partial<CreateModulePayload> & { order?: number }

export const modulesApi = {
  listForCourse: (courseId: string) =>
    api.get<CourseModule[]>(`/courses/${courseId}/modules`).then((r) => r.data),
  create: (courseId: string, payload: CreateModulePayload) =>
    api.post<CourseModule>(`/courses/${courseId}/modules`, payload).then((r) => r.data),
  update: (id: string, payload: UpdateModulePayload) =>
    api.patch<CourseModule>(`/modules/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/modules/${id}`),
  setVisibility: (id: string, visible: boolean) =>
    api.patch<CourseModule>(`/modules/${id}/visibility`, { visible }).then((r) => r.data),
}
