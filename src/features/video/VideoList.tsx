import { Download, Pencil, Trash2, Video as VideoIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/shared/components/EmptyState'
import { OrderBadge } from '@/shared/components/OrderBadge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { VideoItem } from '@/shared/types/api.types'
import { VideoEditDialog } from './VideoEditDialog'
import { useDeleteVideo, useDownloadVideo, useReorderVideo } from './useVideoItems'

export function VideoList({
  moduleId,
  items,
  canDelete,
  readOnly,
}: {
  moduleId: string
  items: VideoItem[]
  canDelete?: boolean
  readOnly?: boolean
}) {
  const { t } = useTranslation()
  const deleteVideo = useDeleteVideo(moduleId)
  const reorderVideo = useReorderVideo(moduleId)
  const downloadVideo = useDownloadVideo()
  const [editTarget, setEditTarget] = useState<VideoItem | null>(null)

  if (!items.length) {
    return <EmptyState title={t('video.empty')} icon={VideoIcon} />
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30"
        >
          <Link to={`/modules/${moduleId}/video/${item.id}`} className="flex items-center gap-3">
            <OrderBadge label={item.orderLabel} />
            <p className="text-sm font-medium text-card-foreground hover:text-primary">{item.title}</p>
          </Link>

          {!readOnly && (
            <div className="flex items-center gap-2">
              <Input
                defaultValue={item.orderLabel}
                className="h-8 w-16 text-center text-xs"
                onBlur={(e) => {
                  if (e.target.value && e.target.value !== item.orderLabel) {
                    reorderVideo.mutate({ id: item.id, orderLabel: e.target.value })
                  }
                }}
              />
              {canDelete && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => downloadVideo.mutate(item.id)}
                    disabled={downloadVideo.isPending}
                    aria-label={t('video.download')}
                  >
                    <Download size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditTarget(item)}
                    aria-label={t('video.edit')}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteVideo.mutate(item.id)}
                    aria-label={t('common.delete')}
                  >
                    <Trash2 size={16} className="text-danger" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {editTarget && (
        <VideoEditDialog
          key={editTarget.id}
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          moduleId={moduleId}
          item={editTarget}
        />
      )}
    </div>
  )
}
