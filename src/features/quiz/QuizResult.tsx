import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { QuizResult as QuizResultType } from '@/shared/types/api.types'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export function QuizResult({
  result,
  onRetry,
  isRetrying,
}: {
  result: QuizResultType
  onRetry: () => void
  isRetrying: boolean
}) {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-card-foreground">{t('quizResult.title')}</h2>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-semibold text-card-foreground">
              {result.totalCorrect}/{result.totalQuestions}
            </p>
            <p className="text-xs text-muted-foreground">{t('quizResult.correct')}</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-danger">{result.totalWrong}</p>
            <p className="text-xs text-muted-foreground">{t('quizResult.wrong')}</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-card-foreground">{formatTime(result.totalTimeSec)}</p>
            <p className="text-xs text-muted-foreground">{t('quizResult.totalTime')}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {result.details.map((detail, index) => (
          <div key={index} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-2">
              {detail.correct ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
              ) : (
                <XCircle size={18} className="mt-0.5 shrink-0 text-danger" />
              )}
              <div>
                <p className="text-sm text-card-foreground">{detail.question}</p>
                <p
                  className={
                    detail.correct ? 'mt-1 text-sm text-emerald-600' : 'mt-1 text-sm text-danger'
                  }
                >
                  {t('quizResult.yourAnswer', {
                    answer: detail.chosenOption ?? t('quizResult.timeExpired'),
                  })}
                </p>
                {!detail.correct && (
                  <p className="text-sm text-emerald-600">
                    {t('quizResult.correctAnswer', { answer: detail.correctOption ?? '' })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button className="mt-6 w-full" onClick={onRetry} disabled={isRetrying}>
        {t('quizResult.retry')}
      </Button>
    </div>
  )
}
