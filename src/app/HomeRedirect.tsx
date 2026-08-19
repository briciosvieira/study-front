import { Navigate } from 'react-router-dom'
import { homeRouteForRole, useAuth } from '@/features/auth/useAuth'

export function HomeRedirect() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  return <Navigate to={homeRouteForRole(user.role)} replace />
}
