import { Upload, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { cn } from '@/shared/utils/cn'
import { getUploadUrl } from '@/shared/utils/uploads'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

export interface CoverSelection {
  file: File | null
  removed: boolean
}

export function CourseCoverUpload({
  currentCoverKey,
  onChange,
  disabled,
  isUploading,
}: {
  currentCoverKey?: string | null
  onChange: (selection: CoverSelection) => void
  disabled?: boolean
  isUploading?: boolean
}) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [removed, setRemoved] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  const localPreview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  // object URLs must be revoked or they leak memory for the life of the tab
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }, [localPreview])

  function pickFile(candidate: File | undefined | null) {
    if (!candidate) return
    if (!ALLOWED_TYPES.includes(candidate.type)) {
      toast.error(t('courseForm.coverInvalidType'))
      return
    }
    if (candidate.size > MAX_SIZE_BYTES) {
      toast.error(t('courseForm.coverTooLarge'))
      return
    }
    setFile(candidate)
    setRemoved(false)
    onChange({ file: candidate, removed: false })
  }

  function handleRemove() {
    setFile(null)
    setRemoved(true)
    onChange({ file: null, removed: true })
    if (inputRef.current) inputRef.current.value = ''
  }

  const remoteUrl = !removed ? getUploadUrl(currentCoverKey) : null
  const previewUrl = localPreview ?? (remoteUrl !== failedUrl ? remoteUrl : null)

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => pickFile(e.target.files?.[0])}
      />

      {previewUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-surface-muted">
          <img
            src={previewUrl}
            alt=""
            onError={() => setFailedUrl(previewUrl)}
            className="h-full w-full object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white">
              {t('courseForm.coverUploading')}
            </div>
          )}
          {!disabled && !isUploading && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 bg-gradient-to-t from-black/70 to-transparent p-2.5">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-md bg-white/95 px-2.5 py-1.5 text-xs font-medium text-neutral-900 hover:bg-white"
              >
                {t('courseForm.coverChange')}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                aria-label={t('courseForm.coverRemove')}
                className="rounded-md bg-white/95 p-1.5 text-neutral-900 hover:bg-white"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            pickFile(e.dataTransfer.files?.[0])
          }}
          className={cn(
            'flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border bg-surface-muted text-muted-foreground transition-colors',
            'hover:border-primary/50 hover:text-foreground disabled:opacity-50',
            isDragging && 'border-primary bg-accent text-foreground',
          )}
        >
          <Upload size={22} />
          <span className="text-sm font-medium">{t('courseForm.coverDropHint')}</span>
          <span className="text-xs">{t('courseForm.coverHint')}</span>
        </button>
      )}
    </div>
  )
}
