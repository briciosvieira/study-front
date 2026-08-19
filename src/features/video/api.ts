import axios from 'axios'
import { api } from '@/shared/api/axiosClient'
import type { VideoItem } from '@/shared/types/api.types'

interface PresignResponse {
  uploadUrl: string
  key: string
  publicUrl: string
}

export const videoApi = {
  listForModule: (moduleId: string) =>
    api.get<VideoItem[]>(`/modules/${moduleId}/video`).then((r) => r.data),

  async upload(
    moduleId: string,
    file: File,
    title: string,
    orderLabel: string,
    onProgress?: (percent: number) => void,
  ) {
    const { data: presigned } = await api.post<PresignResponse>(
      `/modules/${moduleId}/video/presign-upload`,
      { fileName: file.name, contentType: file.type || 'video/mp4' },
    )

    await axios.put(presigned.uploadUrl, file, {
      headers: { 'Content-Type': file.type || 'video/mp4' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100))
      },
    })

    return api
      .post<VideoItem>(`/modules/${moduleId}/video`, { title, key: presigned.key, orderLabel })
      .then((r) => r.data)
  },

  remove: (id: string) => api.delete(`/video/${id}`),
  reorder: (id: string, orderLabel: string) =>
    api.patch<VideoItem>(`/video/${id}/reorder`, { orderLabel }).then((r) => r.data),
}
