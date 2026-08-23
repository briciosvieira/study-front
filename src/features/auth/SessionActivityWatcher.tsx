import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { useLogout } from './useAuth'
import {
  LAST_ACTIVITY_STORAGE_KEY,
  getLastActivity,
  isSessionExpiredByInactivity,
  recordActivity,
} from './sessionActivity'

// Only real user interaction renews the session — background/system signals
// (React Query polling, background refetches, etc.) never touch this list.
const ACTIVITY_EVENTS = ['click', 'pointerdown', 'keydown', 'touchstart', 'scroll'] as const
const ACTIVITY_WRITE_THROTTLE_MS = 60_000 // at most one localStorage write per minute
const EXPIRY_CHECK_INTERVAL_MS = 30_000

// Single global inactivity manager, mounted once (in RootLayout) for the
// whole authenticated app — never per-page/per-component. Logs the user out
// through the existing logout flow once 2 real hours pass with no click,
// keypress, touch, or scroll anywhere in the app, in any tab.
export function SessionActivityWatcher() {
  const { t } = useTranslation()
  const logout = useLogout()
  const loggedOutRef = useRef(false)
  const logoutRef = useRef(logout)
  logoutRef.current = logout

  useEffect(() => {
    loggedOutRef.current = false

    function forceLogoutIfExpired(): boolean {
      if (loggedOutRef.current) return true
      if (!isSessionExpiredByInactivity()) return false
      loggedOutRef.current = true
      toast.message(t('auth.sessionExpired'))
      logoutRef.current.mutate()
      return true
    }

    // Resumed session (reload, or a fresh login just authenticated this
    // tab) with no prior timestamp at all in this browser — check for a
    // stale one first (handles a tab reopened hours later), then seed a
    // fresh baseline only if it's genuinely still valid/new.
    if (!forceLogoutIfExpired() && getLastActivity() === null) {
      recordActivity()
    }

    let lastWriteAt = 0
    function handleActivity() {
      if (loggedOutRef.current) return
      const now = Date.now()
      if (now - lastWriteAt < ACTIVITY_WRITE_THROTTLE_MS) return
      lastWriteAt = now
      recordActivity(now)
    }

    function handleVisibilityOrFocus() {
      if (document.visibilityState === 'hidden') return
      // Returning to a tab must validate expiry BEFORE anything else counts
      // as new activity — merely glancing at the app doesn't renew it.
      forceLogoutIfExpired()
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === LAST_ACTIVITY_STORAGE_KEY) forceLogoutIfExpired()
    }

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, handleActivity, { passive: true })
    }
    document.addEventListener('visibilitychange', handleVisibilityOrFocus)
    window.addEventListener('focus', handleVisibilityOrFocus)
    window.addEventListener('storage', handleStorage)
    const intervalId = window.setInterval(forceLogoutIfExpired, EXPIRY_CHECK_INTERVAL_MS)

    return () => {
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, handleActivity)
      }
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus)
      window.removeEventListener('focus', handleVisibilityOrFocus)
      window.removeEventListener('storage', handleStorage)
      window.clearInterval(intervalId)
    }
  }, [t])

  return null
}
