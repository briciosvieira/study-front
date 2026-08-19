import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select } from '@/shared/components/ui/select'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { Role, User } from '@/shared/types/api.types'
import { useCreateUser, useUpdateUser } from './useUsers'

const ROLES: Role[] = ['ADMIN', 'INSTRUCTOR', 'STUDENT']

export function UserForm({
  open,
  onOpenChange,
  user,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User
}) {
  const { t } = useTranslation()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const isEditing = !!user

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('common.tooShort')),
        email: z.email(t('common.invalidEmail')),
        username: z.string().min(3, t('common.tooShort')),
        password: z.string().min(6, t('common.minChars', { count: 6 })).or(z.literal('')),
        role: z.enum(ROLES),
      }),
    [t],
  )
  type FormValues = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      username: user?.username ?? '',
      password: '',
      role: user?.role ?? 'STUDENT',
    },
  })

  async function onSubmit(values: FormValues) {
    if (isEditing) {
      const { password, ...rest } = values
      await updateUser.mutateAsync({
        id: user.id,
        payload: password ? values : rest,
      })
    } else {
      await createUser.mutateAsync(values)
    }
    reset()
    onOpenChange(false)
  }

  const isPending = createUser.isPending || updateUser.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? t('userForm.titleEdit') : t('userForm.titleNew')}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="name">{t('userForm.name')}</Label>
          <Input id="name" aria-invalid={!!errors.name} {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="email">{t('userForm.email')}</Label>
            <Input id="email" type="email" aria-invalid={!!errors.email} {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="username">{t('userForm.username')}</Label>
            <Input id="username" aria-invalid={!!errors.username} {...register('username')} />
            {errors.username && <p className="mt-1 text-xs text-danger">{errors.username.message}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="password">
            {isEditing ? t('userForm.passwordEditHint') : t('userForm.password')}
          </Label>
          <Input
            id="password"
            type="password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>
        <div>
          <Label htmlFor="role">{t('userForm.role')}</Label>
          <Select id="role" {...register('role')}>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {t(`roles.${role}`)}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isEditing ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
