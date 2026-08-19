import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Progress } from '@/shared/components/ui/progress'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { useUploadVideo } from './useVideoItems'

export function VideoUploadForm({
  open,
  onOpenChange,
  moduleId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  moduleId: string
}) {
  const { t } = useTranslation()
  const uploadVideo = useUploadVideo(moduleId)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [orderLabel, setOrderLabel] = useState('1')
  const [progress, setProgress] = useState(0)

  function reset() {
    setFile(null)
    setTitle('')
    setOrderLabel('1')
    setProgress(0)
  }

  async function handleSubmit() {
    if (!file) return
    await uploadVideo.mutateAsync({
      file,
      title: title || file.name,
      orderLabel,
      onProgress: setProgress,
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!uploadVideo.isPending) {
          reset()
          onOpenChange(next)
        }
      }}
      title={t('video.uploadTitle')}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="video-file">{t('video.uploadFile')}</Label>
          <input
            id="video-file"
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:text-primary-foreground"
          />
        </div>
        <div>
          <Label htmlFor="video-title">{t('video.uploadTitleLabel')}</Label>
          <Input
            id="video-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={file?.name}
          />
        </div>
        <div>
          <Label htmlFor="video-order">{t('video.uploadOrder')}</Label>
          <Input id="video-order" value={orderLabel} onChange={(e) => setOrderLabel(e.target.value)} />
        </div>

        {uploadVideo.isPending && <Progress value={progress} />}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={uploadVideo.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!file || uploadVideo.isPending}>
            {t('video.uploadSubmit')}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
