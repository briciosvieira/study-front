import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { TemplateLibraryFile } from '@/shared/types/api.types'
import { useUpdateTemplate } from './useTemplateLibrary'

interface FormValues {
  name: string
  description: string
}

export function TemplateEditDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: TemplateLibraryFile | null
}) {
  const { t } = useTranslation()
  const updateTemplate = useUpdateTemplate()

  const { register, handleSubmit, reset } = useForm<FormValues>({
    values: { name: template?.name ?? '', description: template?.description ?? '' },
  })

  async function onSubmit(values: FormValues) {
    if (!template) return
    await updateTemplate.mutateAsync({
      id: template.id,
      payload: { name: values.name, description: values.description || undefined },
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        reset()
        onOpenChange(next)
      }}
      title={t('templateLibrary.editDialogTitle')}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="edit-template-name">{t('templateLibrary.nameLabel')}</Label>
          <Input id="edit-template-name" {...register('name', { required: true })} />
        </div>
        <div>
          <Label htmlFor="edit-template-description">{t('templateLibrary.descriptionLabel')}</Label>
          <Textarea id="edit-template-description" rows={3} {...register('description')} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={updateTemplate.isPending}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
