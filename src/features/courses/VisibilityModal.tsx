import { ChevronLeft, ChevronRight, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { formatDate } from '@/shared/utils/formatDate'
import type { Course, EnrolledStudent } from '@/shared/types/api.types'
import {
  useAddStudents,
  useAvailableStudents,
  useEnrolledStudents,
  useRemoveStudent,
} from './useCourseStudents'

const PAGE_SIZE = 20

export function VisibilityModal({
  open,
  onOpenChange,
  course,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course
}) {
  const { t, language } = useTranslation()
  const [enrolledSearch, setEnrolledSearch] = useState('')
  const [enrolledPage, setEnrolledPage] = useState(1)
  const [availableSearch, setAvailableSearch] = useState('')
  const [availablePage, setAvailablePage] = useState(1)
  const [removeTarget, setRemoveTarget] = useState<EnrolledStudent | null>(null)

  const debouncedEnrolledSearch = useDebouncedValue(enrolledSearch)
  const debouncedAvailableSearch = useDebouncedValue(availableSearch)

  const enrolledQuery = useEnrolledStudents(course.id, {
    search: debouncedEnrolledSearch || undefined,
    page: enrolledPage,
    limit: PAGE_SIZE,
  })
  const availableQuery = useAvailableStudents(course.id, {
    search: debouncedAvailableSearch || undefined,
    page: availablePage,
    limit: PAGE_SIZE,
  })
  const addStudents = useAddStudents(course.id)
  const removeStudent = useRemoveStudent(course.id)

  const enrolledTotalPages = Math.max(1, Math.ceil((enrolledQuery.data?.total ?? 0) / PAGE_SIZE))
  const availableTotalPages = Math.max(1, Math.ceil((availableQuery.data?.total ?? 0) / PAGE_SIZE))

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('courseAccess.title')}
      description={course.title}
      className="max-w-2xl"
    >
      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-foreground">
            {t('courseAccess.enrolledTitle', { count: enrolledQuery.data?.total ?? 0 })}
          </h3>
          <div className="relative mt-2">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={enrolledSearch}
              onChange={(e) => {
                setEnrolledSearch(e.target.value)
                setEnrolledPage(1)
              }}
              placeholder={t('courseAccess.searchEnrolledPlaceholder')}
              className="pl-8"
            />
          </div>

          <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-border">
            {enrolledQuery.isLoading ? (
              <p className="p-3 text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : !enrolledQuery.data?.items.length ? (
              <p className="p-3 text-sm text-muted-foreground">{t('courseAccess.emptyEnrolled')}</p>
            ) : (
              <ul className="divide-y divide-border">
                {enrolledQuery.data.items.map((student) => (
                  <li
                    key={student.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{student.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{student.email}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t('courseAccess.accessSince', { date: formatDate(student.assignedAt, language) })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRemoveTarget(student)}
                      aria-label={t('courseAccess.removeAccess')}
                    >
                      <Trash2 size={16} className="text-danger" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {enrolledTotalPages > 1 && (
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEnrolledPage((p) => Math.max(1, p - 1))}
                disabled={enrolledPage <= 1}
              >
                <ChevronLeft size={14} />
                {t('common.previous')}
              </Button>
              <span>{t('common.pageOf', { page: enrolledPage, total: enrolledTotalPages })}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEnrolledPage((p) => Math.min(enrolledTotalPages, p + 1))}
                disabled={enrolledPage >= enrolledTotalPages}
              >
                {t('common.next')}
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-sm font-semibold text-foreground">{t('courseAccess.addTitle')}</h3>
          <div className="relative mt-2">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={availableSearch}
              onChange={(e) => {
                setAvailableSearch(e.target.value)
                setAvailablePage(1)
              }}
              placeholder={t('courseAccess.searchAvailablePlaceholder')}
              className="pl-8"
            />
          </div>

          <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-border">
            {availableQuery.isLoading ? (
              <p className="p-3 text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : !availableQuery.data?.items.length ? (
              <p className="p-3 text-sm text-muted-foreground">{t('courseAccess.emptyAvailable')}</p>
            ) : (
              <ul className="divide-y divide-border">
                {availableQuery.data.items.map((student) => (
                  <li key={student.id}>
                    <button
                      type="button"
                      onClick={() => addStudents.mutate([student.id])}
                      disabled={addStudents.isPending}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-accent disabled:opacity-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{student.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{student.email}</p>
                      </div>
                      <Plus size={16} className="shrink-0 text-primary" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {availableTotalPages > 1 && (
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAvailablePage((p) => Math.max(1, p - 1))}
                disabled={availablePage <= 1}
              >
                <ChevronLeft size={14} />
                {t('common.previous')}
              </Button>
              <span>{t('common.pageOf', { page: availablePage, total: availableTotalPages })}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAvailablePage((p) => Math.min(availableTotalPages, p + 1))}
                disabled={availablePage >= availableTotalPages}
              >
                {t('common.next')}
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          {t('common.close')}
        </Button>
      </div>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(next) => !next && setRemoveTarget(null)}
        title={t('courseAccess.removeConfirmTitle', { name: removeTarget?.name ?? '' })}
        description={t('courseAccess.removeConfirmDescription', { title: course.title })}
        confirmLabel={t('courseAccess.removeAccess')}
        isLoading={removeStudent.isPending}
        onConfirm={() =>
          removeTarget &&
          removeStudent.mutate(removeTarget.id, { onSuccess: () => setRemoveTarget(null) })
        }
      />
    </Dialog>
  )
}
