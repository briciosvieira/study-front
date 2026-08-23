import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi, type LoginPayload } from './api'
import { useAuthStore } from './authStore'
import { clearLastActivity } from './sessionActivity'

// Runs once at app startup: the httpOnly refresh cookie may still be valid
// even though the in-memory access token was wiped by a page reload, so try
// to silently restore the session before deciding the visitor is logged out.
export function useSessionBootstrap() {
  const { user, setSession } = useAuthStore()

  // enabled: !user means this only ever runs once per fresh page load, while
  // the store still holds its null initial state — a failed attempt (no
  // valid cookie) leaves that same null state in place, nothing to clear.
  const query = useQuery({
    queryKey: ['session-bootstrap'],
    queryFn: async () => {
      const { accessToken } = await authApi.refresh()
      useAuthStore.getState().setAccessToken(accessToken)
      const me = await authApi.me()
      setSession(accessToken, me)
      return me
    },
    retry: false,
    staleTime: Infinity,
    enabled: !user,
  })

  return { isBootstrapping: !user && query.isPending && query.fetchStatus !== 'idle' }
}

export function useAuth() {
  const { user, accessToken } = useAuthStore()
  return { user, isAuthenticated: !!accessToken && !!user }
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ accessToken, user }) => {
      setSession(accessToken, user)
      navigate(homeRouteForRole(user.role))
    },
  })
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearSession()
      clearLastActivity()
      queryClient.clear()
      navigate('/login')
    },
  })
}

// Used ONLY by the 2h-inactivity watcher — NOT the manual "Sair" button
// (that stays on useLogout's normal SPA navigate). Inactivity logout forces
// a full browser navigation instead: a background tab left open for hours
// can carry stale React/axios/React Query state, and only a real document
// reload reliably clears it and guarantees the very next login attempt
// works on the first try. The /auth/logout call is best-effort and not
// awaited so a slow/flaky connection never delays the redirect; local
// session state is cleared synchronously either way.
export function logoutDueToInactivity(queryClient: QueryClient): void {
  authApi.logout().catch(() => {})
  useAuthStore.getState().clearSession()
  clearLastActivity()
  queryClient.clear()
  window.location.replace('/login?reason=inactive')
}

export function homeRouteForRole(role: string): string {
  if (role === 'ADMIN') return '/admin'
  if (role === 'INSTRUCTOR') return '/instructor'
  return '/student'
}
