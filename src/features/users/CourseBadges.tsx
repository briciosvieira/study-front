import { Badge } from '@/shared/components/Badge'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

export function CourseBadges({
  courses,
  total,
}: {
  courses: { id: string; title: string }[]
  total: number
}) {
  const { t } = useTranslation()

  if (total === 0) {
    return <span className="text-xs text-muted-foreground">{t('students.noCourses')}</span>
  }

  const remaining = total - courses.length

  return (
    <div className="flex flex-wrap items-center gap-1">
      {courses.map((course) => (
        <Badge
          key={course.id}
          variant="muted"
          title={course.title}
          className="max-w-[9rem] truncate"
        >
          {course.title}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="default" title={t('students.moreCoursesTooltip', { count: remaining })}>
          +{remaining}
        </Badge>
      )}
    </div>
  )
}
