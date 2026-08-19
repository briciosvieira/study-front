import { useMutation } from '@tanstack/react-query'
import { useEffect, useReducer, useRef } from 'react'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { PageSpinner } from '@/shared/components/Spinner'
import { EmptyState } from '@/shared/components/EmptyState'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { QuizStartResponse } from '@/shared/types/api.types'
import { attemptsApi } from './api'
import { quizReducer } from './quizReducer'
import { QuizResult } from './QuizResult'
import { useQuizTimer } from './useQuizTimer'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function QuizRunner({ moduleId }: { moduleId: string }) {
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(quizReducer, { status: 'loading' })
  const attemptIdRef = useRef<string | null>(null)

  function applyResponse(response: QuizStartResponse) {
    attemptIdRef.current = response.attemptId
    if (response.finished) {
      finishMutation.mutate()
    } else if (response.question) {
      dispatch({ type: 'QUESTION_LOADED', question: response.question })
    } else {
      dispatch({ type: 'NO_QUESTIONS' })
    }
  }

  const startMutation = useMutation({
    mutationFn: () => attemptsApi.start(moduleId),
    onSuccess: applyResponse,
    onError: (error) => {
      toast.error(apiErrorMessage(error, t('quiz.toastStartError')))
      dispatch({ type: 'NO_QUESTIONS' })
    },
  })

  const answerMutation = useMutation({
    mutationFn: (chosenOption: string | null) =>
      attemptsApi.answer(attemptIdRef.current!, currentQuestionId(state)!, chosenOption),
    onSuccess: applyResponse,
    onError: (error) => toast.error(apiErrorMessage(error, t('quiz.toastAnswerError'))),
  })

  const finishMutation = useMutation({
    mutationFn: () => attemptsApi.finish(attemptIdRef.current!),
    onSuccess: (result) => dispatch({ type: 'QUIZ_FINISHED', result }),
    onError: (error) => toast.error(apiErrorMessage(error, t('quiz.toastFinishError'))),
  })

  const retryMutation = useMutation({
    mutationFn: () => attemptsApi.retry(moduleId),
    onSuccess: applyResponse,
    onError: (error) => toast.error(apiErrorMessage(error, t('quiz.toastRetryError'))),
  })

  useEffect(() => {
    startMutation.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId])

  useQuizTimer(
    state.status === 'answering',
    state.status === 'answering' ? state.timeLeft : 0,
    () => dispatch({ type: 'TICK' }),
    () => {
      dispatch({ type: 'SUBMIT' })
      answerMutation.mutate(null)
    },
  )

  if (state.status === 'loading' || state.status === 'submitting') return <PageSpinner />
  if (state.status === 'empty') return <EmptyState title={t('quiz.empty')} />
  if (state.status === 'finished') {
    return (
      <QuizResult
        result={state.result}
        onRetry={() => {
          dispatch({ type: 'NO_QUESTIONS' })
          retryMutation.mutate()
        }}
        isRetrying={retryMutation.isPending}
      />
    )
  }

  const { question, timeLeft } = state
  const isLow = timeLeft <= 30

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <span className="text-sm text-muted-foreground">{t('quiz.timeRemaining')}</span>
        <span
          className={
            isLow
              ? 'text-lg font-semibold tabular-nums text-danger'
              : 'text-lg font-semibold tabular-nums text-card-foreground'
          }
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      <h2 className="mb-4 text-lg font-medium text-foreground">{question.statement}</h2>

      <div className="flex flex-col gap-2">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              dispatch({ type: 'SUBMIT' })
              answerMutation.mutate(option.letter)
            }}
            className="rounded-lg border border-border bg-card px-4 py-3 text-left text-sm text-card-foreground transition-colors hover:border-primary hover:bg-accent"
          >
            <span className="mr-2 font-semibold">{option.letter})</span>
            {option.text}
          </button>
        ))}
      </div>
    </div>
  )
}

function currentQuestionId(state: ReturnType<typeof quizReducer>): string | undefined {
  return state.status === 'answering' || state.status === 'submitting' ? state.question.id : undefined
}
