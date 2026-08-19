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
    orderLabel: string,
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

    return api
      .post<PdfItem>(`/modules/${moduleId}/pdf`, { title, key: presigned.key, orderLabel })
      .then((r) => r.data)
  },

  remove: (id: string) => api.delete(`/pdf/${id}`),
  reorder: (id: string, orderLabel: string) =>
    api.patch<PdfItem>(`/pdf/${id}/reorder`, { orderLabel }).then((r) => r.data),
}
