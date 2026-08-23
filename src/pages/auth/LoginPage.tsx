import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { useLogin } from '@/features/auth/useAuth'
import { apiErrorMessage } from '@/shared/api/axiosClient'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

export function LoginPage() {
  const { t } = useTranslation()
  const loginMutation = useLogin()
  const [searchParams, setSearchParams] = useSearchParams()

  // The inactivity logout does a full browser navigation to
  // /login?reason=inactive (no React state survives that reload), so the
  // "why am I here" message is carried in the URL instead. Shown once, then
  // the param is stripped so it doesn't reappear on a later re-render/back
  // navigation to this same page.
  useEffect(() => {
    if (searchParams.get('reason') !== 'inactive') return
    toast.message(t('auth.sessionExpired'))
    setSearchParams(
      (params) => {
        params.delete('reason')
        return params
      },
      { replace: true },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const schema = useMemo(
    () =>
      z.object({
        login: z.string().min(1, t('common.required')),
        password: z.string().min(1, t('common.required')),
      }),
    [t],
  )
  type FormValues = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('auth.signIn')}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{t('auth.subtitle')}</p>

      <form
        className="mt-8 space-y-4"
        onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
      >
        <div>
          <Label htmlFor="login">{t('auth.emailOrUsername')}</Label>
          <Input
            id="login"
            autoComplete="username"
            aria-invalid={!!errors.login}
            {...register('login')}
          />
          {errors.login && <p className="mt-1 text-xs text-danger">{errors.login.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>

        {loginMutation.isError && (
          <p className="text-sm text-danger">
            {axios.isAxiosError(loginMutation.error) && loginMutation.error.response?.status === 403
              ? t('auth.accountDeactivated')
              : apiErrorMessage(loginMutation.error, t('auth.invalidCredentials'))}
          </p>
        )}

        <Button type="submit" size="md" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? t('auth.signingIn') : t('auth.signIn')}
        </Button>
      </form>
    </div>
  )
}
