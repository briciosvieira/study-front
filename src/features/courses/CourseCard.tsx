import { BookOpen, Pencil, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { Course } from '@/shared/types/api.types'
import { getUploadUrl } from '@/shared/utils/uploads'

export function CourseCard({
  course,
  to,
  canDelete,
  canEdit,
  onEdit,
  onDelete,
  onManageVisibility,
}: {
  course: Course
  to: string
  canDelete?: boolean
  canEdit?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onManageVisibility?: () => void
}) {
  const { t } = useTranslation()
  const coverUrl = getUploadUrl(course.coverUrl)
  // tracks the URL that failed (not just a boolean) so a newly saved cover
  // — a different URL — automatically gets a fresh attempt instead of being
  // stuck behind a stale failure from a previous image
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  return (
    <div className="card-glow group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">
      <Link to={to} className="block aspect-video overflow-hidden bg-surface-muted">
        {coverUrl && coverUrl !== failedUrl ? (
          <img
            src={coverUrl}
            alt=""
            onError={() => setFailedUrl(coverUrl)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/40">
            <BookOpen size={36} strokeWidth={1.5} />
          </div>
        )}
      </Link>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t('courses.title')}
        </p>
        <Link
          to={to}
          className="mt-0.5 block truncate text-base font-semibold text-card-foreground hover:text-primary"
        >
          {course.title}
        </Link>
        {course.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
        )}
        {!course.active && (
          <Badge variant="muted" className="mt-2">
            {t('courses.inactive')}
          </Badge>
        )}

        {(canEdit || canDelete || onManageVisibility) && (
          <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
            {onManageVisibility && (
              <Button variant="secondary" size="sm" onClick={onManageVisibility}>
                <Users size={14} />
                {t('courses.visibility')}
              </Button>
            )}
            <div className="flex-1" />
            {canEdit && (
              <Button variant="ghost" size="icon" onClick={onEdit} aria-label={t('common.edit')}>
                <Pencil size={14} />
              </Button>
            )}
            {canDelete && (
              <Button variant="ghost" size="icon" onClick={onDelete} aria-label={t('common.delete')}>
                <Trash2 size={14} className="text-danger" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
