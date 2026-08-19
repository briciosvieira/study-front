import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CourseCard } from '@/features/courses/CourseCard'
import { CourseForm } from '@/features/courses/CourseForm'
import { VisibilityModal } from '@/features/courses/VisibilityModal'
import { useCourses, useDeleteCourse } from '@/features/courses/useCourses'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import { CourseGridSkeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import type { Course } from '@/shared/types/api.types'

export function StaffCoursesPage({ basePath, canDelete }: { basePath: string; canDelete: boolean }) {
  const { t } = useTranslation()
  const { data: courses, isLoading } = useCourses()
  const deleteCourse = useDeleteCourse()
  const [formCourse, setFormCourse] = useState<Course | 'new' | null>(null)
  const [visibilityCourse, setVisibilityCourse] = useState<Course | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
  const [query, setQuery] = useState('')

  const filteredCourses = useMemo(() => {
    if (!courses) return courses
    const normalized = query.trim().toLowerCase()
    if (!normalized) return courses
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(normalized) ||
        course.description?.toLowerCase().includes(normalized),
    )
  }, [courses, query])

  return (
    <div>
      <PageHeader
        title={t('courses.title')}
        description={t('courses.subtitle')}
        actions={
          <>
            <div className="relative w-full sm:w-auto">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('courses.searchPlaceholder')}
                className="w-full pl-8 sm:w-64"
              />
            </div>
            <Button onClick={() => setFormCourse('new')}>
              <Plus size={16} />
              {t('courses.newCourse')}
            </Button>
          </>
        }
      />

      {isLoading ? (
        <CourseGridSkeleton />
      ) : !courses?.length ? (
        <EmptyState
          title={t('courses.emptyTitle')}
          description={t('courses.emptyDescription')}
          action={
            <Button onClick={() => setFormCourse('new')}>
              <Plus size={16} />
              {t('courses.newCourse')}
            </Button>
          }
        />
      ) : !filteredCourses?.length ? (
        <EmptyState
          title={t('courses.emptySearchTitle')}
          description={t('courses.emptySearchDescription')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              to={`${basePath}/${course.id}`}
              canEdit
              canDelete={canDelete}
              onEdit={() => setFormCourse(course)}
              onDelete={() => setDeleteTarget(course)}
              onManageVisibility={() => setVisibilityCourse(course)}
            />
          ))}
        </div>
      )}

      <CourseForm
        open={!!formCourse}
        onOpenChange={(open) => !open && setFormCourse(null)}
        course={formCourse === 'new' ? undefined : (formCourse ?? undefined)}
      />

      {visibilityCourse && (
        <VisibilityModal
          key={visibilityCourse.id}
          open={!!visibilityCourse}
          onOpenChange={(open) => !open && setVisibilityCourse(null)}
          course={visibilityCourse}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('courses.deleteTitle', { title: deleteTarget?.title ?? '' })}
        description={t('courses.deleteDescription')}
        isLoading={deleteCourse.isPending}
        onConfirm={() =>
          deleteTarget &&
          deleteCourse.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }
      />
    </div>
  )
}
