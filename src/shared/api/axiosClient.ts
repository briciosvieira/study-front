import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/features/auth/authStore'
import { clearLastActivity } from '@/features/auth/sessionActivity'
import type { ApiErrorBody } from '@/shared/types/api.types'

interface Envelope<T> {
  success: true
  data: T
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // sends the httpOnly refresh cookie
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// Every successful response body is { success, data } — unwrap it here so
// every feature's api.ts can just read response.data as the real payload.
api.interceptors.response.use((response) => {
  const body = response.data as Envelope<unknown>
  if (body && typeof body === 'object' && 'data' in body) {
    response.data = body.data
  }
  return response
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const response = await axios.post<Envelope<{ accessToken: string }>>(
    '/auth/refresh',
    {},
    { baseURL: import.meta.env.VITE_API_URL, withCredentials: true },
  )
  const { accessToken } = response.data.data
  useAuthStore.getState().setAccessToken(accessToken)
  return accessToken
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const config = error.config as RetriableConfig | undefined
    const isAuthRoute = config?.url?.startsWith('/auth/')

    if (error.response?.status === 401 && config && !config._retried && !isAuthRoute) {
      config._retried = true
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const accessToken = await refreshPromise
        config.headers.set('Authorization', `Bearer ${accessToken}`)
        return api(config)
      } catch {
        useAuthStore.getState().clearSession()
        clearLastActivity()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as ApiErrorBody | undefined)?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }
  return fallback
}
