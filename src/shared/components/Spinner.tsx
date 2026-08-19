import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin text-muted-foreground', className)} size={20} />
}

export function PageSpinner() {
  return (
    <div className="flex h-full min-h-40 items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  )
}
