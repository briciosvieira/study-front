import { Checkbox } from '@/shared/components/ui/checkbox'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { Permission, User } from '@/shared/types/api.types'
import { useSetUserPermission } from './useUserCourses'

// An ADMIN's own access is always full and role-based, never a stored grant
// — the backend rejects trying to modify permissions on an ADMIN target, so
// this card doesn't even render for one. Covers both the audit permissions
// and the policy-reactivation-management delegation, since both are the
// same minimal grant mechanism (see UsersService.setPermission).
export function UserAdminPermissionsCard({ user }: { user: User }) {
  const { t } = useTranslation()
  const setPermission = useSetUserPermission()

  if (user.role === 'ADMIN') return null

  const hasView = user.permissions.includes('VIEW_AUDIT_LOGS')
  const hasExport = user.permissions.includes('EXPORT_AUDIT_LOGS')
  const hasReactivationManagement = user.permissions.includes('MANAGE_POLICY_REACTIVATION')

  function toggle(permission: Permission, grant: boolean) {
    setPermission.mutate({ id: user.id, permission, grant })
    // exporting without viewing is meaningless (and rejected server-side) —
    // keep the UI consistent by dropping export the moment view is revoked
    if (permission === 'VIEW_AUDIT_LOGS' && !grant && hasExport) {
      setPermission.mutate({ id: user.id, permission: 'EXPORT_AUDIT_LOGS', grant: false })
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">{t('policy.adminPermissionsTitle')}</h3>
      <div className="mt-3 space-y-3">
        <label className="flex items-center gap-2.5 text-sm text-foreground">
          <Checkbox
            checked={hasView}
            disabled={setPermission.isPending}
            onCheckedChange={(checked) => toggle('VIEW_AUDIT_LOGS', checked === true)}
          />
          {t('policy.permissionView')}
        </label>
        <label className="flex items-center gap-2.5 text-sm text-foreground">
          <Checkbox
            checked={hasExport}
            disabled={setPermission.isPending || !hasView}
            onCheckedChange={(checked) => toggle('EXPORT_AUDIT_LOGS', checked === true)}
          />
          {t('policy.permissionExport')}
        </label>
        <label className="flex items-center gap-2.5 text-sm text-foreground">
          <Checkbox
            checked={hasReactivationManagement}
            disabled={setPermission.isPending}
            onCheckedChange={(checked) => toggle('MANAGE_POLICY_REACTIVATION', checked === true)}
          />
          {t('policy.permissionManageReactivation')}
        </label>
      </div>
    </div>
  )
}
