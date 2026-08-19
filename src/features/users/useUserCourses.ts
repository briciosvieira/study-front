import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { usersApi } from './api'

const userKey = (id: string) => ['users', id]
const userCoursesKey = (id: string) => ['users', id, 'courses']
const userAvailableCoursesKey = (id: string, search: string) => [
  'users',
  id,
  'available-courses',
  search,
]
const courseStudentsKeyPrefix = (courseId: string) => ['courses', courseId, 'students']
const courseAvailableStudentsKeyPrefix = (courseId: string) => [
  'courses',
  courseId,
  'available-students',
]

export function useUser(id: string) {
  return useQuery({ queryKey: userKey(id), queryFn: () => usersApi.get(id), enabled: !!id })
}

export function useUserCourses(id: string) {
  return useQuery({
    queryKey: userCoursesKey(id),
    queryFn: () => usersApi.getCourses(id),
    enabled: !!id,
  })
}

export function useAvailableCoursesForUser(id: string, search: string) {
  return useQuery({
    queryKey: userAvailableCoursesKey(id, search),
    queryFn: () => usersApi.getAvailableCourses(id, search),
    enabled: !!id,
  })
}

function invalidateUserCourseLists(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  queryClient.invalidateQueries({ queryKey: userCoursesKey(id) })
  queryClient.invalidateQueries({ queryKey: ['users', id, 'available-courses'] })
}

export function useAddCoursesToUser(userId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (courseIds: string[]) => usersApi.addCourses(userId, courseIds),
    onSuccess: (_, courseIds) => {
      invalidateUserCourseLists(queryClient, userId)
      courseIds.forEach((courseId) => {
        queryClient.invalidateQueries({ queryKey: courseStudentsKeyPrefix(courseId) })
        queryClient.invalidateQueries({ queryKey: courseAvailableStudentsKeyPrefix(courseId) })
      })
      toast.success(t('courseAccess.toastAdded'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('courseAccess.toastAddError'))),
  })
}

export function useRemoveCourseFromUser(userId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (courseId: string) => usersApi.removeCourse(userId, courseId),
    onSuccess: (_, courseId) => {
      invalidateUserCourseLists(queryClient, userId)
      queryClient.invalidateQueries({ queryKey: courseStudentsKeyPrefix(courseId) })
      queryClient.invalidateQueries({ queryKey: courseAvailableStudentsKeyPrefix(courseId) })
      toast.success(t('courseAccess.toastRemoved'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('courseAccess.toastRemoveError'))),
  })
}
