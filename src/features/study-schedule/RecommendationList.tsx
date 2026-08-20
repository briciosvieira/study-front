import { FileText, HelpCircle, Video } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { StudyRecommendation } from '@/shared/types/api.types'

const TYPE_ICON = { PDF: FileText, VIDEO: Video, QUIZ: HelpCircle }

export function RecommendationList({
  recommendations,
  onStudy,
  disabled,
}: {
  recommendations: StudyRecommendation[]
  onStudy: (moduleId: string) => void
  disabled?: boolean
}) {
  const { t } = useTranslation()

  if (!recommendations.length) {
    return <p className="text-sm text-muted-foreground">{t('studySchedule.recommendationsEmpty')}</p>
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {recommendations.map((rec) => {
        const Icon = TYPE_ICON[rec.type]
        const reasonText =
          rec.reason === 'LOW_QUIZ_SCORE'
            ? t('studySchedule.reason.LOW_QUIZ_SCORE', { percentage: rec.quizPercentage ?? 0 })
            : rec.reason === 'LONG_TIME_NO_STUDY'
              ? t('studySchedule.reason.LONG_TIME_NO_STUDY', { days: rec.daysSinceLastStudy ?? 0 })
              : t(`studySchedule.reason.${rec.reason}`)

        return (
          <div
            key={rec.moduleId}
            className="flex flex-col justify-between rounded-xl border border-border bg-card p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon size={15} />
                </span>
                <p className="min-w-0 truncate text-sm font-medium text-card-foreground">{rec.title}</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{reasonText}</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              disabled={disabled}
              onClick={() => onStudy(rec.moduleId)}
            >
              {t('studySchedule.recommendationStudyButton')}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
