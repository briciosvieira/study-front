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

    // orderLabel is omitted — the backend appends it automatically after the
    // last existing item; changing the order afterward is a separate action
    return api
      .post<VideoItem>(`/modules/${moduleId}/video`, { title, key: presigned.key })
      .then((r) => r.data)
  },

  remove: (id: string) => api.delete(`/video/${id}`),
  reorder: (id: string, orderLabel: string) =>
    api.patch<VideoItem>(`/video/${id}/reorder`, { orderLabel }).then((r) => r.data),

  async update(
    id: string,
    payload: {
      title?: string
      description?: string
      file?: File
      onProgress?: (percent: number) => void
    },
  ) {
    let fileKey: string | undefined
    if (payload.file) {
      const { data: presigned } = await api.post<PresignResponse>(`/video/${id}/presign-replace`, {
        fileName: payload.file.name,
        contentType: payload.file.type || 'video/mp4',
      })
      await axios.put(presigned.uploadUrl, payload.file, {
        headers: { 'Content-Type': payload.file.type || 'video/mp4' },
        onUploadProgress: (evt) => {
          if (payload.onProgress && evt.total)
            payload.onProgress(Math.round((evt.loaded / evt.total) * 100))
        },
      })
      fileKey = presigned.key
    }

    return api
      .patch<VideoItem>(`/video/${id}`, { title: payload.title, description: payload.description, fileKey })
      .then((r) => r.data)
  },

  getDownloadUrl: (id: string) =>
    api.get<{ downloadUrl: string }>(`/video/${id}/download`).then((r) => r.data.downloadUrl),
}
