import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { User } from '@/shared/types/api.types'
import { useResetUserPassword } from './useUsers'

interface FormValues {
  newPassword: string
  confirmPassword: string
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}) {
  const { t } = useTranslation()
  const resetPassword = useResetUserPassword()

  const schema = useMemo(
    () =>
      z
        .object({
          newPassword: z.string().min(6, t('common.minChars', { count: 6 })),
          confirmPassword: z.string().min(1, t('common.required')),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: t('profile.passwordsDontMatch'),
          path: ['confirmPassword'],
        }),
    [t],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  async function onSubmit(values: FormValues) {
    if (!user) return
    await resetPassword.mutateAsync({ id: user.id, newPassword: values.newPassword })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        reset()
        onOpenChange(next)
      }}
      title={t('users.resetPasswordTitle', { name: user?.name ?? '' })}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="reset-new-password">{t('profile.newPassword')}</Label>
          <Input
            id="reset-new-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.newPassword}
            {...register('newPassword')}
          />
          {errors.newPassword && <p className="mt-1 text-xs text-danger">{errors.newPassword.message}</p>}
        </div>
        <div>
          <Label htmlFor="reset-confirm-password">{t('profile.confirmNewPassword')}</Label>
          <Input
            id="reset-confirm-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={resetPassword.isPending}>
            {t('users.resetPasswordSubmit')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
