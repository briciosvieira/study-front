import { FileText, HelpCircle, Pencil, Video } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { Course } from '@/shared/types/api.types'

export type CourseContentTab = 'pdf' | 'videos' | 'quiz'

export function CourseOverview({
  course,
  pdfCount,
  videoCount,
  quizCount,
  onSelectTab,
  onEdit,
}: {
  course: Course
  pdfCount: number
  videoCount: number
  quizCount: number
  onSelectTab: (tab: CourseContentTab) => void
  onEdit?: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t('courseDetail.about')}
          </h2>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil size={14} />
              {t('common.edit')}
            </Button>
          )}
        </div>
        <p className="mt-2 whitespace-pre-line text-sm text-card-foreground">
          {course.about || t('courseDetail.aboutEmpty')}
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('courseDetail.targetAudience')}
        </h2>
        <p className="mt-2 whitespace-pre-line text-sm text-card-foreground">
          {course.targetAudience || t('courseDetail.targetAudienceEmpty')}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('courseDetail.contentTitle')}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onSelectTab('pdf')}
            className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30"
          >
            <FileText size={18} className="text-muted-foreground" />
            <p className="mt-2 text-2xl font-semibold text-card-foreground">{pdfCount}</p>
            <p className="text-sm text-muted-foreground">{t('courseDetail.tabPdf')}</p>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('videos')}
            className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30"
          >
            <Video size={18} className="text-muted-foreground" />
            <p className="mt-2 text-2xl font-semibold text-card-foreground">{videoCount}</p>
            <p className="text-sm text-muted-foreground">{t('courseDetail.tabVideos')}</p>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('quiz')}
            className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30"
          >
            <HelpCircle size={18} className="text-muted-foreground" />
            <p className="mt-2 text-2xl font-semibold text-card-foreground">{quizCount}</p>
            <p className="text-sm text-muted-foreground">{t('courseDetail.tabQuiz')}</p>
          </button>
        </div>
      </section>
    </div>
  )
}
