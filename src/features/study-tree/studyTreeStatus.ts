import type { StudyTreeNodeView } from '@/shared/types/api.types'

export type LeafStatus = 'inactive' | 'active' | 'warning' | 'expired'

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000

// Pure — takes the shared clock (see useSharedNow) instead of reading
// Date.now() itself, so a leaf re-renders only when its parent does and
// never needs its own timer.
export function getLeafStatus(checked: boolean, expiresAt: string | null, now: Date): LeafStatus {
  if (!checked || !expiresAt) return 'inactive'
  const remainingMs = new Date(expiresAt).getTime() - now.getTime()
  if (remainingMs <= 0) return 'expired'
  if (remainingMs <= DAY_MS) return 'warning'
  return 'active'
}

// "4d 18h" — no seconds, matches spec section 7.
export function formatRemaining(expiresAt: string, now: Date): string {
  const remainingMs = Math.max(0, new Date(expiresAt).getTime() - now.getTime())
  const totalHours = Math.floor(remainingMs / HOUR_MS)
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  return `${days}d ${hours}h`
}

// "7 de 24 ativos" for a group node — computed here, never stored (see spec
// section 43). Re-derives "active" from the shared clock rather than trusting
// the server's `checked` alone, so it updates in lockstep with the
// individual leaves as they expire on-screen (section 71).
export function countActiveLeaves(node: StudyTreeNodeView, now: Date): { active: number; total: number } {
  if (node.isLeaf) {
    const status = getLeafStatus(node.checked, node.expiresAt, now)
    return { active: status === 'active' || status === 'warning' ? 1 : 0, total: 1 }
  }
  return node.children.reduce(
    (acc, child) => {
      const c = countActiveLeaves(child, now)
      return { active: acc.active + c.active, total: acc.total + c.total }
    },
    { active: 0, total: 0 },
  )
}
