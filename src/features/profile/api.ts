import axios from 'axios'
import { api } from '@/shared/api/axiosClient'
import type { User } from '@/shared/types/api.types'

export interface UpdateProfilePayload {
  name?: string
  email?: string
  currentPassword?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

interface PresignResponse {
  uploadUrl: string
  key: string
  publicUrl: string
}

export const profileApi = {
  update: (payload: UpdateProfilePayload) =>
    api.patch<User>('/users/me', payload).then((r) => r.data),

  changePassword: (payload: ChangePasswordPayload) =>
    api.patch<User>('/users/me/password', payload).then((r) => r.data),

  async uploadAvatar(file: File, onProgress?: (percent: number) => void) {
    const { data: presigned } = await api.post<PresignResponse>('/users/me/avatar/presign', {
      contentType: file.type,
    })

    await axios.put(presigned.uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100))
      },
    })

    return api
      .post<User>('/users/me/avatar/confirm', { key: presigned.key, fileSize: file.size })
      .then((r) => r.data)
  },

  removeAvatar: () => api.delete<User>('/users/me/avatar').then((r) => r.data),
}
