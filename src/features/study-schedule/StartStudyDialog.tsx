import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'
import { Label } from '@/shared/components/ui/label'
import { Select } from '@/shared/components/ui/select'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { useStartStudySession, useStudyResources } from './useStudySchedule'

const RESOURCE_TYPES = ['PDF', 'QUIZ', 'VIDEO'] as const

// The picker for the manual "+ Iniciar estudo" button — always the actual
// studyable content (individual PDFs/videos, quiz modules), grouped by type.
// The module/folder itself is never a selectable option here.
export function StartStudyDialog({
  open,
  onOpenChange,
  courseId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const startSession = useStartStudySession(courseId)
  const { data: resources } = useStudyResources(courseId)
  const [resourceId, setResourceId] = useState('')

  const byType = useMemo(() => {
    const map = new Map<(typeof RESOURCE_TYPES)[number], typeof resources>()
    for (const type of RESOURCE_TYPES) {
      map.set(type, resources?.filter((r) => r.resourceType === type) ?? [])
    }
    return map
  }, [resources])

  const selected = resources?.find((r) => r.resourceId === resourceId) ?? resources?.[0]

  async function handleSubmit() {
    if (!selected) return
    await startSession.mutateAsync({
      moduleId: selected.moduleId,
      pdfItemId: selected.resourceType === 'PDF' ? selected.resourceId : undefined,
      videoItemId: selected.resourceType === 'VIDEO' ? selected.resourceId : undefined,
    })
    onOpenChange(false)

    if (selected.resourceType === 'PDF') {
      navigate(`/modules/${selected.moduleId}/pdf/${selected.resourceId}`)
    } else if (selected.resourceType === 'VIDEO') {
      navigate(`/modules/${selected.moduleId}/video/${selected.resourceId}`)
    } else {
      navigate(`/modules/${selected.moduleId}/quiz`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t('studySchedule.startDialogTitle')}>
      <div className="space-y-4">
        {!resources?.length ? (
          <p className="text-sm text-muted-foreground">{t('studySchedule.startDialogEmpty')}</p>
        ) : (
          <div>
            <Label htmlFor="start-study-resource">{t('studySchedule.startDialogResourceLabel')}</Label>
            <Select
              id="start-study-resource"
              value={selected?.resourceId ?? ''}
              onChange={(e) => setResourceId(e.target.value)}
            >
              {RESOURCE_TYPES.map((type) => {
                const items = byType.get(type)
                if (!items?.length) return null
                return (
                  <optgroup key={type} label={t(`studySchedule.resourceType.${type}`)}>
                    {items.map((r) => (
                      <option key={r.resourceId} value={r.resourceId}>
                        {r.resourceTitle}
                      </option>
                    ))}
                  </optgroup>
                )
              })}
            </Select>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!selected || startSession.isPending}>
            {t('studySchedule.startDialogSubmit')}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
