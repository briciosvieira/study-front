import { useState } from 'react'
import { useStudents } from '@/features/users/useUsers'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Dialog } from '@/shared/components/ui/dialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { Course } from '@/shared/types/api.types'
import { useSetCourseVisibility } from './useCourses'

export function VisibilityModal({
  open,
  onOpenChange,
  course,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course
}) {
  const { t } = useTranslation()
  const { data: students, isLoading } = useStudents()
  const setVisibility = useSetCourseVisibility(course.id)
  // lazy initializer only — the parent mounts a fresh instance per course
  // (conditional render, or a `key={course.id}`), so no effect is needed here
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(course.visibilities?.map((v) => v.userId) ?? []),
  )

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('visibility.title')}
      description={t('visibility.description', { title: course.title })}
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('visibility.loadingStudents')}</p>
      ) : !students?.length ? (
        <EmptyState title={t('visibility.emptyStudents')} />
      ) : (
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {students.map((student) => (
            <label
              key={student.id}
              className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent"
            >
              <Checkbox
                checked={selected.has(student.id)}
                onCheckedChange={() => toggle(student.id)}
              />
              <div>
                <p className="text-sm font-medium text-foreground">{student.name}</p>
                <p className="text-xs text-muted-foreground">{student.email}</p>
              </div>
            </label>
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          {t('common.cancel')}
        </Button>
        <Button
          disabled={setVisibility.isPending}
          onClick={() =>
            setVisibility.mutate([...selected], { onSuccess: () => onOpenChange(false) })
          }
        >
          {t('visibility.save')}
        </Button>
      </div>
    </Dialog>
  )
}
