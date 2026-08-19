import { api } from '@/shared/api/axiosClient'
import type { User } from '@/shared/types/api.types'

export interface LoginPayload {
  login: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload).then((r) => r.data),
  refresh: () =>
    api.post<{ accessToken: string }>('/auth/refresh').then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
  logout: () => api.post('/auth/logout'),
}
