import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Progress } from '@/shared/components/ui/progress'
import { Textarea } from '@/shared/components/ui/textarea'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { useUploadTemplate } from './useTemplateLibrary'

export function TemplateUploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const uploadTemplate = useUploadTemplate()
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [progress, setProgress] = useState(0)

  function reset() {
    setFile(null)
    setName('')
    setDescription('')
    setProgress(0)
  }

  async function handleSubmit() {
    if (!file) return
    await uploadTemplate.mutateAsync({
      file,
      name: name || file.name,
      description: description || undefined,
      onProgress: setProgress,
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!uploadTemplate.isPending) {
          reset()
          onOpenChange(next)
        }
      }}
      title={t('templateLibrary.addDialogTitle')}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="template-file">{t('templateLibrary.fileLabel')}</Label>
          <input
            id="template-file"
            type="file"
            accept=".xlsx,.xls,.csv,.json,.txt,.pdf,.docx"
            onChange={(e) => {
              const selected = e.target.files?.[0] ?? null
              setFile(selected)
              if (selected && !name) setName(selected.name)
            }}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:text-primary-foreground"
          />
          <p className="mt-1 text-xs text-muted-foreground">{t('templateLibrary.fileHint')}</p>
        </div>
        <div>
          <Label htmlFor="template-name">{t('templateLibrary.nameLabel')}</Label>
          <Input
            id="template-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={file?.name}
          />
        </div>
        <div>
          <Label htmlFor="template-description">{t('templateLibrary.descriptionLabel')}</Label>
          <Textarea
            id="template-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        {uploadTemplate.isPending && <Progress value={progress} />}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={uploadTemplate.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!file || uploadTemplate.isPending}>
            {uploadTemplate.isPending ? t('templateLibrary.uploading') : t('common.create')}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
