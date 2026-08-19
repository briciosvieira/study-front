import { ArrowLeft, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/shared/components/Badge'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import { PageSpinner } from '@/shared/components/Spinner'
import { Input } from '@/shared/components/ui/input'
import { UserAvatar } from '@/shared/components/UserMenu'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { formatDate } from '@/shared/utils/formatDate'
import type { Role, UserCourse } from '@/shared/types/api.types'
import {
  useAddCoursesToUser,
  useAvailableCoursesForUser,
  useRemoveCourseFromUser,
  useUser,
  useUserCourses,
} from '@/features/users/useUserCourses'

const ROLE_BADGE_VARIANT: Record<Role, 'primary' | 'default' | 'muted'> = {
  ADMIN: 'primary',
  INSTRUCTOR: 'default',
  STUDENT: 'muted',
}

export function UserDetailPage() {
  const { t, language } = useTranslation()
  const { userId = '' } = useParams()
  const [availableSearch, setAvailableSearch] = useState('')
  const [removeTarget, setRemoveTarget] = useState<UserCourse | null>(null)
  const debouncedSearch = useDebouncedValue(availableSearch)

  const { data: user, isLoading: isLoadingUser } = useUser(userId)
  const { data: courses, isLoading: isLoadingCourses } = useUserCourses(userId)
  const { data: availableCourses, isLoading: isLoadingAvailable } = useAvailableCoursesForUser(
    userId,
    debouncedSearch,
  )
  const addCourses = useAddCoursesToUser(userId)
  const removeCourse = useRemoveCourseFromUser(userId)

  if (isLoadingUser) return <PageSpinner />
  if (!user) return <EmptyState title={t('users.notFound')} />

  const isStudent = user.role === 'STUDENT'

  return (
    <div>
      <Link
        to="/admin/users"
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        {t('userDetail.backToUsers')}
      </Link>

      <PageHeader title={user.name} description={user.email} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <UserAvatar name={user.name} className="h-11 w-11" />
            <div className="min-w-0">
              <p className="truncate font-medium text-card-foreground">{user.name}</p>
              <Badge variant={ROLE_BADGE_VARIANT[user.role]}>{t(`roles.${user.role}`)}</Badge>
            </div>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('userDetail.email')}
              </dt>
              <dd className="mt-0.5 text-card-foreground">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('userDetail.username')}
              </dt>
              <dd className="mt-0.5 text-card-foreground">{user.username}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('users.columnStatus')}
              </dt>
              <dd className="mt-0.5">
                <Badge variant={user.active ? 'success' : 'muted'}>
                  {user.active ? t('users.statusActive') : t('users.statusInactive')}
                </Badge>
              </dd>
            </div>
          </dl>
        </div>

        {isStudent ? (
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-foreground">
                {t('userDetail.coursesTitle', { count: courses?.length ?? 0 })}
              </h3>
              <div className="mt-2 rounded-xl border border-border bg-card">
                {isLoadingCourses ? (
                  <p className="p-4 text-sm text-muted-foreground">{t('common.loading')}</p>
                ) : !courses?.length ? (
                  <p className="p-4 text-sm text-muted-foreground">{t('userDetail.emptyCourses')}</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {courses.map((course) => (
                      <li
                        key={course.id}
                        className="flex items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-card-foreground">
                            {course.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {t('courseAccess.accessSince', {
                              date: formatDate(course.assignedAt, language),
                            })}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(course)}
                          aria-label={t('courseAccess.removeAccess')}
                          className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-foreground">{t('userDetail.addCourseTitle')}</h3>
              <div className="relative mt-2">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={availableSearch}
                  onChange={(e) => setAvailableSearch(e.target.value)}
                  placeholder={t('userDetail.searchCoursesPlaceholder')}
                  className="pl-8"
                />
              </div>
              <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-border bg-card">
                {isLoadingAvailable ? (
                  <p className="p-4 text-sm text-muted-foreground">{t('common.loading')}</p>
                ) : !availableCourses?.length ? (
                  <p className="p-4 text-sm text-muted-foreground">{t('userDetail.emptyAvailableCourses')}</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {availableCourses.map((course) => (
                      <li key={course.id}>
                        <button
                          type="button"
                          onClick={() => addCourses.mutate([course.id])}
                          disabled={addCourses.isPending}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-accent disabled:opacity-50"
                        >
                          <p className="truncate text-sm font-medium text-card-foreground">
                            {course.title}
                          </p>
                          <Plus size={16} className="shrink-0 text-primary" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{t('userDetail.coursesOnlyForStudents')}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(next) => !next && setRemoveTarget(null)}
        title={t('courseAccess.removeConfirmTitle', { name: user.name })}
        description={t('courseAccess.removeConfirmDescription', { title: removeTarget?.title ?? '' })}
        confirmLabel={t('courseAccess.removeAccess')}
        isLoading={removeCourse.isPending}
        onConfirm={() =>
          removeTarget &&
          removeCourse.mutate(removeTarget.id, { onSuccess: () => setRemoveTarget(null) })
        }
      />
    </div>
  )
}
