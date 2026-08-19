import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Progress } from '@/shared/components/ui/progress'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { useUploadPdf } from './usePdfItems'

export function PdfUploadForm({
  open,
  onOpenChange,
  moduleId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  moduleId: string
}) {
  const { t } = useTranslation()
  const uploadPdf = useUploadPdf(moduleId)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [progress, setProgress] = useState(0)

  function reset() {
    setFile(null)
    setTitle('')
    setProgress(0)
  }

  async function handleSubmit() {
    if (!file) return
    await uploadPdf.mutateAsync({
      file,
      title: title || file.name,
      onProgress: setProgress,
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!uploadPdf.isPending) {
          reset()
          onOpenChange(next)
        }
      }}
      title={t('pdf.uploadTitle')}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="pdf-file">{t('pdf.uploadFile')}</Label>
          <input
            id="pdf-file"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:text-primary-foreground"
          />
        </div>
        <div>
          <Label htmlFor="pdf-title">{t('pdf.uploadTitleLabel')}</Label>
          <Input
            id="pdf-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={file?.name}
          />
        </div>
        {uploadPdf.isPending && <Progress value={progress} />}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={uploadPdf.isPending}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!file || uploadPdf.isPending}>
            {t('pdf.uploadSubmit')}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
