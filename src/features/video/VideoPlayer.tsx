import { ArrowLeft } from 'lucide-react'

export function VideoPlayer({
  src,
  title,
  onBack,
}: {
  src: string
  title: string
  onBack: () => void
}) {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-border bg-surface px-3 py-2.5 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:px-4">
        <button
          onClick={onBack}
          className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} className="shrink-0" />
          <span className="truncate">{title}</span>
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center bg-black">
        <video controls className="max-h-full max-w-full" src={src} />
      </div>
    </div>
  )
}
