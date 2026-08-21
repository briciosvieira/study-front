import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageSpinner } from '@/shared/components/Spinner'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { StudyRecommendation } from '@/shared/types/api.types'
import { ActiveSessionCard } from './ActiveSessionCard'
import { DailyHistory } from './DailyHistory'
import { formatStudyDuration } from './formatStudyDuration'
import { RecommendationList } from './RecommendationList'
import { StartStudyDialog } from './StartStudyDialog'
import { useStartStudySession, useStudyResources, useStudySchedule } from './useStudySchedule'

export function CourseScheduleTab({ courseId }: { courseId: string }) {
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const { data: schedule, isLoading } = useStudySchedule(courseId)
  const { data: resources } = useStudyResources(courseId)
  const startSession = useStartStudySession(courseId)
  const [startOpen, setStartOpen] = useState(false)

  if (isLoading) return <PageSpinner />
  if (!schedule) return null

  const hasActiveSession = !!schedule.activeSession

  // A recommendation always resolves to real content (individual PDF/VIDEO,
  // or the QUIZ module itself) — clicking "Estudar" opens it directly, no
  // extra picker step. The dialog fallback only fires for the edge case of
  // a PDF/VIDEO module with no items at all yet.
  async function handleStudyRecommendation(rec: StudyRecommendation) {
    if (rec.resourceType === 'PDF' && rec.resourceId) {
      await startSession.mutateAsync({ moduleId: rec.moduleId, pdfItemId: rec.resourceId })
      navigate(`/modules/${rec.moduleId}/pdf/${rec.resourceId}`)
      return
    }
    if (rec.resourceType === 'VIDEO' && rec.resourceId) {
      await startSession.mutateAsync({ moduleId: rec.moduleId, videoItemId: rec.resourceId })
      navigate(`/modules/${rec.moduleId}/video/${rec.resourceId}`)
      return
    }
    if (rec.resourceType === 'QUIZ' && rec.resourceId) {
      await startSession.mutateAsync({ moduleId: rec.moduleId })
      navigate(`/modules/${rec.moduleId}/quiz`)
      return
    }
    setStartOpen(true)
  }

  return (
    <div className="space-y-6">
      {schedule.activeSession ? (
        <ActiveSessionCard courseId={courseId} activeSession={schedule.activeSession} />
      ) : (
        !!resources?.length && (
          <Button onClick={() => setStartOpen(true)}>
            <Plus size={16} />
            {t('studySchedule.startButton')}
          </Button>
        )
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t('studySchedule.todayTotalLabel')}</p>
          <p className="mt-1 text-xl font-semibold text-card-foreground">
            {formatStudyDuration(schedule.summary.totalSecondsToday)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t('studySchedule.summaryTotalTime')}</p>
          <p className="mt-1 text-xl font-semibold text-card-foreground">
            {formatStudyDuration(schedule.summary.totalSecondsLast14Days)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t('studySchedule.summaryModulesStudied')}</p>
          <p className="mt-1 text-xl font-semibold text-card-foreground">
            {schedule.summary.modulesStudiedLast14Days}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-sm font-semibold text-foreground">
          {t('studySchedule.recommendationsTitle')}
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">{t('studySchedule.recommendationsSubtitle')}</p>
        <RecommendationList
          recommendations={schedule.recommendations}
          onStudy={handleStudyRecommendation}
          disabled={hasActiveSession || startSession.isPending}
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">{t('studySchedule.historyTitle')}</h2>
        <DailyHistory history={schedule.history} language={language} />
      </div>

      <StartStudyDialog open={startOpen} onOpenChange={setStartOpen} courseId={courseId} />
    </div>
  )
}
