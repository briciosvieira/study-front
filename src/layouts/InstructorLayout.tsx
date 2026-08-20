import { BookOpen, FolderOpen, RotateCcw, ShieldAlert, Users } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { DashboardLayout } from './DashboardLayout'

export function InstructorLayout() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navItems = [
    { to: '/instructor/courses', label: t('nav.courses'), icon: BookOpen },
    { to: '/instructor/users', label: t('nav.users'), icon: Users },
    { to: '/instructor/template-library', label: t('nav.templateLibrary'), icon: FolderOpen },
    // VIEW_AUDIT_LOGS / MANAGE_POLICY_REACTIVATION are permissions an ADMIN
    // can grant a specific instructor — not every instructor sees these
    // links, only ones actually granted them.
    ...(user?.permissions.includes('VIEW_AUDIT_LOGS')
      ? [{ to: '/instructor/audit', label: t('nav.audit'), icon: ShieldAlert }]
      : []),
    ...(user?.permissions.includes('MANAGE_POLICY_REACTIVATION')
      ? [
          {
            to: '/instructor/reactivation-requests',
            label: t('nav.reactivationRequests'),
            icon: RotateCcw,
          },
        ]
      : []),
  ]

  return <DashboardLayout areaLabel={t('nav.instructor')} navItems={navItems} />
}
