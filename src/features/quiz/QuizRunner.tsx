import { useMutation } from '@tanstack/react-query'
import { useEffect, useReducer, useState } from 'react'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageSpinner } from '@/shared/components/Spinner'
import { Button } from '@/shared/components/ui/button'
import { Progress } from '@/shared/components/ui/progress'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { QuizAttemptState } from '@/shared/types/api.types'
import { attemptsApi } from './api'
import { normalizeQuizDisplayText } from './normalizeQuizText'
import { quizReducer } from './quizReducer'
import { QuizResult } from './QuizResult'
import { useQuestionTimer } from './useQuizTimer'

function formatTime(totalSeconds: number) {
  const sign = totalSeconds < 0 ? '-' : ''
  const abs = Math.abs(totalSeconds)
  const m = Math.floor(abs / 60)
  const s = abs % 60
  return `${sign}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function QuizRunner({ moduleId }: { moduleId: string }) {
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(quizReducer, { status: 'loading' })
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false)

  const infoMutation = useMutation({
    mutationFn: () => attemptsApi.info(moduleId),
    onSuccess: (info) => dispatch({ type: 'INFO_LOADED', info }),
    onError: (error) => toast.error(apiErrorMessage(error, t('quiz.toastInfoError'))),
  })

  useEffect(() => {
    infoMutation.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId])

  function applyAttempt(attempt: QuizAttemptState) {
    if (attempt.status === 'COMPLETED') {
      resultMutation.mutate(attempt.attemptId)
      return
    }
    dispatch({ type: 'ATTEMPT_LOADED', attemptId: attempt.attemptId, questions: attempt.questions })
  }

  const startMutation = useMutation({
    mutationFn: () => attemptsApi.start(moduleId),
    onSuccess: applyAttempt,
    onError: (error) => toast.error(apiErrorMessage(error, t('quiz.toastStartError'))),
  })

  const retryMutation = useMutation({
    mutationFn: () => attemptsApi.retry(moduleId),
    onSuccess: applyAttempt,
    onError: (error) => toast.error(apiErrorMessage(error, t('quiz.toastRetryError'))),
  })

  const resultMutation = useMutation({
    mutationFn: (attemptId: string) => attemptsApi.result(attemptId),
    onSuccess: (result) => dispatch({ type: 'RESULT_LOADED', result }),
    onError: (error) => toast.error(apiErrorMessage(error, t('quiz.toastResultError'))),
  })

  const submitAnswerMutation = useMutation({
    mutationFn: ({
      attemptId,
      questionId,
      selectedOptionId,
    }: {
      attemptId: string
      questionId: string
      selectedOptionId: string | null
    }) => attemptsApi.submitAnswer(attemptId, questionId, selectedOptionId),
    onError: (error) => toast.error(apiErrorMessage(error, t('quiz.toastAnswerError'))),
  })

  const finishMutation = useMutation({
    mutationFn: (attemptId: string) => attemptsApi.finish(attemptId),
    onSuccess: (result) => dispatch({ type: 'RESULT_LOADED', result }),
    onError: (error) => toast.error(apiErrorMessage(error, t('quiz.toastFinishError'))),
  })

  const currentQuestion =
    state.status === 'in_progress' ? state.questions[state.currentIndex] : undefined

  // Registers the "entered this question" timestamp with the server the
  // first time it's ever viewed — the countdown for every other visit is
  // reconstructed from that persisted timestamp, never from a local clock.
  useEffect(() => {
    if (state.status !== 'in_progress' || !currentQuestion) return
    if (currentQuestion.questionStartedAt) return
    submitAnswerMutation.mutate(
      {
        attemptId: state.attemptId,
        questionId: currentQuestion.id,
        selectedOptionId: currentQuestion.selectedOptionId,
      },
      {
        onSuccess: (updated) => {
          if (!updated.questionStartedAt) return
          dispatch({
            type: 'QUESTION_STARTED',
            questionId: currentQuestion.id,
            questionStartedAt: updated.questionStartedAt,
          })
        },
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status === 'in_progress' ? state.currentIndex : null])

  const timeLeft = useQuestionTimer(
    currentQuestion?.questionStartedAt ?? null,
    currentQuestion?.timeLimitSec ?? 0,
  )

  if (state.status === 'loading') return <PageSpinner />
  if (state.status === 'empty') return <EmptyState title={t('quiz.empty')} />

  if (state.status === 'start') {
    const { info } = state
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-xl border border-border bg-card p-6 text-center sm:p-8">
          <h1 className="text-xl font-semibold text-card-foreground">{t('quiz.startTitle')}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {t('quiz.questionsCount', { count: info.totalQuestions })}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('quiz.avgTimeLabel')}: {formatTime(info.avgTimeLimitSec)} {t('quiz.perQuestion')}
          </p>

          <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            {info.latestStatus === 'IN_PROGRESS' && (
              <Button onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
                {t('quiz.continueButton')}
              </Button>
            )}
            {info.latestStatus === 'COMPLETED' && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => info.latestAttemptId && resultMutation.mutate(info.latestAttemptId)}
                  disabled={resultMutation.isPending}
                >
                  {t('quiz.viewResultButton')}
                </Button>
                <Button onClick={() => retryMutation.mutate()} disabled={retryMutation.isPending}>
                  {t('quizResult.retry')}
                </Button>
              </>
            )}
            {info.latestStatus === null && (
              <Button onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
                {t('quiz.startButton')}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (state.status === 'result') {
    return (
      <QuizResult
        result={state.result}
        onRetry={() => retryMutation.mutate()}
        isRetrying={retryMutation.isPending}
      />
    )
  }

  if (!currentQuestion) return <PageSpinner />

  const total = state.questions.length
  const answeredCount = state.questions.filter((q) => q.selectedOptionId).length
  const unansweredCount = total - answeredCount
  const progressPct = Math.round(((state.currentIndex + 1) / total) * 100)
  const isLow = timeLeft <= 30 && timeLeft > 0
  const isOver = timeLeft <= 0

  function selectOption(optionId: string) {
    if (state.status !== 'in_progress' || !currentQuestion) return
    dispatch({ type: 'OPTION_SELECTED', questionId: currentQuestion.id, selectedOptionId: optionId })
    submitAnswerMutation.mutate({
      attemptId: state.attemptId,
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
    })
  }

  function goFinish() {
    if (state.status !== 'in_progress') return
    if (unansweredCount > 0) {
      setConfirmFinishOpen(true)
      return
    }
    finishMutation.mutate(state.attemptId)
  }

  return (
    <div className="mx-auto max-w-xl lg:max-w-5xl xl:max-w-6xl">
      <div className="mb-4 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{t('quiz.questionOf', { current: state.currentIndex + 1, total })}</span>
            <span>{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="mt-2" />
        </div>
        <Button size="sm" onClick={goFinish} disabled={finishMutation.isPending} className="shrink-0">
          {t('quiz.finishButton')}
        </Button>
      </div>

      <div className="mb-5 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <span className="text-sm text-muted-foreground">{t('quiz.timeRemaining')}</span>
        <span
          className={
            isOver
              ? 'text-lg font-semibold tabular-nums text-danger'
              : isLow
                ? 'text-lg font-semibold tabular-nums text-danger'
                : 'text-lg font-semibold tabular-nums text-card-foreground'
          }
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      <h2 className="mb-4 whitespace-pre-wrap text-lg font-medium text-foreground">
        {normalizeQuizDisplayText(currentQuestion.statement)}
      </h2>

      <div className="flex flex-col gap-2">
        {currentQuestion.options.map((option) => {
          const selected = currentQuestion.selectedOptionId === option.id
          return (
            <button
              key={option.id}
              onClick={() => selectOption(option.id)}
              aria-pressed={selected}
              className={
                selected
                  ? 'whitespace-pre-wrap rounded-lg border-2 border-primary bg-accent px-4 py-3 text-left text-sm text-card-foreground'
                  : 'whitespace-pre-wrap rounded-lg border border-border bg-card px-4 py-3 text-left text-sm text-card-foreground transition-colors hover:border-primary hover:bg-accent'
              }
            >
              <span className="mr-2 font-semibold">{option.letter})</span>
              {normalizeQuizDisplayText(option.text)}
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          onClick={() => dispatch({ type: 'GOTO', index: state.currentIndex - 1 })}
          disabled={state.currentIndex === 0}
        >
          {t('quiz.previous')}
        </Button>
        <Button
          variant="secondary"
          onClick={() => dispatch({ type: 'GOTO', index: state.currentIndex + 1 })}
          disabled={state.currentIndex === total - 1}
        >
          {t('quiz.next')}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmFinishOpen}
        onOpenChange={setConfirmFinishOpen}
        title={t('quiz.unansweredConfirmTitle')}
        description={t('quiz.unansweredConfirmDescription', { count: unansweredCount })}
        confirmLabel={t('quiz.confirmFinish')}
        isLoading={finishMutation.isPending}
        onConfirm={() => {
          setConfirmFinishOpen(false)
          finishMutation.mutate(state.attemptId)
        }}
      />
    </div>
  )
}
