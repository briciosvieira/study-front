import { BookOpen, Users } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { DashboardLayout } from './DashboardLayout'

export function AdminLayout() {
  const { t } = useTranslation()
  const navItems = [
    { to: '/admin/courses', label: t('nav.courses'), icon: BookOpen },
    { to: '/admin/users', label: t('nav.users'), icon: Users },
  ]

  return <DashboardLayout areaLabel={t('nav.admin')} navItems={navItems} />
}
