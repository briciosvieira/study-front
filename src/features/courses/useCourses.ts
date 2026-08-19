import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import {
  coursesApi,
  type CreateCoursePayload,
  type UpdateCoursePayload,
} from './api'

const COURSES_KEY = ['courses']
const MY_COURSES_KEY = ['courses', 'mine']
const courseKey = (id: string) => ['courses', id]

export function useCourses() {
  return useQuery({ queryKey: COURSES_KEY, queryFn: coursesApi.list })
}

export function useMyCourses() {
  return useQuery({ queryKey: MY_COURSES_KEY, queryFn: coursesApi.listMine })
}

export function useCourse(id: string) {
  return useQuery({ queryKey: courseKey(id), queryFn: () => coursesApi.get(id), enabled: !!id })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => coursesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY })
      toast.success(t('courses.toastCreated'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('courses.toastCreateError'))),
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCoursePayload }) =>
      coursesApi.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY })
      queryClient.invalidateQueries({ queryKey: courseKey(id) })
      toast.success(t('courses.toastUpdated'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('courses.toastUpdateError'))),
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => coursesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY })
      toast.success(t('courses.toastDeleted'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('courses.toastDeleteError'))),
  })
}

export function useUploadCourseCover() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({
      courseId,
      file,
      onProgress,
    }: {
      courseId: string
      file: File
      onProgress?: (percent: number) => void
    }) => coursesApi.uploadCover(courseId, file, onProgress),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY })
      queryClient.invalidateQueries({ queryKey: courseKey(courseId) })
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('courseForm.coverUploadError'))),
  })
}

export function useRemoveCourseCover() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (courseId: string) => coursesApi.removeCover(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY })
      queryClient.invalidateQueries({ queryKey: courseKey(courseId) })
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('courseForm.coverRemoveError'))),
  })
}

export function useSetCourseVisibility(courseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (studentIds: string[]) => coursesApi.setVisibility(courseId, studentIds),
    onSuccess: () => {
      toast.success(t('visibility.toastUpdated'))
      queryClient.invalidateQueries({ queryKey: courseKey(courseId) })
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('visibility.toastError'))),
  })
}
