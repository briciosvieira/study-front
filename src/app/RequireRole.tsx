import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { homeRouteForRole } from '@/features/auth/useAuth'
import type { Role } from '@/shared/types/api.types'

// Redirects to the visitor's own home area instead of a dead-end "access
// denied" screen — landing on the wrong role's URL isn't an error worth
// dwelling on, it just means routing them to where they actually belong.
export function RequireRole({ roles }: { roles: Role[] }) {
  const { user } = useAuth()
  if (!user) return null

  if (!roles.includes(user.role)) {
    return <Navigate to={homeRouteForRole(user.role)} replace />
  }
  return <Outlet />
}
