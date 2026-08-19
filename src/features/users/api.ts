import { api } from '@/shared/api/axiosClient'
import type { Role, User } from '@/shared/types/api.types'

export interface CreateUserPayload {
  name: string
  email: string
  username: string
  password: string
  role: Role
}

export type UpdateUserPayload = Partial<CreateUserPayload> & { active?: boolean }

export interface StudentSummary {
  id: string
  name: string
  email: string
}

export const usersApi = {
  list: () => api.get<User[]>('/users').then((r) => r.data),
  listStudents: () => api.get<StudentSummary[]>('/users/students').then((r) => r.data),
  create: (payload: CreateUserPayload) => api.post<User>('/users', payload).then((r) => r.data),
  update: (id: string, payload: UpdateUserPayload) =>
    api.patch<User>(`/users/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/users/${id}`),
}
