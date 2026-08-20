import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'

const CHANGE_REQUIRED_PASSWORD_PATH = '/change-required-password'

export function RequireAuth() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const onChangeRequiredRoute = location.pathname === CHANGE_REQUIRED_PASSWORD_PATH
  if (user?.mustChangePassword && !onChangeRequiredRoute) {
    return <Navigate to={CHANGE_REQUIRED_PASSWORD_PATH} replace />
  }
  if (!user?.mustChangePassword && onChangeRequiredRoute) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
