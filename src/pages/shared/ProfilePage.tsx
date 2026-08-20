import { ProfileAvatarSection } from '@/features/profile/ProfileAvatarSection'
import { ProfileInfoForm } from '@/features/profile/ProfileInfoForm'
import { ProfilePasswordForm } from '@/features/profile/ProfilePasswordForm'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

export function ProfilePage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('profile.myProfile')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t('profile.subtitle')}</p>

      <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
        <ProfileAvatarSection />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">{t('profile.personalInfo')}</h2>
        <div className="mt-4">
          <ProfileInfoForm />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">{t('profile.security')}</h2>
        <div className="mt-4">
          <ProfilePasswordForm />
        </div>
      </div>
    </div>
  )
}
