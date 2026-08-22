import { useEffect, useState } from 'react'

const TICK_MS = 60_000

// One shared clock for the whole tree — called once at the container, then
// passed down as a prop through the recursive StudyTreeNode tree. A tree can
// have hundreds of leaves; one setInterval here instead of one per leaf is
// the whole point (see spec section 12).
export function useSharedNow(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  return now
}
