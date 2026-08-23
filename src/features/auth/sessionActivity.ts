// Single source of truth for the "logout after 2h of real inactivity" rule.
// lastActivity lives in localStorage (not sessionStorage) specifically so
// it's shared across every tab — one active tab keeps the session alive for
// all of them. Only SessionActivityWatcher and useLogout touch this module.

export const SESSION_INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000 // 2 hours

export const LAST_ACTIVITY_STORAGE_KEY = 'studyja_last_activity'

export function recordActivity(now: number = Date.now()): void {
  try {
    localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(now))
  } catch {
    // best-effort only — an inactivity feature must never crash the app
  }
}

export function getLastActivity(): number | null {
  try {
    const raw = localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY)
    if (!raw) return null
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function clearLastActivity(): void {
  try {
    localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY)
  } catch {
    // best-effort only
  }
}

// No recorded activity at all (e.g. this tab never saw the initial seed
// yet) is treated as NOT expired — the caller is expected to seed a fresh
// timestamp immediately after, never used to justify a logout on its own.
export function isSessionExpiredByInactivity(now: number = Date.now()): boolean {
  const last = getLastActivity()
  if (last === null) return false
  return now - last >= SESSION_INACTIVITY_TIMEOUT_MS
}
