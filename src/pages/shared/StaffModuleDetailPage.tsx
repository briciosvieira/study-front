import { ArrowLeft, FileUp, Plus, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ImportExcelModal } from '@/features/quiz/ImportExcelModal'
import { QuestionForm } from '@/features/quiz/QuestionForm'
import { QuestionList } from '@/features/quiz/QuestionList'
import { useQuestions } from '@/features/quiz/useQuestions'
import { PdfList } from '@/features/pdf/PdfList'
import { PdfUploadForm } from '@/features/pdf/PdfUploadForm'
import { usePdfItems } from '@/features/pdf/usePdfItems'
import { VideoList } from '@/features/video/VideoList'
import { VideoUploadForm } from '@/features/video/VideoUploadForm'
import { useVideoItems } from '@/features/video/useVideoItems'
import { useModules } from '@/features/modules/useModules'
import { PageSpinner } from '@/shared/components/Spinner'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import { ListSkeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { Question } from '@/shared/types/api.types'

export function StaffModuleDetailPage({ basePath, canDelete }: { basePath: string; canDelete: boolean }) {
  const { t } = useTranslation()
  const { courseId = '', moduleId = '' } = useParams()
  const { data: modules, isLoading: isLoadingModules } = useModules(courseId)
  const module = modules?.find((m) => m.id === moduleId)

  const [pdfFormOpen, setPdfFormOpen] = useState(false)
  const [videoFormOpen, setVideoFormOpen] = useState(false)
  const [questionForm, setQuestionForm] = useState<Question | 'new' | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const pdfQuery = usePdfItems(module?.type === 'PDF' ? moduleId : '')
  const videoQuery = useVideoItems(module?.type === 'VIDEO' ? moduleId : '')
  const questionsQuery = useQuestions(module?.type === 'QUIZ' ? moduleId : '')

  if (isLoadingModules) return <PageSpinner />
  if (!module) return <EmptyState title={t('modules.notFound')} />

  return (
    <div>
      <Link
        to={`${basePath}/${courseId}`}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        {t('moduleDetail.backToCourse')}
      </Link>

      <PageHeader
        title={module.title}
        actions={
          <>
            {module.type === 'PDF' && (
              <Button onClick={() => setPdfFormOpen(true)}>
                <Upload size={16} />
                {t('moduleDetail.uploadPdf')}
              </Button>
            )}
            {module.type === 'VIDEO' && (
              <Button onClick={() => setVideoFormOpen(true)}>
                <Upload size={16} />
                {t('moduleDetail.uploadVideo')}
              </Button>
            )}
            {module.type === 'QUIZ' && (
              <>
                <Button variant="secondary" onClick={() => setImportOpen(true)}>
                  <FileUp size={16} />
                  {t('moduleDetail.importExcel')}
                </Button>
                <Button onClick={() => setQuestionForm('new')}>
                  <Plus size={16} />
                  {t('moduleDetail.newQuestion')}
                </Button>
              </>
            )}
          </>
        }
      />

      {module.type === 'PDF' &&
        (pdfQuery.isLoading ? (
          <ListSkeleton />
        ) : (
          <PdfList moduleId={moduleId} items={pdfQuery.data ?? []} canDelete={canDelete} />
        ))}

      {module.type === 'VIDEO' &&
        (videoQuery.isLoading ? (
          <ListSkeleton />
        ) : (
          <VideoList moduleId={moduleId} items={videoQuery.data ?? []} canDelete={canDelete} />
        ))}

      {module.type === 'QUIZ' &&
        (questionsQuery.isLoading ? (
          <ListSkeleton />
        ) : (
          <QuestionList
            moduleId={moduleId}
            questions={questionsQuery.data ?? []}
            canDelete={canDelete}
            onEdit={setQuestionForm}
          />
        ))}

      <PdfUploadForm open={pdfFormOpen} onOpenChange={setPdfFormOpen} moduleId={moduleId} />
      <VideoUploadForm open={videoFormOpen} onOpenChange={setVideoFormOpen} moduleId={moduleId} />
      <QuestionForm
        open={!!questionForm}
        onOpenChange={(open) => !open && setQuestionForm(null)}
        moduleId={moduleId}
        question={questionForm === 'new' ? undefined : (questionForm ?? undefined)}
      />
      <ImportExcelModal open={importOpen} onOpenChange={setImportOpen} moduleId={moduleId} />
    </div>
  )
}
