import { BookOpen, FolderOpen } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { DashboardLayout } from './DashboardLayout'

export function InstructorLayout() {
  const { t } = useTranslation()
  const navItems = [
    { to: '/instructor/courses', label: t('nav.courses'), icon: BookOpen },
    { to: '/instructor/template-library', label: t('nav.templateLibrary'), icon: FolderOpen },
  ]

  return <DashboardLayout areaLabel={t('nav.instructor')} navItems={navItems} />
}
