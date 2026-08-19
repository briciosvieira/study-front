import { ArrowLeft, Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ModuleCard } from '@/features/modules/ModuleCard'
import { ModuleForm } from '@/features/modules/ModuleForm'
import { useDeleteModule, useModules } from '@/features/modules/useModules'
import { VisibilityModal } from '@/features/courses/VisibilityModal'
import { useCourse } from '@/features/courses/useCourses'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import { PageSpinner } from '@/shared/components/Spinner'
import { ListSkeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { CourseModule } from '@/shared/types/api.types'

export function StaffCourseDetailPage({ basePath, canDelete }: { basePath: string; canDelete: boolean }) {
  const { t } = useTranslation()
  const { courseId = '' } = useParams()
  const { data: course, isLoading: isLoadingCourse } = useCourse(courseId)
  const { data: modules, isLoading: isLoadingModules } = useModules(courseId)
  const deleteModule = useDeleteModule(courseId)

  const [formModule, setFormModule] = useState<CourseModule | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CourseModule | null>(null)
  const [visibilityOpen, setVisibilityOpen] = useState(false)

  if (isLoadingCourse) return <PageSpinner />
  if (!course) return <EmptyState title={t('courses.notFound')} />

  return (
    <div>
      <Link
        to={basePath}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        {t('modules.backToCourses')}
      </Link>

      <PageHeader
        title={course.title}
        description={course.description ?? undefined}
        actions={
          <>
            <Button variant="secondary" onClick={() => setVisibilityOpen(true)}>
              <Users size={16} />
              {t('courses.visibility')}
            </Button>
            <Button onClick={() => setFormModule('new')}>
              <Plus size={16} />
              {t('modules.newModule')}
            </Button>
          </>
        }
      />

      {isLoadingModules ? (
        <ListSkeleton />
      ) : !modules?.length ? (
        <EmptyState title={t('modules.emptyTitle')} description={t('modules.emptyDescription')} />
      ) : (
        <div className="space-y-2">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              to={`${basePath}/${courseId}/modules/${module.id}`}
              canDelete={canDelete}
              onEdit={() => setFormModule(module)}
              onDelete={() => setDeleteTarget(module)}
            />
          ))}
        </div>
      )}

      <ModuleForm
        open={!!formModule}
        onOpenChange={(open) => !open && setFormModule(null)}
        courseId={courseId}
        module={formModule === 'new' ? undefined : (formModule ?? undefined)}
      />

      {visibilityOpen && (
        <VisibilityModal
          key={course.id}
          open={visibilityOpen}
          onOpenChange={setVisibilityOpen}
          course={course}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('modules.deleteTitle', { title: deleteTarget?.title ?? '' })}
        description={t('modules.deleteDescription')}
        isLoading={deleteModule.isPending}
        onConfirm={() =>
          deleteTarget &&
          deleteModule.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }
      />
    </div>
  )
}
