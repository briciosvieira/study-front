import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { Question } from '@/shared/types/api.types'
import { useCreateQuestion, useUpdateQuestion } from './useQuestions'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function toFormOptions(question?: Question) {
  if (question?.options.length) {
    return question.options.map((o) => ({ letter: o.letter, text: o.text, correct: !!o.correct }))
  }
  return [
    { letter: 'A', text: '', correct: true },
    { letter: 'B', text: '', correct: false },
  ]
}

export function QuestionForm({
  open,
  onOpenChange,
  moduleId,
  question,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  moduleId: string
  question?: Question
}) {
  const { t } = useTranslation()
  const createQuestion = useCreateQuestion(moduleId)
  const updateQuestion = useUpdateQuestion(moduleId)
  const isEditing = !!question

  const schema = useMemo(
    () =>
      z
        .object({
          statement: z.string().min(1, t('common.required')),
          timeLimitSec: z.number().int().min(5),
          options: z
            .array(
              z.object({
                letter: z.string(),
                text: z.string().min(1, t('common.required')),
                correct: z.boolean(),
              }),
            )
            .min(2, t('questionForm.optionsMinError')),
        })
        .refine((data) => data.options.filter((o) => o.correct).length === 1, {
          message: t('questionForm.exactlyOneCorrectError'),
          path: ['options'],
        }),
    [t],
  )
  type FormValues = z.infer<typeof schema>

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      statement: question?.statement ?? '',
      timeLimitSec: question?.timeLimitSec ?? 205,
      options: toFormOptions(question),
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'options' })
  const options = useWatch({ control, name: 'options' })

  async function onSubmit(values: FormValues) {
    // letters are re-derived from position — options can be removed from the
    // middle of the list, so a stored `letter` value could otherwise go stale
    const payload = {
      ...values,
      options: values.options.map((option, index) => ({ ...option, letter: LETTERS[index] })),
    }
    if (isEditing) {
      await updateQuestion.mutateAsync({ id: question.id, payload })
    } else {
      await createQuestion.mutateAsync(payload)
    }
    reset()
    onOpenChange(false)
  }

  const isPending = createQuestion.isPending || updateQuestion.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? t('questionForm.titleEdit') : t('questionForm.titleNew')}
      className="max-w-xl"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="statement">{t('questionForm.statement')}</Label>
          <Textarea id="statement" rows={2} aria-invalid={!!errors.statement} {...register('statement')} />
          {errors.statement && <p className="mt-1 text-xs text-danger">{errors.statement.message}</p>}
        </div>

        <div>
          <Label htmlFor="timeLimitSec">{t('questionForm.timeLimitSec')}</Label>
          <Input
            id="timeLimitSec"
            type="number"
            {...register('timeLimitSec', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label>{t('questionForm.options')}</Label>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <span className="w-5 text-sm font-semibold text-muted-foreground">
                  {LETTERS[index] ?? '?'}
                </span>
                <input
                  type="radio"
                  name="correct-option"
                  checked={options[index]?.correct}
                  onChange={() => {
                    options.forEach((_, i) => setValue(`options.${i}.correct`, i === index))
                  }}
                  className="accent-primary"
                  title={t('questionForm.exactlyOneCorrectError')}
                />
                <Input
                  {...register(`options.${index}.text`)}
                  placeholder={`${t('questionForm.options')} ${LETTERS[index] ?? ''}`}
                  className="flex-1"
                />
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    aria-label={t('common.delete')}
                  >
                    <Trash2 size={14} className="text-danger" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {errors.options && (
            <p className="mt-1 text-xs text-danger">
              {errors.options.message ?? errors.options.root?.message}
            </p>
          )}
          {fields.length < LETTERS.length && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => append({ letter: LETTERS[fields.length], text: '', correct: false })}
            >
              <Plus size={14} />
              {t('questionForm.addOption')}
            </Button>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isEditing ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
