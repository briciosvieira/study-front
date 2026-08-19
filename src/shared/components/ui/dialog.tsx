import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function Dialog({ open, onOpenChange, title, description, children, className }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="animate-overlay-in fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[1px]" />
        <RadixDialog.Content
          className={cn(
            'animate-dialog-in fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden',
            // never taller than the real visible viewport (dvh accounts for
            // mobile browser chrome) — content below scrolls, header stays put
            'max-h-[calc(100dvh-2rem)] rounded-xl border border-border bg-card text-card-foreground shadow-2xl focus:outline-none',
            className,
          )}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-5 sm:p-6 sm:pb-4">
            <div>
              <RadixDialog.Title className="text-lg font-semibold text-card-foreground">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="mt-1 text-sm text-muted-foreground">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close
              className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Close"
            >
              <X size={18} />
            </RadixDialog.Close>
          </div>
          <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
