import { useState, type FormEvent } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { User } from '@/shared/types/api.types'

interface AdminDeleteReauthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  isLoading?: boolean
  onConfirm: (currentPassword: string) => void
}

// Deleting another ADMIN is the most destructive action in the admin area,
// so the backend requires the actor to re-enter their own current password
// (not just a second click) — this is the form that collects it. Every other
// rule (self-delete block, last-admin protection) is enforced server-side;
// this dialog only exists to satisfy the reauthentication requirement.
export function AdminDeleteReauthDialog({
  open,
  onOpenChange,
  user,
  isLoading,
  onConfirm,
}: AdminDeleteReauthDialogProps) {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!password) return
    onConfirm(password)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setPassword('')
        onOpenChange(next)
      }}
      title={t('users.deleteAdminTitle', { name: user?.name ?? '' })}
      description={t('users.deleteAdminDescription')}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="delete-admin-password">{t('users.currentPasswordLabel')}</Label>
          <Input
            id="delete-admin-password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="danger" disabled={isLoading || !password}>
            {t('common.delete')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
