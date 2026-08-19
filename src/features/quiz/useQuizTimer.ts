import { useEffect, useRef } from 'react'

export function useQuizTimer(active: boolean, timeLeft: number, onTick: () => void, onExpire: () => void) {
  const onTickRef = useRef(onTick)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onTickRef.current = onTick
    onExpireRef.current = onExpire
  })

  useEffect(() => {
    if (!active) return
    if (timeLeft <= 0) {
      onExpireRef.current()
      return
    }
    const id = setTimeout(() => onTickRef.current(), 1000)
    return () => clearTimeout(id)
  }, [active, timeLeft])
}
