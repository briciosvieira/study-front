// Recovery for the classic post-deploy problem: a browser tab still running
// an old build tries to lazy-load a route chunk whose hashed filename no
// longer exists on the server (Vite renamed it on the new deploy). The fix
// is a single automatic full reload of the CURRENT url — that picks up the
// fresh index.html and the new chunk hashes. Guarded against looping if the
// reload itself doesn't fix it (e.g. offline, or a genuinely broken deploy).

const RELOAD_MARK_KEY = 'studyja_chunk_reload'
const RELOAD_COOLDOWN_MS = 60_000

const CHUNK_ERROR_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /importing a module script failed/i,
  /error loading dynamically imported module/i,
  /chunkloaderror/i,
]

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false
  const name = error instanceof Error ? error.name : ''
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : String((error as { message?: unknown } | null)?.message ?? '')
  return name === 'ChunkLoadError' || CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message))
}

function canAttemptChunkReload(now = Date.now()): boolean {
  try {
    const raw = sessionStorage.getItem(RELOAD_MARK_KEY)
    if (!raw) return true
    const lastAttempt = Number(raw)
    if (!Number.isFinite(lastAttempt)) return true
    return now - lastAttempt > RELOAD_COOLDOWN_MS
  } catch {
    // sessionStorage unavailable — fail open to a single attempt rather than
    // trapping the user on a dead chunk forever
    return true
  }
}

function markChunkReloadAttempt(now = Date.now()): void {
  try {
    sessionStorage.setItem(RELOAD_MARK_KEY, String(now))
  } catch {
    // best-effort only
  }
}

// Attempts exactly one automatic recovery, preserving the current URL
// (a plain reload of the same document does this for free). Returns true if
// it triggered a reload (nothing else should render after this), false if
// the loop guard tripped — the caller must fall back to a friendly error UI.
export function tryRecoverFromChunkError(): boolean {
  if (!canAttemptChunkReload()) return false
  markChunkReloadAttempt()
  window.location.reload()
  return true
}
