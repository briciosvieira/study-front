import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { studyScheduleApi } from './api'

const scheduleKey = (courseId: string) => ['study-schedule', courseId]

export function useStudySchedule(courseId: string) {
  return useQuery({
    queryKey: scheduleKey(courseId),
    queryFn: () => studyScheduleApi.getSchedule(courseId),
    enabled: !!courseId,
  })
}

export function useStartStudySession(courseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (moduleId: string) => studyScheduleApi.startSession(courseId, moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKey(courseId) })
      toast.success(t('studySchedule.toastStarted'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('studySchedule.toastStartError'))),
  })
}

export function useFinishStudySession(courseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (sessionId: string) => studyScheduleApi.finishSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKey(courseId) })
      toast.success(t('studySchedule.toastFinished'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('studySchedule.toastFinishError'))),
  })
}
