// Ensures the URL.parse fallback exists even if this module is ever reached
// through a path other than main.tsx's top-level import (safe no-op re-import
// — ES modules only evaluate once).
import '@/shared/polyfills/url-parse'

import { ArrowLeft, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Button } from '@/shared/components/ui/button'
import { PageSpinner } from '@/shared/components/Spinner'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { PdfErrorBoundary } from './PdfErrorBoundary'
import { PdfLoadError } from './PdfLoadError'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export function PdfViewer({
  fileUrl,
  title,
  onBack,
}: {
  fileUrl: string
  title: string
  onBack: () => void
}) {
  const { t } = useTranslation()
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.1)
  const [retryKey, setRetryKey] = useState(0)

  function handleRetry() {
    setNumPages(0)
    setRetryKey((k) => k + 1)
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2.5 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:px-4">
        <button
          onClick={onBack}
          className="flex min-w-0 shrink items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} className="shrink-0" />
          <span className="truncate">{title}</span>
        </button>
        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface-muted p-0.5">
          <Button variant="ghost" size="icon" onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}>
            <Minus size={14} />
          </Button>
          <span className="w-10 text-center text-xs text-muted-foreground">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={() => setScale((s) => Math.min(3, s + 0.2))}>
            <Plus size={14} />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center gap-4 overflow-auto bg-surface-muted p-4">
        <PdfErrorBoundary
          key={retryKey}
          fallback={<PdfLoadError onRetry={handleRetry} fileUrl={fileUrl} />}
        >
          <Document
            file={fileUrl}
            loading={<PageSpinner />}
            error={<PdfLoadError onRetry={handleRetry} fileUrl={fileUrl} />}
            onLoadError={(error) => console.error('[PdfViewer] failed to load PDF:', error)}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <Page
                key={i}
                pageNumber={i + 1}
                scale={scale}
                className="mb-4 shadow-md"
                error={
                  <p className="mb-4 rounded-md bg-card px-4 py-3 text-sm text-muted-foreground">
                    {t('pdf.pageLoadError', { page: i + 1 })}
                  </p>
                }
              />
            ))}
          </Document>
        </PdfErrorBoundary>
      </div>
    </div>
  )
}
