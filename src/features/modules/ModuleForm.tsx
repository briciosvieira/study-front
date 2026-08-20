import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select } from '@/shared/components/ui/select'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { CourseModule, ModuleType } from '@/shared/types/api.types'
import { useCreateModule, useUpdateModule } from './useModules'

const MODULE_TYPES: ModuleType[] = ['PDF', 'VIDEO', 'QUIZ']
const STUDY_PRIORITIES = [1, 2, 3, 4, 5] as const

export function ModuleForm({
  open,
  onOpenChange,
  courseId,
  module: existingModule,
  defaultType,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  module?: CourseModule
  // pre-selects (and locks) the type when creating from a tab-specific
  // "+ New PDF/Video/Quiz" button — irrelevant while editing
  defaultType?: ModuleType
}) {
  const { t } = useTranslation()
  const createModule = useCreateModule(courseId)
  const updateModule = useUpdateModule(courseId)
  const isEditing = !!existingModule
  const isTypeLocked = isEditing || !!defaultType

  const schema = useMemo(
    () =>
      z.object({
        type: z.enum(MODULE_TYPES),
        title: z.string().min(2, t('common.tooShort')),
        coverUrl: z.url(t('common.invalidUrl')).optional().or(z.literal('')),
        studyPriority: z.number().min(1).max(5),
      }),
    [t],
  )
  type FormValues = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      type: existingModule?.type ?? defaultType ?? 'PDF',
      title: existingModule?.title ?? '',
      coverUrl: existingModule?.coverUrl ?? '',
      studyPriority: existingModule?.studyPriority ?? 3,
    },
  })

  async function onSubmit(values: FormValues) {
    const payload = { ...values, coverUrl: values.coverUrl || undefined }
    if (isEditing) {
      await updateModule.mutateAsync({ id: existingModule.id, payload })
    } else {
      await createModule.mutateAsync(payload)
    }
    reset()
    onOpenChange(false)
  }

  const isPending = createModule.isPending || updateModule.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? t('moduleForm.titleEdit') : t('moduleForm.titleNew')}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="title">{t('moduleForm.titleLabel')}</Label>
          <Input id="title" aria-invalid={!!errors.title} {...register('title')} />
          {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
        </div>
        <div>
          <Label htmlFor="type">{t('moduleForm.type')}</Label>
          <Select id="type" disabled={isTypeLocked} {...register('type')}>
            {MODULE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="coverUrl">{t('moduleForm.coverUrl')}</Label>
          <Input id="coverUrl" aria-invalid={!!errors.coverUrl} {...register('coverUrl')} />
          {errors.coverUrl && <p className="mt-1 text-xs text-danger">{errors.coverUrl.message}</p>}
        </div>
        <div>
          <Label htmlFor="studyPriority">{t('moduleForm.studyPriority')}</Label>
          <Select id="studyPriority" {...register('studyPriority', { valueAsNumber: true })}>
            {STUDY_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {t(`moduleForm.studyPriorityLevel.${priority}`)}
              </option>
            ))}
          </Select>
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
