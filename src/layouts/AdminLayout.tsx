import { BookOpen, GraduationCap, Users } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { DashboardLayout } from './DashboardLayout'

export function AdminLayout() {
  const { t } = useTranslation()
  const navItems = [
    { to: '/admin/courses', label: t('nav.courses'), icon: BookOpen },
    { to: '/admin/users', label: t('nav.users'), icon: Users },
    { to: '/admin/students', label: t('nav.students'), icon: GraduationCap },
  ]

  return <DashboardLayout areaLabel={t('nav.admin')} navItems={navItems} />
}
