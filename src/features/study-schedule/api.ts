import { api } from '@/shared/api/axiosClient'
import type { StudySchedule, StudySession } from '@/shared/types/api.types'

export const studyScheduleApi = {
  getSchedule: (courseId: string) =>
    api.get<StudySchedule>(`/courses/${courseId}/study-schedule`).then((r) => r.data),

  startSession: (courseId: string, moduleId: string) =>
    api.post<StudySession>(`/courses/${courseId}/study-sessions`, { moduleId }).then((r) => r.data),

  finishSession: (sessionId: string) =>
    api.post<StudySession>(`/study-sessions/${sessionId}/finish`).then((r) => r.data),
}
