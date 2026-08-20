import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CourseBadges } from '@/features/users/CourseBadges'
import { useStudentsOverview } from '@/features/users/useUsers'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import { ListSkeleton, Skeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { UserAvatar } from '@/shared/components/UserMenu'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

const PAGE_SIZE = 20

export function StudentsPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const debouncedQuery = useDebouncedValue(query)

  const { data, isLoading } = useStudentsOverview({
    search: debouncedQuery || undefined,
    page,
    limit: PAGE_SIZE,
  })

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  return (
    <div>
      <PageHeader
        title={t('students.title')}
        description={t('students.subtitle')}
        actions={
          <div className="relative w-full sm:w-auto">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder={t('students.searchPlaceholder')}
              className="w-full pl-8 sm:w-72"
            />
          </div>
        }
      />

      {isLoading && (
        <>
          <div className="sm:hidden">
            <ListSkeleton />
          </div>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card sm:block">
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </>
      )}

      {!isLoading && !data?.items.length && (
        <div className="rounded-xl border border-border bg-card p-6">
          <EmptyState title={t('students.emptyTitle')} />
        </div>
      )}

      {!isLoading && !!data?.items.length && (
        <>
          {/* Smartphone: card list */}
          <div className="space-y-2 sm:hidden">
            {data.items.map((student) => (
              <Link
                key={student.id}
                to={`/admin/students/${student.id}`}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30"
              >
                <UserAvatar name={student.name} avatarUrl={student.avatarUrl} className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-card-foreground">{student.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{student.email}</p>
                  <div className="mt-2">
                    <CourseBadges courses={student.courses} total={student.totalCourses} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Tablet and up: table */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-surface-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">{t('students.columnId')}</th>
                    <th className="px-4 py-2.5 font-medium">{t('students.columnStudent')}</th>
                    <th className="px-4 py-2.5 font-medium">{t('students.columnCourses')}</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((student, index) => (
                    <tr key={student.id} className="hover:bg-accent/40">
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {(page - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            name={student.name}
                            avatarUrl={student.avatarUrl}
                            className="h-8 w-8 text-xs"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-card-foreground">{student.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <CourseBadges courses={student.courses} total={student.totalCourses} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end">
                          <Link
                            to={`/admin/students/${student.id}`}
                            aria-label={t('students.viewMore')}
                            title={t('students.viewMore')}
                            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            <MoreHorizontal size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft size={14} />
                {t('common.previous')}
              </Button>
              <span>{t('common.pageOf', { page, total: totalPages })}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                {t('common.next')}
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
