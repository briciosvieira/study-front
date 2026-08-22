import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { useDownloadTemplate, useImportTree } from './useStudyTree'

// Multiple validation errors come back from the backend as a plain string
// array (see ApiErrorBody.message) — rendered as a list here instead of
// flattened into one toast line, matching spec section 49's example.
function extractErrorLines(error: unknown, fallback: string): string[] {
  const data = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data
  if (Array.isArray(data?.message)) return data.message
  if (typeof data?.message === 'string') return [data.message]
  return [fallback]
}

export function StudyTreeImportDialog({
  open,
  onOpenChange,
  courseId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
}) {
  const { t } = useTranslation()
  const importTree = useImportTree(courseId)
  const downloadTemplate = useDownloadTemplate()
  const [file, setFile] = useState<File | null>(null)
  const [errorLines, setErrorLines] = useState<string[] | null>(null)
  const [success, setSuccess] = useState<{ nodeCount: number; rootCount: number; leafCount: number } | null>(
    null,
  )

  function reset() {
    setFile(null)
    setErrorLines(null)
    setSuccess(null)
  }

  async function handleSubmit() {
    if (!file) return
    setErrorLines(null)
    try {
      const result = await importTree.mutateAsync(file)
      setSuccess(result)
    } catch (error) {
      setErrorLines(extractErrorLines(error, t('studyTree.toastImportError')))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        reset()
        onOpenChange(next)
      }}
      title={t('studyTree.importDialogTitle')}
      description={t('studyTree.importDialogDescription')}
    >
      {success ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-sm">
            <p className="font-medium text-success">{t('studyTree.importSuccessTitle')}</p>
            <p className="mt-1 text-muted-foreground">
              {t('studyTree.importSuccessSummary', {
                nodes: success.nodeCount,
                roots: success.rootCount,
                leaves: success.leafCount,
              })}
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>{t('common.close')}</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => downloadTemplate.mutate(courseId)}
            disabled={downloadTemplate.isPending}
          >
            {t('studyTree.downloadTemplate')}
          </Button>

          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:text-primary-foreground"
          />

          {errorLines && (
            <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm">
              <p className="font-medium text-danger">{t('studyTree.importErrorTitle')}</p>
              <ul className="mt-2 max-h-48 list-disc space-y-1 overflow-y-auto pl-5 text-foreground">
                {errorLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={!file || importTree.isPending}>
              {t('studyTree.importSubmit')}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
