import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { useChangePassword } from './useProfile'

// Reused as-is by the forced "set a new password" screen — the backend
// endpoint this calls clears mustChangePassword on any successful change, so
// there's no separate flow needed for that case.
export function ProfilePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const { t } = useTranslation()
  const changePassword = useChangePassword()

  const schema = useMemo(
    () =>
      z
        .object({
          currentPassword: z.string().min(1, t('common.required')),
          newPassword: z.string().min(6, t('common.minChars', { count: 6 })),
          confirmPassword: z.string().min(1, t('common.required')),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: t('profile.passwordsDontMatch'),
          path: ['confirmPassword'],
        }),
    [t],
  )
  type FormValues = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  async function onSubmit(values: FormValues) {
    await changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
    reset()
    onSuccess?.()
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="current-password">{t('profile.currentPassword')}</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.currentPassword}
          {...register('currentPassword')}
        />
        {errors.currentPassword && (
          <p className="mt-1 text-xs text-danger">{errors.currentPassword.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="new-password">{t('profile.newPassword')}</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.newPassword}
          {...register('newPassword')}
        />
        {errors.newPassword && <p className="mt-1 text-xs text-danger">{errors.newPassword.message}</p>}
      </div>
      <div>
        <Label htmlFor="confirm-password">{t('profile.confirmNewPassword')}</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-danger">{errors.confirmPassword.message}</p>
        )}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={changePassword.isPending}>
          {t('profile.changePassword')}
        </Button>
      </div>
    </form>
  )
}
