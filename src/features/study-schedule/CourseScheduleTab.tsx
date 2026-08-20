import { Plus } from 'lucide-react'
import { useState } from 'react'
import { PageSpinner } from '@/shared/components/Spinner'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { CourseModule } from '@/shared/types/api.types'
import { ActiveSessionCard } from './ActiveSessionCard'
import { DailyHistory } from './DailyHistory'
import { formatStudyDuration } from './formatStudyDuration'
import { RecommendationList } from './RecommendationList'
import { StartStudyDialog } from './StartStudyDialog'
import { useStudySchedule } from './useStudySchedule'

export function CourseScheduleTab({ courseId, modules }: { courseId: string; modules: CourseModule[] }) {
  const { t, language } = useTranslation()
  const { data: schedule, isLoading } = useStudySchedule(courseId)
  const [startOpen, setStartOpen] = useState(false)
  const [startModuleId, setStartModuleId] = useState<string | undefined>(undefined)

  if (isLoading) return <PageSpinner />
  if (!schedule) return null

  const hasActiveSession = !!schedule.activeSession

  function openStartDialog(moduleId?: string) {
    setStartModuleId(moduleId)
    setStartOpen(true)
  }

  return (
    <div className="space-y-6">
      {schedule.activeSession ? (
        <ActiveSessionCard courseId={courseId} activeSession={schedule.activeSession} />
      ) : (
        modules.length > 0 && (
          <Button onClick={() => openStartDialog()}>
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
          onStudy={openStartDialog}
          disabled={hasActiveSession}
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">{t('studySchedule.historyTitle')}</h2>
        <DailyHistory history={schedule.history} language={language} />
      </div>

      <StartStudyDialog
        key={startModuleId ?? 'default'}
        open={startOpen}
        onOpenChange={setStartOpen}
        courseId={courseId}
        modules={modules}
        defaultModuleId={startModuleId}
      />
    </div>
  )
}
