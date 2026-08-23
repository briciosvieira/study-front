import { useEffect } from 'react'
import { useNavigate, useRouteError } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { isChunkLoadError, tryRecoverFromChunkError } from './chunkRecovery'

// Replaces React Router's default "Unexpected Application Error! Hey
// developer…" screen for every uncaught error in the route tree. A stale
// deploy chunk gets one automatic, loop-protected reload attempt (preserving
// the current URL for free, since it's a reload of the same document); any
// other error — or a chunk error where the reload already failed once —
// falls straight through to the friendly screen below. Never shown for
// ordinary API errors (400/500/offline/etc.) — those are handled by each
// feature's own toast, not by this route-level boundary.
export function RouteErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (isChunkLoadError(error)) {
      tryRecoverFromChunkError()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold text-foreground">{t('appError.title')}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{t('appError.description')}</p>
      <div className="flex gap-2">
        <Button onClick={() => window.location.reload()}>{t('appError.retry')}</Button>
        <Button variant="secondary" onClick={() => navigate('/', { replace: true })}>
          {t('appError.goHome')}
        </Button>
      </div>
    </div>
  )
}
