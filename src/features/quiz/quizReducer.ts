import type { QuizQuestionView, QuizResult } from '@/shared/types/api.types'

export type QuizState =
  | { status: 'loading' }
  | { status: 'answering'; question: QuizQuestionView; timeLeft: number }
  | { status: 'submitting'; question: QuizQuestionView }
  | { status: 'finished'; result: QuizResult }
  | { status: 'empty' }

export type QuizAction =
  | { type: 'QUESTION_LOADED'; question: QuizQuestionView }
  | { type: 'TICK' }
  | { type: 'SUBMIT' }
  | { type: 'QUIZ_FINISHED'; result: QuizResult }
  | { type: 'NO_QUESTIONS' }

// No action ever moves state "backwards" to a previous question — the quiz
// engine has no notion of going back, by design.
export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'QUESTION_LOADED':
      return { status: 'answering', question: action.question, timeLeft: action.question.timeLimitSec }
    case 'TICK':
      if (state.status !== 'answering') return state
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) }
    case 'SUBMIT':
      if (state.status !== 'answering') return state
      return { status: 'submitting', question: state.question }
    case 'QUIZ_FINISHED':
      return { status: 'finished', result: action.result }
    case 'NO_QUESTIONS':
      return { status: 'empty' }
  }
}
