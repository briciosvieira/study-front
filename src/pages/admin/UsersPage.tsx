import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Badge } from '@/shared/components/Badge'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import { ListSkeleton, Skeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { UserAvatar } from '@/shared/components/UserMenu'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { Role, User } from '@/shared/types/api.types'
import { UserForm } from '@/features/users/UserForm'
import { useDeleteUser, useUsers } from '@/features/users/useUsers'

const ROLE_BADGE_VARIANT: Record<Role, 'primary' | 'default' | 'muted'> = {
  ADMIN: 'primary',
  INSTRUCTOR: 'default',
  STUDENT: 'muted',
}

export function UsersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: users, isLoading } = useUsers()
  const deleteUser = useDeleteUser()
  const [formUser, setFormUser] = useState<User | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [query, setQuery] = useState('')

  const filteredUsers = useMemo(() => {
    if (!users) return users
    const normalized = query.trim().toLowerCase()
    if (!normalized) return users
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized) ||
        user.username.toLowerCase().includes(normalized),
    )
  }, [users, query])

  return (
    <div>
      <PageHeader
        title={t('users.title')}
        description={t('users.subtitle')}
        actions={
          <>
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('common.search')}
                className="w-full pl-8 sm:w-64"
              />
            </div>
            <Button onClick={() => setFormUser('new')}>
              <Plus size={16} />
              {t('users.newUser')}
            </Button>
          </>
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

      {!isLoading && !filteredUsers?.length && (
        <div className="rounded-xl border border-border bg-card p-6">
          <EmptyState title={t('users.title')} />
        </div>
      )}

      {!isLoading && !!filteredUsers?.length && (
        <>
          {/* Smartphone: card list — a table squeezed into ~350px stops being usable */}
          <div className="space-y-2 sm:hidden">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => navigate(`/admin/users/${user.id}`)}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30"
              >
                <UserAvatar name={user.name} className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-card-foreground">{user.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant={ROLE_BADGE_VARIANT[user.role]}>{t(`roles.${user.role}`)}</Badge>
                    <Badge variant={user.active ? 'success' : 'muted'}>
                      {user.active ? t('users.statusActive') : t('users.statusInactive')}
                    </Badge>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFormUser(user)
                    }}
                    aria-label={t('common.edit')}
                  >
                    <Pencil size={16} />
                  </Button>
                  {user.role !== 'ADMIN' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTarget(user)
                      }}
                      aria-label={t('common.delete')}
                    >
                      <Trash2 size={16} className="text-danger" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tablet and up: table */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-surface-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">{t('users.columnName')}</th>
                    <th className="px-4 py-2.5 font-medium">{t('users.columnEmail')}</th>
                    <th className="hidden px-4 py-2.5 font-medium md:table-cell">
                      {t('users.columnUsername')}
                    </th>
                    <th className="px-4 py-2.5 font-medium">{t('users.columnRole')}</th>
                    <th className="hidden px-4 py-2.5 font-medium md:table-cell">
                      {t('users.columnStatus')}
                    </th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className="cursor-pointer hover:bg-accent/40"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar name={user.name} className="h-8 w-8 text-xs" />
                          <span className="font-medium text-card-foreground">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{user.email}</td>
                      <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">
                        {user.username}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant={ROLE_BADGE_VARIANT[user.role]}>{t(`roles.${user.role}`)}</Badge>
                      </td>
                      <td className="hidden px-4 py-2.5 md:table-cell">
                        <Badge variant={user.active ? 'success' : 'muted'}>
                          {user.active ? t('users.statusActive') : t('users.statusInactive')}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              setFormUser(user)
                            }}
                            aria-label={t('common.edit')}
                          >
                            <Pencil size={16} />
                          </Button>
                          {user.role !== 'ADMIN' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteTarget(user)
                              }}
                              aria-label={t('common.delete')}
                            >
                              <Trash2 size={16} className="text-danger" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <UserForm
        open={!!formUser}
        onOpenChange={(open) => !open && setFormUser(null)}
        user={formUser === 'new' ? undefined : (formUser ?? undefined)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('users.deleteTitle', { name: deleteTarget?.name ?? '' })}
        description={t('users.deleteDescription')}
        isLoading={deleteUser.isPending}
        onConfirm={() =>
          deleteTarget &&
          deleteUser.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }
      />
    </div>
  )
}
