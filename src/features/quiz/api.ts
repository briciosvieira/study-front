import { api } from '@/shared/api/axiosClient'
import type {
  ImportStatusResponse,
  Question,
  QuestionOption,
  QuizResult,
  QuizStartResponse,
} from '@/shared/types/api.types'

export interface QuestionOptionPayload {
  letter: string
  text: string
  correct: boolean
}

export interface CreateQuestionPayload {
  statement: string
  timeLimitSec?: number
  order?: number
  options: QuestionOptionPayload[]
}
export type UpdateQuestionPayload = Partial<CreateQuestionPayload>

export const questionsApi = {
  listForModule: (moduleId: string) =>
    api.get<Question[]>(`/modules/${moduleId}/questions`).then((r) => r.data),
  create: (moduleId: string, payload: CreateQuestionPayload) =>
    api.post<Question>(`/modules/${moduleId}/questions`, payload).then((r) => r.data),
  update: (id: string, payload: UpdateQuestionPayload) =>
    api.patch<Question>(`/questions/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/questions/${id}`),
}

export const quizImportApi = {
  import: (moduleId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post<{ jobId: string }>(`/modules/${moduleId}/questions/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
  status: (jobId: string) =>
    api.get<ImportStatusResponse>(`/questions/import/${jobId}/status`).then((r) => r.data),
}

export const attemptsApi = {
  start: (moduleId: string) =>
    api.post<QuizStartResponse>(`/modules/${moduleId}/quiz/start`).then((r) => r.data),
  answer: (attemptId: string, questionId: string, chosenOption: string | null) =>
    api
      .post<QuizStartResponse>(`/attempts/${attemptId}/answer`, { questionId, chosenOption })
      .then((r) => r.data),
  finish: (attemptId: string) =>
    api.post<QuizResult>(`/attempts/${attemptId}/finish`).then((r) => r.data),
  retry: (moduleId: string) =>
    api.post<QuizStartResponse>(`/modules/${moduleId}/quiz/retry`).then((r) => r.data),
}

export type { Question, QuestionOption }
