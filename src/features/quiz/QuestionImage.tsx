import { useState } from 'react'
import { Dialog } from '@/shared/components/ui/dialog'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

// Shared between the Quiz execution screen and the admin question list —
// renders nothing when there's no image (question.imageUrl is null), so a
// question without one looks exactly as it always has. Click-to-enlarge
// reuses the app's existing Dialog component rather than a new lightbox.
export function QuestionImage({
  src,
  alt,
  compact,
}: {
  src: string
  alt: string
  compact?: boolean
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 block w-full cursor-zoom-in"
        aria-label={t('quiz.imageExpand')}
      >
        <img
          src={src}
          alt={alt}
          className={
            compact
              ? 'mx-auto max-h-48 w-auto max-w-full rounded-lg border border-border object-contain'
              : 'mx-auto max-h-[420px] w-auto max-w-full rounded-lg border border-border object-contain'
          }
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen} title={t('quiz.imageDialogTitle')} className="max-w-3xl">
        <img
          src={src}
          alt={alt}
          className="mx-auto max-h-[80vh] w-auto max-w-full object-contain"
        />
      </Dialog>
    </>
  )
}
