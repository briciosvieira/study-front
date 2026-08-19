import { HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PdfList } from '@/features/pdf/PdfList'
import { usePdfItems } from '@/features/pdf/usePdfItems'
import { VideoList } from '@/features/video/VideoList'
import { useVideoItems } from '@/features/video/useVideoItems'
import { Button } from '@/shared/components/ui/button'
import { PageSpinner } from '@/shared/components/Spinner'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { CourseModule } from '@/shared/types/api.types'

export function StudentModuleSection({ module }: { module: CourseModule }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {module.title}
      </h2>
      {module.type === 'PDF' && <PdfSection moduleId={module.id} />}
      {module.type === 'VIDEO' && <VideoSection moduleId={module.id} />}
      {module.type === 'QUIZ' && <QuizSection moduleId={module.id} />}
    </section>
  )
}

function PdfSection({ moduleId }: { moduleId: string }) {
  const { data, isLoading } = usePdfItems(moduleId)
  if (isLoading) return <PageSpinner />
  return <PdfList moduleId={moduleId} items={data ?? []} readOnly />
}

function VideoSection({ moduleId }: { moduleId: string }) {
  const { data, isLoading } = useVideoItems(moduleId)
  if (isLoading) return <PageSpinner />
  return <VideoList moduleId={moduleId} items={data ?? []} readOnly />
}

function QuizSection({ moduleId }: { moduleId: string }) {
  const { t } = useTranslation()
  return (
    <Button asChild variant="secondary">
      <Link to={`/modules/${moduleId}/quiz`}>
        <HelpCircle size={16} />
        {t('quiz.takeQuiz')}
      </Link>
    </Button>
  )
}
