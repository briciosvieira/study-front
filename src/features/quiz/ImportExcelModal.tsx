import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { quizImportApi } from './api'

export function ImportExcelModal({
  open,
  onOpenChange,
  moduleId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  moduleId: string
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const statusQuery = useQuery({
    queryKey: ['import-status', jobId],
    queryFn: () => quizImportApi.status(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => (query.state.data?.status === 'processing' ? 2000 : false),
  })

  const status = statusQuery.data
  if (status?.status === 'completed') {
    queryClient.invalidateQueries({ queryKey: ['questions', moduleId] })
  }

  // Diagnostic only — never logs the file contents, Authorization header, or
  // any token. Lets the full backend reason/stage show up in DevTools
  // instead of only the friendly toast/modal message.
  useEffect(() => {
    if (status?.status === 'error') {
      console.error('[QUIZ IMPORT] job failed:', { reason: status.reason })
    }
  }, [status?.status, status?.reason])

  async function handleSubmit() {
    if (!file) return
    setIsSubmitting(true)
    try {
      const { jobId } = await quizImportApi.import(moduleId, file)
      setJobId(jobId)
    } catch (error) {
      console.error('[QUIZ IMPORT] erro completo:', error)
      if (axios.isAxiosError(error)) {
        console.error('[QUIZ IMPORT] response:', {
          status: error.response?.status,
          data: error.response?.data,
        })
      }
      toast.error(apiErrorMessage(error, t('common.somethingWentWrong')))
    } finally {
      setIsSubmitting(false)
    }
  }

  function reset() {
    setFile(null)
    setJobId(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        reset()
        onOpenChange(next)
      }}
      title={t('importExcel.title')}
      description={t('importExcel.description')}
    >
      {!jobId ? (
        <div className="space-y-4">
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:text-primary-foreground"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={!file || isSubmitting}>
              {t('importExcel.submit')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {status?.status !== 'completed' && status?.status !== 'error' && (
            <p className="text-sm text-muted-foreground">{t('importExcel.processing')}</p>
          )}

          {status?.status === 'completed' && (
            <div className="space-y-1 text-sm">
              <p className="font-medium text-foreground">
                {t('importExcel.rowsImported', {
                  imported: status.imported ?? 0,
                  total: status.totalLines ?? 0,
                })}
              </p>
              {!!status.withError && (
                <div>
                  <p className="text-danger">{t('importExcel.rowsWithErrors', { count: status.withError })}</p>
                  <ul className="mt-1 max-h-40 list-disc space-y-0.5 overflow-y-auto pl-5 text-muted-foreground">
                    {status.errors?.map((e) => (
                      <li key={e.line}>{t('importExcel.lineLabel', { line: e.line, reason: e.reason })}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {status?.status === 'error' && (
            <p className="text-sm text-danger">
              {t('importExcel.failed', { reason: status.reason ?? '' })}
            </p>
          )}

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>{t('common.close')}</Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
