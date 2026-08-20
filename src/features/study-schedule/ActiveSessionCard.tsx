import { Play, Square } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { ActiveStudySession } from '@/shared/types/api.types'
import { formatStudyDuration } from './formatStudyDuration'
import { useFinishStudySession } from './useStudySchedule'

export function ActiveSessionCard({
  courseId,
  activeSession,
}: {
  courseId: string
  activeSession: ActiveStudySession
}) {
  const { t } = useTranslation()
  const finishSession = useFinishStudySession(courseId)
  const isOtherCourse = activeSession.courseId !== courseId

  // Reconstructed from the server-persisted startedAt on every tick — never a
  // client-side counter, so it stays correct across reloads/navigation.
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000),
  )
  useEffect(() => {
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [activeSession.startedAt])

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
            <Play size={14} className="fill-current" />
            {t('studySchedule.activeSessionTitle')}
          </p>
          <p className="mt-1 truncate text-sm text-foreground">
            {activeSession.moduleTitle}
            {isOtherCourse && (
              <span className="text-muted-foreground"> · {activeSession.courseTitle}</span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatStudyDuration(elapsedSeconds)}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => finishSession.mutate(activeSession.id)}
          disabled={finishSession.isPending}
        >
          <Square size={14} />
          {finishSession.isPending ? t('studySchedule.stopping') : t('studySchedule.stopButton')}
        </Button>
      </div>
      {isOtherCourse && (
        <p className="mt-2 text-xs text-muted-foreground">
          {t('studySchedule.activeSessionOtherCourseWarning', {
            course: activeSession.courseTitle,
            module: activeSession.moduleTitle,
          })}
        </p>
      )}
    </div>
  )
}
