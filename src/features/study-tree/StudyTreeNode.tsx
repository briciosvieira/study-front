import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { cn } from '@/shared/utils/cn'
import type { StudyTreeNodeView } from '@/shared/types/api.types'
import { StudyTreeLeaf } from './StudyTreeLeaf'
import { countActiveLeaves } from './studyTreeStatus'

const INDENT_PX = 16

// Recursive by design — depth is unlimited (spec section 2), so there is no
// per-level component. A node with children renders itself as an
// expand/collapse group; a node with none delegates straight to
// StudyTreeLeaf. Expand/collapse state is local UI state only, never
// persisted (spec section 38).
export function StudyTreeNode({
  courseId,
  node,
  now,
  depth,
}: {
  courseId: string
  node: StudyTreeNodeView
  now: Date
  depth: number
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(true)

  if (node.isLeaf) {
    return <StudyTreeLeaf courseId={courseId} node={node} now={now} depth={depth} />
  }

  const { active, total } = countActiveLeaves(node, now)

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-1.5 py-1 text-left"
        style={{ paddingLeft: `${depth * INDENT_PX}px` }}
      >
        {expanded ? (
          <ChevronDown size={15} className="shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight size={15} className="shrink-0 text-muted-foreground" />
        )}
        <span
          className={cn(
            'truncate text-sm text-foreground',
            depth === 0 ? 'font-semibold' : 'font-medium',
          )}
        >
          {node.title}
        </span>
        {depth === 0 && total > 0 && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {t('studyTree.activeSummary', { active, total })}
          </span>
        )}
      </button>

      {expanded && (
        <div>
          {node.children.map((child) => (
            <StudyTreeNode key={child.id} courseId={courseId} node={child} now={now} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
