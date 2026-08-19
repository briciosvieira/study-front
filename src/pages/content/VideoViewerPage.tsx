import { useNavigate, useParams } from 'react-router-dom'
import { VideoPlayer } from '@/features/video/VideoPlayer'
import { useVideoItems } from '@/features/video/useVideoItems'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageSpinner } from '@/shared/components/Spinner'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

export function VideoViewerPage() {
  const { t } = useTranslation()
  const { moduleId = '', videoId = '' } = useParams()
  const navigate = useNavigate()
  const { data: items, isLoading } = useVideoItems(moduleId)
  const item = items?.find((i) => i.id === videoId)

  if (isLoading) return <PageSpinner />
  if (!item) return <EmptyState title={t('video.notFound')} />

  return (
    <div className="h-dvh">
      <VideoPlayer src={item.fileUrl} title={item.title} onBack={() => navigate(-1)} />
    </div>
  )
}
