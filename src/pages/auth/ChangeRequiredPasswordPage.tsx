import { LogOut } from 'lucide-react'
import { useLogout } from '@/features/auth/useAuth'
import { ProfilePasswordForm } from '@/features/profile/ProfilePasswordForm'
import { AppBrand } from '@/shared/components/AppBrand'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

// Reachable only while user.mustChangePassword is true (see RequireAuth) —
// no sidebar/navbar here on purpose: the only things allowed until the
// password is changed are this form and logout.
export function ChangeRequiredPasswordPage() {
  const { t } = useTranslation()
  const logout = useLogout()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl">
        <AppBrand />
        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
          {t('profile.mustChangeTitle')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('profile.mustChangeDescription')}</p>

        <div className="mt-6">
          <ProfilePasswordForm />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-4 w-full"
          onClick={() => logout.mutate()}
        >
          <LogOut size={14} />
          {t('nav.logout')}
        </Button>
      </div>
    </div>
  )
}
