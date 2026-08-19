import type { QuizAttemptQuestion, QuizInfo, QuizResult } from '@/shared/types/api.types'

export type QuizState =
  | { status: 'loading' }
  | { status: 'start'; info: QuizInfo }
  | {
      status: 'in_progress'
      attemptId: string
      questions: QuizAttemptQuestion[]
      currentIndex: number
    }
  | { status: 'result'; result: QuizResult }
  | { status: 'empty' }

export type QuizAction =
  | { type: 'INFO_LOADED'; info: QuizInfo }
  | { type: 'ATTEMPT_LOADED'; attemptId: string; questions: QuizAttemptQuestion[] }
  | { type: 'GOTO'; index: number }
  | { type: 'QUESTION_STARTED'; questionId: string; questionStartedAt: string }
  | { type: 'OPTION_SELECTED'; questionId: string; selectedOptionId: string | null }
  | { type: 'RESULT_LOADED'; result: QuizResult }
  | { type: 'RESET' }

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'INFO_LOADED':
      return action.info.totalQuestions === 0
        ? { status: 'empty' }
        : { status: 'start', info: action.info }
    case 'ATTEMPT_LOADED':
      return {
        status: 'in_progress',
        attemptId: action.attemptId,
        questions: action.questions,
        currentIndex: 0,
      }
    case 'GOTO':
      if (state.status !== 'in_progress') return state
      return { ...state, currentIndex: action.index }
    case 'QUESTION_STARTED':
      if (state.status !== 'in_progress') return state
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id === action.questionId ? { ...q, questionStartedAt: action.questionStartedAt } : q,
        ),
      }
    case 'OPTION_SELECTED':
      if (state.status !== 'in_progress') return state
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id === action.questionId ? { ...q, selectedOptionId: action.selectedOptionId } : q,
        ),
      }
    case 'RESULT_LOADED':
      return { status: 'result', result: action.result }
    case 'RESET':
      return { status: 'loading' }
  }
}
