import { Eye, EyeOff, FileText, HelpCircle, Pencil, Trash2, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { CourseModule } from '@/shared/types/api.types'
import { useSetModuleVisibility } from './useModules'

const TYPE_ICON = { PDF: FileText, VIDEO: Video, QUIZ: HelpCircle }

export function ModuleCard({
  module,
  to,
  canDelete,
  onEdit,
  onDelete,
}: {
  module: CourseModule
  to: string
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const setVisibility = useSetModuleVisibility(module.courseId)
  const { t } = useTranslation()
  const Icon = TYPE_ICON[module.type]

  return (
    <div className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30">
      <Link to={to} className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <Icon size={17} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-card-foreground">{module.title}</p>
          <Badge variant="muted" className="mt-0.5">
            {module.type}
          </Badge>
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          title={module.visible ? t('modules.visibleHint') : t('modules.hiddenHint')}
          aria-label={module.visible ? t('modules.visibleHint') : t('modules.hiddenHint')}
          onClick={() => setVisibility.mutate({ id: module.id, visible: !module.visible })}
        >
          {module.visible ? <Eye size={16} /> : <EyeOff size={16} className="text-muted-foreground" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label={t('common.edit')}>
          <Pencil size={16} />
        </Button>
        {canDelete && (
          <Button variant="ghost" size="icon" onClick={onDelete} aria-label={t('common.delete')}>
            <Trash2 size={16} className="text-danger" />
          </Button>
        )}
      </div>
    </div>
  )
}
