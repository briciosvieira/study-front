import { useEffect, useState } from 'react'

// Source of truth is the persisted `questionStartedAt` timestamp, not the
// interval — the interval only forces a re-render every second so the
// countdown ticks visually. Reconstructs correctly across reload/remount,
// and keeps counting into negative numbers (overtime) past the limit.
export function useQuestionTimer(questionStartedAt: string | null, timeLimitSec: number) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!questionStartedAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [questionStartedAt])

  if (!questionStartedAt) return timeLimitSec

  const elapsedSec = Math.floor((now - new Date(questionStartedAt).getTime()) / 1000)
  return timeLimitSec - elapsedSec
}
