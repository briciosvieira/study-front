import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Label } from '@/shared/components/ui/label'
import { Select } from '@/shared/components/ui/select'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import type { CourseModule } from '@/shared/types/api.types'
import { useStartStudySession } from './useStudySchedule'

export function StartStudyDialog({
  open,
  onOpenChange,
  courseId,
  modules,
  defaultModuleId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  modules: CourseModule[]
  defaultModuleId?: string
}) {
  const { t } = useTranslation()
  const startSession = useStartStudySession(courseId)
  const [moduleId, setModuleId] = useState(defaultModuleId ?? modules[0]?.id ?? '')

  async function handleSubmit() {
    if (!moduleId) return
    await startSession.mutateAsync({ moduleId })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t('studySchedule.startDialogTitle')}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="start-study-module">{t('studySchedule.startDialogModuleLabel')}</Label>
          <Select id="start-study-module" value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!moduleId || startSession.isPending}>
            {t('studySchedule.startDialogSubmit')}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
