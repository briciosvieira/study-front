import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { Course } from '@/shared/types/api.types'
import { CourseCoverUpload, type CoverSelection } from './CourseCoverUpload'
import { useCreateCourse, useRemoveCourseCover, useUpdateCourse, useUploadCourseCover } from './useCourses'

export function CourseForm({
  open,
  onOpenChange,
  course,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  course?: Course
}) {
  const { t } = useTranslation()
  const createCourse = useCreateCourse()
  const updateCourse = useUpdateCourse()
  const uploadCover = useUploadCourseCover()
  const removeCover = useRemoveCourseCover()
  const isEditing = !!course

  const [coverSelection, setCoverSelection] = useState<CoverSelection>({
    file: null,
    removed: false,
  })

  const schema = useMemo(
    () =>
      z.object({
        title: z.string().min(2, t('common.tooShort')),
        description: z.string().optional(),
        about: z.string().optional(),
        targetAudience: z.string().optional(),
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
      title: course?.title ?? '',
      description: course?.description ?? '',
      about: course?.about ?? '',
      targetAudience: course?.targetAudience ?? '',
    },
  })

  async function onSubmit(values: FormValues) {
    const savedCourse = isEditing
      ? await updateCourse.mutateAsync({ id: course.id, payload: values })
      : await createCourse.mutateAsync(values)

    if (coverSelection.file) {
      await uploadCover.mutateAsync({ courseId: savedCourse.id, file: coverSelection.file })
    } else if (isEditing && coverSelection.removed) {
      await removeCover.mutateAsync(savedCourse.id)
    }

    reset()
    setCoverSelection({ file: null, removed: false })
    onOpenChange(false)
  }

  const isPending =
    createCourse.isPending || updateCourse.isPending || uploadCover.isPending || removeCover.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setCoverSelection({ file: null, removed: false })
        onOpenChange(next)
      }}
      title={isEditing ? t('courseForm.titleEdit') : t('courseForm.titleNew')}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label>{t('courseForm.cover')}</Label>
          <CourseCoverUpload
            key={`${open}-${course?.id ?? 'new'}`}
            currentCoverKey={course?.coverUrl}
            onChange={setCoverSelection}
            disabled={isPending}
            isUploading={uploadCover.isPending}
          />
        </div>

        <div>
          <Label htmlFor="title">{t('courseForm.titleLabel')}</Label>
          <Input id="title" aria-invalid={!!errors.title} {...register('title')} />
          {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
        </div>
        <div>
          <Label htmlFor="description">{t('courseForm.description')}</Label>
          <Textarea id="description" rows={2} {...register('description')} />
        </div>
        <div>
          <Label htmlFor="about">{t('courseForm.about')}</Label>
          <Textarea id="about" rows={4} {...register('about')} />
        </div>
        <div>
          <Label htmlFor="targetAudience">{t('courseForm.targetAudience')}</Label>
          <Textarea id="targetAudience" rows={3} {...register('targetAudience')} />
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
