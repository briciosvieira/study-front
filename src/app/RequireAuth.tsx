import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'

const CHANGE_REQUIRED_PASSWORD_PATH = '/change-required-password'
const POLICY_REQUIRED_PATH = '/policy-required'

// Priority order: mustChangePassword first (a temporary password an
// admin/instructor still knows must be replaced before anything else, even
// before the policy screen — a brand-new PENDING user can be reset like
// this too), then policy acceptance state, then the normal app.
// ACCOUNT_INACTIVE isn't handled here: JwtStrategy already rejects an
// inactive user's token on every request (401), so a deactivated session
// dies naturally via the existing refresh-failure -> clearSession flow.
export function RequireAuth() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const onChangeRequiredRoute = location.pathname === CHANGE_REQUIRED_PASSWORD_PATH
  const onPolicyRequiredRoute = location.pathname === POLICY_REQUIRED_PATH

  if (user?.mustChangePassword) {
    return onChangeRequiredRoute ? <Outlet /> : <Navigate to={CHANGE_REQUIRED_PASSWORD_PATH} replace />
  }
  if (onChangeRequiredRoute) {
    return <Navigate to="/" replace />
  }

  const policyBlocked = user?.accessState && user.accessState !== 'POLICY_ACCEPTED' && user.accessState !== 'ACCOUNT_INACTIVE'
  if (policyBlocked) {
    return onPolicyRequiredRoute ? <Outlet /> : <Navigate to={POLICY_REQUIRED_PATH} replace />
  }
  if (onPolicyRequiredRoute) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
