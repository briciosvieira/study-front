import { Camera, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/useAuth'
import { UserAvatar } from '@/shared/components/UserMenu'
import { Button } from '@/shared/components/ui/button'
import { Progress } from '@/shared/components/ui/progress'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { useRemoveAvatar, useUploadAvatar } from './useProfile'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

export function ProfileAvatarSection() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadAvatar = useUploadAvatar()
  const removeAvatar = useRemoveAvatar()
  const [progress, setProgress] = useState(0)

  if (!user) return null

  function handleFile(file: File | undefined | null) {
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t('profile.avatarInvalidType'))
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(t('profile.avatarTooLarge'))
      return
    }
    setProgress(0)
    uploadAvatar.mutate({ file, onProgress: setProgress })
  }

  const isBusy = uploadAvatar.isPending || removeAvatar.isPending

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="h-20 w-20 text-2xl" />
      <div className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:items-start">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isBusy}
            onClick={() => inputRef.current?.click()}
          >
            <Camera size={14} />
            {t('profile.changePhoto')}
          </Button>
          {user.avatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={() => removeAvatar.mutate()}
            >
              <Trash2 size={14} className="text-danger" />
              {t('profile.removePhoto')}
            </Button>
          )}
        </div>
        {uploadAvatar.isPending && <Progress value={progress} className="w-full max-w-40" />}
        <p className="text-center text-xs text-muted-foreground sm:text-left">{t('profile.avatarHint')}</p>
      </div>
    </div>
  )
}
