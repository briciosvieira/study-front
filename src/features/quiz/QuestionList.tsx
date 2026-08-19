import { HelpCircle, Pencil, Trash2 } from 'lucide-react'
import { EmptyState } from '@/shared/components/EmptyState'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { Question } from '@/shared/types/api.types'
import { useDeleteQuestion } from './useQuestions'

export function QuestionList({
  moduleId,
  questions,
  canDelete,
  onEdit,
}: {
  moduleId: string
  questions: Question[]
  canDelete: boolean
  onEdit: (question: Question) => void
}) {
  const { t } = useTranslation()
  const deleteQuestion = useDeleteQuestion(moduleId)

  if (!questions.length) {
    return <EmptyState title={t('questions.empty')} icon={HelpCircle} />
  }

  return (
    <div className="space-y-2">
      {questions.map((question, index) => (
        <div key={question.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium text-card-foreground">
              {index + 1}. {question.statement}
            </p>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(question)}
                aria-label={t('common.edit')}
              >
                <Pencil size={14} />
              </Button>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteQuestion.mutate(question.id)}
                  aria-label={t('common.delete')}
                >
                  <Trash2 size={14} className="text-danger" />
                </Button>
              )}
            </div>
          </div>
          <ul className="mt-2 space-y-1">
            {question.options.map((option) => (
              <li
                key={option.id}
                className={
                  option.correct ? 'text-sm font-medium text-emerald-600' : 'text-sm text-muted-foreground'
                }
              >
                {option.letter}) {option.text}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            {question.timeLimitSec}
            {t('questions.timeLimitSuffix')}
          </p>
        </div>
      ))}
    </div>
  )
}
