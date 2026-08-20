import { ArrowLeft, Plus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CourseForm } from '@/features/courses/CourseForm'
import { CourseOverview, type CourseContentTab } from '@/features/courses/CourseOverview'
import { useCourse } from '@/features/courses/useCourses'
import { VisibilityModal } from '@/features/courses/VisibilityModal'
import { ModuleCard } from '@/features/modules/ModuleCard'
import { ModuleForm } from '@/features/modules/ModuleForm'
import { useDeleteModule, useModules } from '@/features/modules/useModules'
import { CourseScheduleTab } from '@/features/study-schedule/CourseScheduleTab'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import { PageSpinner } from '@/shared/components/Spinner'
import { ListSkeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { useTabParam } from '@/shared/hooks/useTabParam'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { naturalSortByTitle } from '@/shared/utils/naturalSort'
import type { CourseModule, ModuleType } from '@/shared/types/api.types'

const TAB_VALUES = ['overview', 'pdf', 'videos', 'quiz', 'schedule'] as const

export function StaffCourseDetailPage({ basePath, canDelete }: { basePath: string; canDelete: boolean }) {
  const { t } = useTranslation()
  const { courseId = '' } = useParams()
  const [activeTab, setActiveTab] = useTabParam(TAB_VALUES, 'overview')
  const { data: course, isLoading: isLoadingCourse } = useCourse(courseId)
  const { data: modules, isLoading: isLoadingModules } = useModules(courseId)
  const deleteModule = useDeleteModule(courseId)

  const [formState, setFormState] = useState<{ module?: CourseModule; defaultType?: ModuleType } | null>(
    null,
  )
  const [deleteTarget, setDeleteTarget] = useState<CourseModule | null>(null)
  const [visibilityOpen, setVisibilityOpen] = useState(false)
  const [courseFormOpen, setCourseFormOpen] = useState(false)

  const pdfModules = useMemo(
    () => naturalSortByTitle(modules?.filter((m) => m.type === 'PDF') ?? [], (m) => m.title),
    [modules],
  )
  const videoModules = useMemo(
    () => naturalSortByTitle(modules?.filter((m) => m.type === 'VIDEO') ?? [], (m) => m.title),
    [modules],
  )
  const quizModules = useMemo(
    () => naturalSortByTitle(modules?.filter((m) => m.type === 'QUIZ') ?? [], (m) => m.title),
    [modules],
  )

  if (isLoadingCourse) return <PageSpinner />
  if (!course) return <EmptyState title={t('courses.notFound')} />

  function renderModuleList(list: CourseModule[], emptyMessage: string) {
    if (isLoadingModules) return <ListSkeleton />
    if (!list.length) return <EmptyState title={emptyMessage} />
    return (
      <div className="space-y-2">
        {list.map((moduleItem) => (
          <ModuleCard
            key={moduleItem.id}
            module={moduleItem}
            to={`${basePath}/${courseId}/modules/${moduleItem.id}?tab=${activeTab}`}
            canDelete={canDelete}
            onEdit={() => setFormState({ module: moduleItem })}
            onDelete={() => setDeleteTarget(moduleItem)}
          />
        ))}
      </div>
    )
  }

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
            <Button onClick={() => setFormState({})}>
              <Plus size={16} />
              {t('modules.newModule')}
            </Button>
          </>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
        <TabsList>
          <TabsTrigger value="overview">{t('courseDetail.tabOverview')}</TabsTrigger>
          <TabsTrigger value="pdf">{t('courseDetail.tabPdf')}</TabsTrigger>
          <TabsTrigger value="videos">{t('courseDetail.tabVideos')}</TabsTrigger>
          <TabsTrigger value="quiz">{t('courseDetail.tabQuiz')}</TabsTrigger>
          <TabsTrigger value="schedule">{t('courseDetail.tabSchedule')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <CourseOverview
            course={course}
            pdfCount={pdfModules.length}
            videoCount={videoModules.length}
            quizCount={quizModules.length}
            onSelectTab={(tab: CourseContentTab) => setActiveTab(tab)}
            onEdit={() => setCourseFormOpen(true)}
          />
        </TabsContent>

        <TabsContent value="pdf" className="pt-6">
          <div className="mb-4 flex justify-end">
            <Button variant="secondary" onClick={() => setFormState({ defaultType: 'PDF' })}>
              <Plus size={16} />
              {t('moduleDetail.newPdfModule')}
            </Button>
          </div>
          {renderModuleList(pdfModules, t('modules.emptyPdf'))}
        </TabsContent>

        <TabsContent value="videos" className="pt-6">
          <div className="mb-4 flex justify-end">
            <Button variant="secondary" onClick={() => setFormState({ defaultType: 'VIDEO' })}>
              <Plus size={16} />
              {t('moduleDetail.newVideoModule')}
            </Button>
          </div>
          {renderModuleList(videoModules, t('modules.emptyVideo'))}
        </TabsContent>

        <TabsContent value="quiz" className="pt-6">
          <p className="mb-4 text-sm text-muted-foreground">{t('courseDetail.quizSubtitle')}</p>
          <div className="mb-4 flex justify-end">
            <Button variant="secondary" onClick={() => setFormState({ defaultType: 'QUIZ' })}>
              <Plus size={16} />
              {t('moduleDetail.newQuizModule')}
            </Button>
          </div>
          {renderModuleList(quizModules, t('modules.emptyQuiz'))}
        </TabsContent>

        <TabsContent value="schedule" className="pt-6">
          <CourseScheduleTab courseId={courseId} modules={modules ?? []} />
        </TabsContent>
      </Tabs>

      <ModuleForm
        open={!!formState}
        onOpenChange={(open) => !open && setFormState(null)}
        courseId={courseId}
        module={formState?.module}
        defaultType={formState?.defaultType}
      />

      <CourseForm open={courseFormOpen} onOpenChange={setCourseFormOpen} course={course} />

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
