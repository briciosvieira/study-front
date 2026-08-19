import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

export function Checkbox({ className, ...props }: RadixCheckbox.CheckboxProps) {
  return (
    <RadixCheckbox.Root
      className={cn(
        'flex h-5 w-5 items-center justify-center rounded-md border border-input bg-surface transition-colors',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    >
      <RadixCheckbox.Indicator>
        <Check size={14} className="text-primary-foreground" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  )
}
