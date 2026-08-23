import axios from 'axios'
import { api } from '@/shared/api/axiosClient'
import type { PdfItem } from '@/shared/types/api.types'

interface PresignResponse {
  uploadUrl: string
  key: string
  publicUrl: string
}

export const pdfApi = {
  listForModule: (moduleId: string) =>
    api.get<PdfItem[]>(`/modules/${moduleId}/pdf`).then((r) => r.data),

  async upload(
    moduleId: string,
    file: File,
    title: string,
    onProgress?: (percent: number) => void,
  ) {
    const { data: presigned } = await api.post<PresignResponse>(
      `/modules/${moduleId}/pdf/presign-upload`,
      { fileName: file.name, contentType: file.type || 'application/pdf' },
    )

    await axios.put(presigned.uploadUrl, file, {
      headers: { 'Content-Type': file.type || 'application/pdf' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100))
      },
    })

    // orderLabel is omitted — the backend appends it automatically after the
    // last existing item; changing the order afterward is a separate action
    return api
      .post<PdfItem>(`/modules/${moduleId}/pdf`, { title, key: presigned.key })
      .then((r) => r.data)
  },

  remove: (id: string) => api.delete(`/pdf/${id}`),
  reorder: (id: string, orderLabel: string) =>
    api.patch<PdfItem>(`/pdf/${id}/reorder`, { orderLabel }).then((r) => r.data),

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
      const { data: presigned } = await api.post<PresignResponse>(`/pdf/${id}/presign-replace`, {
        fileName: payload.file.name,
        contentType: payload.file.type || 'application/pdf',
      })
      await axios.put(presigned.uploadUrl, payload.file, {
        headers: { 'Content-Type': payload.file.type || 'application/pdf' },
        onUploadProgress: (evt) => {
          if (payload.onProgress && evt.total)
            payload.onProgress(Math.round((evt.loaded / evt.total) * 100))
        },
      })
      fileKey = presigned.key
    }

    return api
      .patch<PdfItem>(`/pdf/${id}`, { title: payload.title, description: payload.description, fileKey })
      .then((r) => r.data)
  },

  getDownloadUrl: (id: string) =>
    api.get<{ downloadUrl: string }>(`/pdf/${id}/download`).then((r) => r.data.downloadUrl),
}
