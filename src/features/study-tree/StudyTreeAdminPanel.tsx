import { Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { formatDate } from '@/shared/utils/formatDate'
import type { StudyTreeData } from '@/shared/types/api.types'
import { StudyTreeDeleteDialog } from './StudyTreeDeleteDialog'
import { StudyTreeImportDialog } from './StudyTreeImportDialog'
import { useDownloadTemplate } from './useStudyTree'

// Only ever rendered when the viewer can manage the tree (ADMIN — see spec
// section 26) — import/delete are structural, backend-enforced via @Roles
// regardless of what this hides.
export function StudyTreeAdminPanel({ courseId, tree }: { courseId: string; tree: StudyTreeData | null }) {
  const { t, language } = useTranslation()
  const downloadTemplate = useDownloadTemplate()
  const [importOpen, setImportOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">{t('studyTree.title')}</h2>

      {tree ? (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('studyTree.nodeCountLabel', { count: tree.nodeCount })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('studyTree.importedOn', { date: formatDate(tree.createdAt, language) })}
            {tree.createdBy && ` · ${t('studyTree.importedBy', { name: tree.createdBy.name })}`}
          </p>
          <div className="mt-4">
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={14} />
              {t('studyTree.deleteTree')}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted-foreground">{t('studyTree.adminEmptyDescription')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setImportOpen(true)}>
              <Upload size={14} />
              {t('studyTree.importExcel')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => downloadTemplate.mutate(courseId)}
              disabled={downloadTemplate.isPending}
            >
              {t('studyTree.downloadTemplate')}
            </Button>
          </div>
        </>
      )}

      <StudyTreeImportDialog open={importOpen} onOpenChange={setImportOpen} courseId={courseId} />
      <StudyTreeDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} courseId={courseId} />
    </div>
  )
}
