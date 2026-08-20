import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, homeRouteForRole } from '@/features/auth/useAuth'

// VIEW_AUDIT_LOGS is a permission, not a role — the backend's AuditController
// has no @Roles guard at all, only assertAuditPermission (ADMIN or holds the
// permission). An INSTRUCTOR granted this permission must be able to reach
// the audit page too, so this can't live inside the ADMIN-only route subtree.
export function RequireAuditAccess() {
  const { user } = useAuth()
  if (!user) return null

  const canView = user.role === 'ADMIN' || user.permissions.includes('VIEW_AUDIT_LOGS')
  if (!canView) {
    return <Navigate to={homeRouteForRole(user.role)} replace />
  }
  return <Outlet />
}
