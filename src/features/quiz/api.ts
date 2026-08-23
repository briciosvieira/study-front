import { api } from '@/shared/api/axiosClient'
import type {
  ImportStatusResponse,
  Question,
  QuestionOption,
  QuizAttemptQuestion,
  QuizAttemptState,
  QuizInfo,
  QuizResult,
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

export const quizExportApi = {
  download: (moduleId: string) =>
    api
      .get(`/modules/${moduleId}/questions/export`, { responseType: 'blob' })
      .then((r) => r.data as Blob),
}

export const attemptsApi = {
  info: (moduleId: string) =>
    api.get<QuizInfo>(`/modules/${moduleId}/quiz/info`).then((r) => r.data),
  start: (moduleId: string) =>
    api.post<QuizAttemptState>(`/modules/${moduleId}/quiz/start`).then((r) => r.data),
  retry: (moduleId: string) =>
    api.post<QuizAttemptState>(`/modules/${moduleId}/quiz/retry`).then((r) => r.data),
  submitAnswer: (attemptId: string, questionId: string, selectedOptionId: string | null) =>
    api
      .put<QuizAttemptQuestion>(`/attempts/${attemptId}/questions/${questionId}/answer`, {
        selectedOptionId,
      })
      .then((r) => r.data),
  finish: (attemptId: string) =>
    api.post<QuizResult>(`/attempts/${attemptId}/finish`).then((r) => r.data),
  result: (attemptId: string) =>
    api.get<QuizResult>(`/attempts/${attemptId}/result`).then((r) => r.data),
}

export type { Question, QuestionOption }
