import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { useDeleteTree } from './useStudyTree'

export function StudyTreeDeleteDialog({
  open,
  onOpenChange,
  courseId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
}) {
  const { t } = useTranslation()
  const deleteTree = useDeleteTree(courseId)

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('studyTree.deleteConfirmTitle')}
      description={t('studyTree.deleteConfirmDescription')}
      confirmLabel={t('studyTree.deleteConfirmButton')}
      isLoading={deleteTree.isPending}
      onConfirm={() => deleteTree.mutate(undefined, { onSuccess: () => onOpenChange(false) })}
    />
  )
}
