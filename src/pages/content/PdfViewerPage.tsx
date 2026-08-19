import { useNavigate, useParams } from 'react-router-dom'
import { PdfViewer } from '@/features/pdf/PdfViewer'
import { usePdfItems } from '@/features/pdf/usePdfItems'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageSpinner } from '@/shared/components/Spinner'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

export function PdfViewerPage() {
  const { t } = useTranslation()
  const { moduleId = '', pdfId = '' } = useParams()
  const navigate = useNavigate()
  const { data: items, isLoading } = usePdfItems(moduleId)
  const item = items?.find((i) => i.id === pdfId)

  if (isLoading) return <PageSpinner />
  if (!item) return <EmptyState title={t('pdf.notFound')} />

  return (
    <div className="h-dvh">
      <PdfViewer fileUrl={item.fileUrl} title={item.title} onBack={() => navigate(-1)} />
    </div>
  )
}
