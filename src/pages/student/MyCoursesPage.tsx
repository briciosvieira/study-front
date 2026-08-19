import { CourseCard } from '@/features/courses/CourseCard'
import { useMyCourses } from '@/features/courses/useCourses'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import { CourseGridSkeleton } from '@/shared/components/Skeleton'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

export function MyCoursesPage() {
  const { t } = useTranslation()
  const { data: courses, isLoading } = useMyCourses()

  return (
    <div>
      <PageHeader title={t('nav.myCourses')} description={t('student.coursesSubtitle')} />

      {isLoading ? (
        <CourseGridSkeleton />
      ) : !courses?.length ? (
        <EmptyState title={t('student.emptyTitle')} description={t('student.emptyDescription')} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} to={`/student/courses/${course.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}
