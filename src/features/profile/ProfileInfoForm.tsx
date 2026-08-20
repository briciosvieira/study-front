import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '@/features/auth/useAuth'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { useUpdateProfile } from './useProfile'

export function ProfileInfoForm() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const updateProfile = useUpdateProfile()

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('common.tooShort')),
        email: z.email(t('common.invalidEmail')),
        currentPassword: z.string().optional(),
      }),
    [t],
  )
  type FormValues = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { name: user?.name ?? '', email: user?.email ?? '', currentPassword: '' },
  })

  // Tracked separately from RHF's own state (rather than via watch(), which
  // the React Compiler can't safely memoize) purely to decide whether to
  // reveal the currentPassword field as the user types a new email.
  const [liveEmail, setLiveEmail] = useState(user?.email ?? '')
  const emailChanged = !!user && liveEmail.trim().toLowerCase() !== user.email.toLowerCase()

  async function onSubmit(values: FormValues) {
    await updateProfile.mutateAsync({
      name: values.name,
      email: values.email,
      currentPassword: emailChanged ? values.currentPassword : undefined,
    })
  }

  if (!user) return null

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="profile-name">{t('profile.name')}</Label>
        <Input id="profile-name" aria-invalid={!!errors.name} {...register('name')} />
        {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="profile-email">{t('profile.email')}</Label>
        <Input
          id="profile-email"
          type="email"
          aria-invalid={!!errors.email}
          {...register('email', { onChange: (e: ChangeEvent<HTMLInputElement>) => setLiveEmail(e.target.value) })}
        />
        {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
      </div>
      {emailChanged && (
        <div>
          <Label htmlFor="profile-current-password">{t('profile.currentPasswordForEmail')}</Label>
          <Input id="profile-current-password" type="password" {...register('currentPassword')} />
        </div>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={updateProfile.isPending}>
          {t('profile.saveChanges')}
        </Button>
      </div>
    </form>
  )
}
