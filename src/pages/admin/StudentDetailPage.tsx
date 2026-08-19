import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { UserDetailPage } from './UserDetailPage'

// Same underlying page as /admin/users/:userId — the Students area is a
// different entry point into the identical User <-> Course relation, not a
// separate one, so it reuses the component rather than duplicating it.
export function StudentDetailPage() {
  const { t } = useTranslation()
  return <UserDetailPage backTo="/admin/students" backLabel={t('students.backToStudents')} />
}
