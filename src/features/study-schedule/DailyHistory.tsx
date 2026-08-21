import { FileText, HelpCircle, Video } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { StudyDayGroup } from '@/shared/types/api.types'
import { formatStudyDuration } from './formatStudyDuration'

const TYPE_ICON = { PDF: FileText, VIDEO: Video, QUIZ: HelpCircle }

export function DailyHistory({ history, language }: { history: StudyDayGroup[]; language: string }) {
  const { t } = useTranslation()

  if (!history.length) {
    return <p className="text-sm text-muted-foreground">{t('studySchedule.historyEmpty')}</p>
  }

  return (
    <div className="space-y-3">
      {history.map((day) => (
        <div key={day.date} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium capitalize text-card-foreground">
              {new Date(`${day.date}T00:00:00`).toLocaleDateString(language, {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
              })}
            </p>
            <span className="shrink-0 text-xs text-muted-foreground">
              {t('studySchedule.historyDayTotal', { duration: formatStudyDuration(day.totalSeconds) })}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {day.sessions.map((session) => {
              const Icon = TYPE_ICON[session.resourceType ?? session.moduleType]
              return (
                <div key={session.id} className="flex items-center gap-2.5 text-sm">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <Icon size={13} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-foreground">{session.resourceTitle}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatStudyDuration(session.durationSeconds ?? 0)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
