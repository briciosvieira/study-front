import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, homeRouteForRole } from '@/features/auth/useAuth'

// MANAGE_POLICY_REACTIVATION is a permission, not a role — mirrors
// RequireAuditAccess exactly, for the same reason: an ADMIN can delegate
// review-hold management to a non-admin without granting the broader
// ADMIN-only /admin/* surface.
export function RequireReactivationAccess() {
  const { user } = useAuth()
  if (!user) return null

  const canManage = user.role === 'ADMIN' || user.permissions.includes('MANAGE_POLICY_REACTIVATION')
  if (!canManage) {
    return <Navigate to={homeRouteForRole(user.role)} replace />
  }
  return <Outlet />
}
