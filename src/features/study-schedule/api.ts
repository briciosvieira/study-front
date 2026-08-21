import { api } from '@/shared/api/axiosClient'
import type { StudySchedule, StudySession } from '@/shared/types/api.types'

export interface StartStudySessionPayload {
  moduleId: string
  pdfItemId?: string
  videoItemId?: string
}

export const studyScheduleApi = {
  getSchedule: (courseId: string) =>
    api.get<StudySchedule>(`/courses/${courseId}/study-schedule`).then((r) => r.data),

  startSession: (courseId: string, payload: StartStudySessionPayload) =>
    api.post<StudySession>(`/courses/${courseId}/study-sessions`, payload).then((r) => r.data),

  finishSession: (sessionId: string) =>
    api.post<StudySession>(`/study-sessions/${sessionId}/finish`).then((r) => r.data),
}
