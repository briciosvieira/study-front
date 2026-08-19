import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { coursesApi, type StudentListParams } from './api'

const enrolledKey = (courseId: string, params: StudentListParams) => [
  'courses',
  courseId,
  'students',
  params,
]
const availableKey = (courseId: string, params: StudentListParams) => [
  'courses',
  courseId,
  'available-students',
  params,
]
// used to invalidate every page/search variant of a course's lists at once
const enrolledKeyPrefix = (courseId: string) => ['courses', courseId, 'students']
const availableKeyPrefix = (courseId: string) => ['courses', courseId, 'available-students']
const userCoursesKey = (userId: string) => ['users', userId, 'courses']

export function useEnrolledStudents(courseId: string, params: StudentListParams) {
  return useQuery({
    queryKey: enrolledKey(courseId, params),
    queryFn: () => coursesApi.getStudents(courseId, params),
    enabled: !!courseId,
  })
}

export function useAvailableStudents(courseId: string, params: StudentListParams) {
  return useQuery({
    queryKey: availableKey(courseId, params),
    queryFn: () => coursesApi.getAvailableStudents(courseId, params),
    enabled: !!courseId,
  })
}

function invalidateCourseStudentLists(
  queryClient: ReturnType<typeof useQueryClient>,
  courseId: string,
) {
  queryClient.invalidateQueries({ queryKey: enrolledKeyPrefix(courseId) })
  queryClient.invalidateQueries({ queryKey: availableKeyPrefix(courseId) })
}

export function useAddStudents(courseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (userIds: string[]) => coursesApi.addStudents(courseId, userIds),
    onSuccess: (_, userIds) => {
      invalidateCourseStudentLists(queryClient, courseId)
      userIds.forEach((userId) =>
        queryClient.invalidateQueries({ queryKey: userCoursesKey(userId) }),
      )
      toast.success(t('courseAccess.toastAdded'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('courseAccess.toastAddError'))),
  })
}

export function useRemoveStudent(courseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (userId: string) => coursesApi.removeStudent(courseId, userId),
    onSuccess: (_, userId) => {
      invalidateCourseStudentLists(queryClient, courseId)
      queryClient.invalidateQueries({ queryKey: userCoursesKey(userId) })
      toast.success(t('courseAccess.toastRemoved'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('courseAccess.toastRemoveError'))),
  })
}
