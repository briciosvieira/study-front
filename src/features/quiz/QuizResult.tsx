import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { QuizResult as QuizResultType } from '@/shared/types/api.types'

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
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
      <div className="mb-6 rounded-xl border border-border bg-card p-5 text-center sm:p-6">
        <h2 className="text-lg font-semibold text-card-foreground">{t('quizResult.title')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('quizResult.questionsCorrectOf', {
            correct: result.correctAnswers,
            total: result.totalQuestions,
          })}
        </p>
        <p className="mt-2 text-5xl font-extrabold tracking-tight text-primary">
          {Math.round(result.percentage)}%
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-semibold text-card-foreground">{result.correctAnswers}</p>
            <p className="text-xs text-muted-foreground">{t('quizResult.correct')}</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-danger">{result.wrongAnswers}</p>
            <p className="text-xs text-muted-foreground">{t('quizResult.wrong')}</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-card-foreground">
              {formatTime(result.totalTimeSec)}
            </p>
            <p className="text-xs text-muted-foreground">{t('quizResult.totalTime')}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {result.questions.map((question, index) => (
          <div
            key={question.questionId}
            className={
              question.isCorrect
                ? 'rounded-xl border border-emerald-600/30 bg-emerald-600/5 p-4'
                : 'rounded-xl border border-danger/30 bg-danger/5 p-4'
            }
          >
            <div className="flex items-start gap-2">
              {question.isCorrect ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
              ) : (
                <XCircle size={18} className="mt-0.5 shrink-0 text-danger" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('quizResult.questionLabel', { position: index + 1 })}
                </p>
                <p className="mt-0.5 text-sm text-card-foreground">{question.text}</p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('quizResult.yourAnswerLabel')}</p>
                    <p className="text-sm text-card-foreground">
                      {question.selectedOption
                        ? `${question.selectedOption.letter}) ${question.selectedOption.text}`
                        : t('quizResult.notAnswered')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t('quizResult.correctAnswerLabel')}
                    </p>
                    <p className="text-sm text-emerald-600">
                      {question.correctOption
                        ? `${question.correctOption.letter}) ${question.correctOption.text}`
                        : '—'}
                    </p>
                  </div>
                </div>

                {question.elapsedSeconds > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t('quizResult.timeUsedLabel')}: {formatTime(question.elapsedSeconds)}
                    {question.overtimeSeconds > 0 &&
                      ` · ${t('quizResult.timeExceededLabel')}: ${formatTime(question.overtimeSeconds)}`}
                  </p>
                )}

                <p
                  className={
                    question.isCorrect
                      ? 'mt-2 text-sm font-semibold text-emerald-600'
                      : 'mt-2 text-sm font-semibold text-danger'
                  }
                >
                  {question.isCorrect ? t('quizResult.correctBadge') : t('quizResult.wrongBadge')}
                </p>
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
