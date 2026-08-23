import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Progress } from '@/shared/components/ui/progress'
import { Textarea } from '@/shared/components/ui/textarea'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { PdfItem } from '@/shared/types/api.types'
import { useDownloadPdf, useUpdatePdf } from './usePdfItems'

// Mounted with key={item.id} by the caller only while open, so every open
// starts from this exact item's current values — no reset effects needed.
export function PdfEditDialog({
  open,
  onOpenChange,
  moduleId,
  item,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  moduleId: string
  item: PdfItem
}) {
  const { t } = useTranslation()
  const updatePdf = useUpdatePdf(moduleId)
  const downloadPdf = useDownloadPdf()
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)

  const isBusy = updatePdf.isPending

  async function handleSubmit() {
    // stays open until the backend actually confirms success — no optimistic
    // "updated!" before the upload + DB update both really finish
    await updatePdf.mutateAsync({
      id: item.id,
      title,
      description,
      file: file ?? undefined,
      onProgress: setProgress,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isBusy) onOpenChange(next)
      }}
      title={t('pdf.editTitle')}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="pdf-edit-title">{t('pdf.uploadTitleLabel')}</Label>
          <Input id="pdf-edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="pdf-edit-description">{t('pdf.descriptionLabel')}</Label>
          <Textarea
            id="pdf-edit-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <Label>{t('pdf.currentFile')}</Label>
          <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted-foreground">
            <span className="truncate">{item.fileName}</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => downloadPdf.mutate(item.id)}
              disabled={downloadPdf.isPending}
            >
              {t('pdf.downloadCurrent')}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="pdf-edit-file">{t('pdf.replaceFile')}</Label>
          <input
            id="pdf-edit-file"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:text-primary-foreground"
          />
        </div>
        {isBusy && file && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t('pdf.uploadingNewFile')}</p>
            <Progress value={progress} />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isBusy}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || isBusy}>
            {t('pdf.saveChanges')}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
