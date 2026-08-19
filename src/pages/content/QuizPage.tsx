import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { QuizRunner } from '@/features/quiz/QuizRunner'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

export function QuizPage() {
  const { t } = useTranslation()
  const { moduleId = '' } = useParams()
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-background p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} />
        {t('common.back')}
      </button>
      <QuizRunner moduleId={moduleId} />
    </div>
  )
}
