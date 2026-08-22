import { ListTree } from 'lucide-react'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageSpinner } from '@/shared/components/Spinner'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { StudyTreeAdminPanel } from './StudyTreeAdminPanel'
import { StudyTreeNode } from './StudyTreeNode'
import { useSharedNow } from './useSharedNow'
import { useStudyTree } from './useStudyTree'

export function CourseStudyTreeTab({ courseId, canManage }: { courseId: string; canManage: boolean }) {
  const { t } = useTranslation()
  const { data: tree, isLoading } = useStudyTree(courseId)
  const now = useSharedNow()

  if (isLoading) return <PageSpinner />

  return (
    <div>
      {canManage && <StudyTreeAdminPanel courseId={courseId} tree={tree ?? null} />}

      {!tree ? (
        // For an admin/instructor, StudyTreeAdminPanel above already covers
        // the "no tree yet" messaging and the import actions — this generic
        // empty state is only shown to a student, who has no actions to take.
        !canManage && (
          <EmptyState
            title={t('studyTree.studentEmptyTitle')}
            description={t('studyTree.studentEmptyDescription')}
            icon={ListTree}
          />
        )
      ) : (
        <div className="rounded-xl border border-border bg-card p-4">
          {tree.roots.map((root) => (
            <StudyTreeNode key={root.id} courseId={courseId} node={root} now={now} depth={0} />
          ))}
        </div>
      )}
    </div>
  )
}
