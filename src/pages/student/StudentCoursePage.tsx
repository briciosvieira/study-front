import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCourse } from '@/features/courses/useCourses'
import { useModules } from '@/features/modules/useModules'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageSpinner } from '@/shared/components/Spinner'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { StudentModuleSection } from './StudentModuleSection'

export function StudentCoursePage() {
  const { t } = useTranslation()
  const { courseId = '' } = useParams()
  const { data: course, isLoading: isLoadingCourse } = useCourse(courseId)
  const { data: modules, isLoading: isLoadingModules } = useModules(courseId)

  if (isLoadingCourse || isLoadingModules) return <PageSpinner />
  if (!course) return <EmptyState title={t('student.courseNotFound')} />

  return (
    <div>
      <Link
        to="/student"
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        {t('nav.myCourses')}
      </Link>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">{course.title}</h1>

      {!modules?.length ? (
        <EmptyState title={t('student.contentEmpty')} />
      ) : (
        <div className="space-y-8">
          {modules.map((module) => (
            <StudentModuleSection key={module.id} module={module} />
          ))}
        </div>
      )}
    </div>
  )
}
