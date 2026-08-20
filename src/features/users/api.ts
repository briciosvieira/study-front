import { api } from '@/shared/api/axiosClient'
import type { PaginatedResult, Role, StudentOverview, User, UserCourse } from '@/shared/types/api.types'

export interface CreateUserPayload {
  name: string
  email: string
  username: string
  password: string
  role: Role
}

export type UpdateUserPayload = Partial<CreateUserPayload> & { active?: boolean }

export interface StudentsOverviewParams {
  search?: string
  page?: number
  limit?: number
}

export const usersApi = {
  list: () => api.get<User[]>('/users').then((r) => r.data),
  getStudentsOverview: (params?: StudentsOverviewParams) =>
    api.get<PaginatedResult<StudentOverview>>('/users/students', { params }).then((r) => r.data),
  get: (id: string) => api.get<User>(`/users/${id}`).then((r) => r.data),
  create: (payload: CreateUserPayload) => api.post<User>('/users', payload).then((r) => r.data),
  update: (id: string, payload: UpdateUserPayload) =>
    api.patch<User>(`/users/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/users/${id}`),
  resetPassword: (id: string, newPassword: string) =>
    api.post(`/users/${id}/reset-password`, { newPassword }).then((r) => r.data),

  getCourses: (id: string) => api.get<UserCourse[]>(`/users/${id}/courses`).then((r) => r.data),
  getAvailableCourses: (id: string, search?: string) =>
    api
      .get<UserCourse[]>(`/users/${id}/available-courses`, { params: { search } })
      .then((r) => r.data),
  addCourses: (id: string, courseIds: string[]) =>
    api.post(`/users/${id}/courses`, { courseIds }).then((r) => r.data),
  removeCourse: (id: string, courseId: string) =>
    api.delete(`/users/${id}/courses/${courseId}`).then((r) => r.data),
}
