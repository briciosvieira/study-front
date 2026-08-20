import { ChevronLeft, ChevronRight, Download, FolderOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { TemplateEditDialog } from '@/features/template-library/TemplateEditDialog'
import { TemplateUploadDialog } from '@/features/template-library/TemplateUploadDialog'
import {
  useDeleteTemplate,
  useDownloadTemplate,
  useTemplates,
} from '@/features/template-library/useTemplateLibrary'
import { useAuth } from '@/features/auth/useAuth'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import { ListSkeleton, Skeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { TemplateLibraryFile } from '@/shared/types/api.types'

const PAGE_SIZE = 20

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')
  return lastDot === -1 ? '' : fileName.slice(lastDot + 1).toUpperCase()
}

export function TemplateLibraryPage() {
  const { t, language } = useTranslation()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const debouncedQuery = useDebouncedValue(query)

  const { data, isLoading } = useTemplates({
    search: debouncedQuery || undefined,
    page,
    limit: PAGE_SIZE,
  })

  const deleteTemplate = useDeleteTemplate()
  const downloadTemplate = useDownloadTemplate()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<TemplateLibraryFile | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TemplateLibraryFile | null>(null)

  const canDelete = user?.role === 'ADMIN'
  function canEdit(template: TemplateLibraryFile) {
    return user?.role === 'ADMIN' || template.uploadedById === user?.id
  }

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  return (
    <div>
      <PageHeader
        title={t('templateLibrary.title')}
        description={t('templateLibrary.subtitle')}
        actions={
          <>
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
                placeholder={t('templateLibrary.searchPlaceholder')}
                className="w-full pl-8 sm:w-72"
              />
            </div>
            <Button onClick={() => setUploadOpen(true)}>
              <Plus size={16} />
              {t('templateLibrary.addButton')}
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

      {!isLoading && !data?.items.length && (
        <div className="rounded-xl border border-border bg-card p-6">
          <EmptyState
            icon={FolderOpen}
            title={debouncedQuery ? t('templateLibrary.emptySearchTitle') : t('templateLibrary.emptyTitle')}
            description={
              debouncedQuery
                ? t('templateLibrary.emptySearchDescription')
                : t('templateLibrary.emptyDescription')
            }
          />
        </div>
      )}

      {!isLoading && !!data?.items.length && (
        <>
          {/* Smartphone: card list */}
          <div className="space-y-2 sm:hidden">
            {data.items.map((template) => (
              <div key={template.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-card-foreground">{template.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{template.originalName}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {fileExtension(template.originalName)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatFileSize(template.fileSize)}</span>
                  <span>{template.uploadedBy?.name ?? '—'}</span>
                </div>
                <div className="mt-3 flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('templateLibrary.download')}
                    onClick={() => downloadTemplate.mutate(template.id)}
                  >
                    <Download size={16} />
                  </Button>
                  {canEdit(template) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('templateLibrary.edit')}
                      onClick={() => setEditTarget(template)}
                    >
                      <Pencil size={16} />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('common.delete')}
                      onClick={() => setDeleteTarget(template)}
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
                    <th className="px-4 py-2.5 font-medium">{t('templateLibrary.columnName')}</th>
                    <th className="px-4 py-2.5 font-medium">{t('templateLibrary.columnType')}</th>
                    <th className="px-4 py-2.5 font-medium">{t('templateLibrary.columnSize')}</th>
                    <th className="px-4 py-2.5 font-medium">{t('templateLibrary.columnUploadedBy')}</th>
                    <th className="px-4 py-2.5 font-medium">{t('templateLibrary.columnDate')}</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((template) => (
                    <tr key={template.id} className="hover:bg-accent/40">
                      <td className="px-4 py-2.5">
                        <p className="truncate font-medium text-card-foreground">{template.name}</p>
                        {template.description && (
                          <p className="truncate text-xs text-muted-foreground">{template.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {fileExtension(template.originalName)}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {formatFileSize(template.fileSize)}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{template.uploadedBy?.name ?? '—'}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {new Date(template.createdAt).toLocaleDateString(language)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('templateLibrary.download')}
                            title={t('templateLibrary.download')}
                            onClick={() => downloadTemplate.mutate(template.id)}
                          >
                            <Download size={16} />
                          </Button>
                          {canEdit(template) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={t('templateLibrary.edit')}
                              title={t('templateLibrary.edit')}
                              onClick={() => setEditTarget(template)}
                            >
                              <Pencil size={16} />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={t('common.delete')}
                              title={t('common.delete')}
                              onClick={() => setDeleteTarget(template)}
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

      <TemplateUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <TemplateEditDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        template={editTarget}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('templateLibrary.deleteConfirmTitle', { name: deleteTarget?.name ?? '' })}
        description={t('templateLibrary.deleteConfirmDescription')}
        isLoading={deleteTemplate.isPending}
        onConfirm={() =>
          deleteTarget &&
          deleteTemplate.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }
      />
    </div>
  )
}
