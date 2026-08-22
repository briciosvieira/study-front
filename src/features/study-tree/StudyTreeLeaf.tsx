import { Checkbox } from '@/shared/components/ui/checkbox'
import { cn } from '@/shared/utils/cn'
import type { StudyTreeLeafView } from '@/shared/types/api.types'
import { formatRemaining, getLeafStatus } from './studyTreeStatus'
import { useCheckNode, useUncheckNode } from './useStudyTree'

const STATUS_TEXT_CLASS = {
  inactive: 'text-foreground',
  expired: 'text-foreground',
  active: 'text-success',
  warning: 'text-danger',
} as const

// The only kind of node that gets a checkbox — a group node never renders
// this component (see StudyTreeNode). Color is per-leaf, never propagated to
// the tree around it (spec section 42).
export function StudyTreeLeaf({
  courseId,
  node,
  now,
  depth,
}: {
  courseId: string
  node: StudyTreeLeafView
  now: Date
  depth: number
}) {
  const checkNode = useCheckNode(courseId)
  const uncheckNode = useUncheckNode(courseId)

  const status = getLeafStatus(node.checked, node.expiresAt, now)
  // An expired check still looks unchecked immediately, without waiting for
  // F5 or the backend cleanup job — see spec section 71.
  const isChecked = status === 'active' || status === 'warning'
  const isPending =
    (checkNode.isPending && checkNode.variables === node.id) ||
    (uncheckNode.isPending && uncheckNode.variables === node.id)

  function toggle() {
    if (isChecked) {
      uncheckNode.mutate(node.id)
    } else {
      checkNode.mutate(node.id)
    }
  }

  return (
    <div
      className="flex items-center gap-2 py-1"
      style={{ paddingLeft: `${depth * 16}px` }}
    >
      <Checkbox checked={isChecked} disabled={isPending} onCheckedChange={toggle} />
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className={cn('flex-1 truncate text-left text-sm', STATUS_TEXT_CLASS[status])}
      >
        {node.title}
      </button>
      {isChecked && node.expiresAt && (
        <span className={cn('shrink-0 text-xs tabular-nums', STATUS_TEXT_CLASS[status])}>
          {formatRemaining(node.expiresAt, now)}
        </span>
      )}
    </div>
  )
}
