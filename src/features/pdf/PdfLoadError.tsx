import { FileWarning } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useTranslation } from '@/shared/i18n/LanguageProvider'

export function PdfLoadError({ onRetry, fileUrl }: { onRetry: () => void; fileUrl?: string }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <FileWarning size={40} className="text-muted-foreground" />
      <div>
        <p className="text-sm font-medium text-foreground">{t('pdf.loadErrorTitle')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('pdf.loadErrorDescription')}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onRetry}>{t('pdf.retryButton')}</Button>
        {fileUrl && (
          <Button variant="secondary" asChild>
            <a href={fileUrl} target="_blank" rel="noreferrer">
              {t('pdf.openDirectly')}
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
