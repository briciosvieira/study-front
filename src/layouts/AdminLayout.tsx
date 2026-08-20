import { BookOpen, FolderOpen, GraduationCap, RotateCcw, ShieldAlert, Users, UserX } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { DashboardLayout } from './DashboardLayout'

export function AdminLayout() {
  const { t } = useTranslation()
  const navItems = [
    { to: '/admin/courses', label: t('nav.courses'), icon: BookOpen },
    { to: '/admin/users', label: t('nav.users'), icon: Users },
    { to: '/admin/students', label: t('nav.students'), icon: GraduationCap },
    { to: '/admin/template-library', label: t('nav.templateLibrary'), icon: FolderOpen },
    { to: '/admin/audit', label: t('nav.audit'), icon: ShieldAlert },
    { to: '/admin/reactivation-requests', label: t('nav.reactivationRequests'), icon: RotateCcw },
    { to: '/admin/email-blocklist', label: t('nav.blocklist'), icon: UserX },
  ]

  return <DashboardLayout areaLabel={t('nav.admin')} navItems={navItems} />
}
