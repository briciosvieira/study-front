import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth/authStore'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { profileApi, type ChangePasswordPayload, type UpdateProfilePayload } from './api'

// Every mutation here writes the fresh user straight into the auth store —
// that's what the header/sidebar/menu actually read from, so this is what
// makes the UI update immediately with no refetch or window.location.reload().
export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser)
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.update(payload),
    onSuccess: (user) => {
      setUser(user)
      toast.success(t('profile.toastProfileUpdated'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('profile.toastProfileUpdateError'))),
  })
}

export function useChangePassword() {
  const setUser = useAuthStore((s) => s.setUser)
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => profileApi.changePassword(payload),
    onSuccess: (user) => {
      setUser(user)
      toast.success(t('profile.toastPasswordChanged'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('profile.toastPasswordChangeError'))),
  })
}

export function useUploadAvatar() {
  const setUser = useAuthStore((s) => s.setUser)
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (percent: number) => void }) =>
      profileApi.uploadAvatar(file, onProgress),
    onSuccess: (user) => {
      setUser(user)
      toast.success(t('profile.toastAvatarUpdated'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('profile.toastAvatarUpdateError'))),
  })
}

export function useRemoveAvatar() {
  const setUser = useAuthStore((s) => s.setUser)
  const { t } = useTranslation()
  return useMutation({
    mutationFn: () => profileApi.removeAvatar(),
    onSuccess: (user) => {
      setUser(user)
      toast.success(t('profile.toastAvatarRemoved'))
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('profile.toastAvatarRemoveError'))),
  })
}
