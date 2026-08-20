import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CourseOverview, type CourseContentTab } from '@/features/courses/CourseOverview'
import { useCourse } from '@/features/courses/useCourses'
import { useModules } from '@/features/modules/useModules'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageSpinner } from '@/shared/components/Spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { useTabParam } from '@/shared/hooks/useTabParam'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { naturalSortByTitle } from '@/shared/utils/naturalSort'
import type { CourseModule } from '@/shared/types/api.types'
import { StudentModuleSection } from './StudentModuleSection'

const TAB_VALUES = ['overview', 'pdf', 'videos', 'quiz'] as const

export function StudentCoursePage() {
  const { t } = useTranslation()
  const { courseId = '' } = useParams()
  const [activeTab, setActiveTab] = useTabParam(TAB_VALUES, 'overview')
  const { data: course, isLoading: isLoadingCourse } = useCourse(courseId)
  const { data: modules, isLoading: isLoadingModules } = useModules(courseId)

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

  if (isLoadingCourse || isLoadingModules) return <PageSpinner />
  if (!course) return <EmptyState title={t('student.courseNotFound')} />

  function renderList(list: CourseModule[], emptyMessage: string) {
    if (!list.length) return <EmptyState title={emptyMessage} />
    return (
      <div className="space-y-8">
        {list.map((moduleItem) => (
          <StudentModuleSection key={moduleItem.id} module={moduleItem} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/student"
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        {t('nav.myCourses')}
      </Link>

      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">{course.title}</h1>
      {course.description && <p className="mb-6 text-sm text-muted-foreground">{course.description}</p>}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{t('courseDetail.tabOverview')}</TabsTrigger>
          <TabsTrigger value="pdf">{t('courseDetail.tabPdf')}</TabsTrigger>
          <TabsTrigger value="videos">{t('courseDetail.tabVideos')}</TabsTrigger>
          <TabsTrigger value="quiz">{t('courseDetail.tabQuiz')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <CourseOverview
            course={course}
            pdfCount={pdfModules.length}
            videoCount={videoModules.length}
            quizCount={quizModules.length}
            onSelectTab={(tab: CourseContentTab) => setActiveTab(tab)}
          />
        </TabsContent>

        <TabsContent value="pdf" className="pt-6">
          {renderList(pdfModules, t('modules.emptyPdf'))}
        </TabsContent>

        <TabsContent value="videos" className="pt-6">
          {renderList(videoModules, t('modules.emptyVideo'))}
        </TabsContent>

        <TabsContent value="quiz" className="pt-6">
          {renderList(quizModules, t('modules.emptyQuiz'))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
