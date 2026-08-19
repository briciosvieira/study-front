import * as RadixProgress from '@radix-ui/react-progress'
import { cn } from '@/shared/utils/cn'

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <RadixProgress.Root
      value={value}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <RadixProgress.Indicator
        className="h-full bg-primary transition-transform"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </RadixProgress.Root>
  )
}
