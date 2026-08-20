import axios from 'axios'
import { api } from '@/shared/api/axiosClient'
import type { PaginatedResult, TemplateLibraryFile } from '@/shared/types/api.types'

interface PresignResponse {
  uploadUrl: string
  key: string
  publicUrl: string
}

export interface ListTemplatesParams {
  search?: string
  page?: number
  limit?: number
}

export interface UpdateTemplatePayload {
  name?: string
  description?: string
}

export const templateLibraryApi = {
  list: (params: ListTemplatesParams) =>
    api
      .get<PaginatedResult<TemplateLibraryFile>>('/template-library', { params })
      .then((r) => r.data),

  async upload(
    file: File,
    name: string,
    description: string | undefined,
    onProgress?: (percent: number) => void,
  ) {
    const { data: presigned } = await api.post<PresignResponse>('/template-library/presign-upload', {
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
    })

    await axios.put(presigned.uploadUrl, file, {
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100))
      },
    })

    return api
      .post<TemplateLibraryFile>('/template-library', {
        name,
        description: description || undefined,
        key: presigned.key,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size,
      })
      .then((r) => r.data)
  },

  update: (id: string, payload: UpdateTemplatePayload) =>
    api.patch<TemplateLibraryFile>(`/template-library/${id}`, payload).then((r) => r.data),

  remove: (id: string) => api.delete(`/template-library/${id}`),

  getDownloadUrl: (id: string) =>
    api.get<{ downloadUrl: string }>(`/template-library/${id}/download`).then((r) => r.data.downloadUrl),
}
