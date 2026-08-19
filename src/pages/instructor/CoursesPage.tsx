import { StaffCoursesPage } from '@/pages/shared/StaffCoursesPage'

export function CoursesPage() {
  return <StaffCoursesPage basePath="/instructor/courses" canDelete={false} />
}
