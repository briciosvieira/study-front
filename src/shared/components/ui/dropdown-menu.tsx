import * as RadixDropdown from '@radix-ui/react-dropdown-menu'
import { cn } from '@/shared/utils/cn'

export function DropdownMenu(props: RadixDropdown.DropdownMenuProps) {
  return <RadixDropdown.Root {...props} />
}

export function DropdownMenuTrigger(props: RadixDropdown.DropdownMenuTriggerProps) {
  return <RadixDropdown.Trigger {...props} />
}

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  align = 'end',
  ...props
}: RadixDropdown.DropdownMenuContentProps) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-50 min-w-48 overflow-hidden rounded-lg border border-border bg-card p-1 text-card-foreground shadow-lg',
          'origin-[var(--radix-dropdown-menu-content-transform-origin)] data-[state=open]:animate-dropdown-in',
          className,
        )}
        {...props}
      />
    </RadixDropdown.Portal>
  )
}

export function DropdownMenuItem({ className, ...props }: RadixDropdown.DropdownMenuItemProps) {
  return (
    <RadixDropdown.Item
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm text-foreground outline-none',
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuLabel({ className, ...props }: RadixDropdown.DropdownMenuLabelProps) {
  return (
    <RadixDropdown.Label
      className={cn('px-2.5 py-1.5 text-xs font-medium text-muted-foreground', className)}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({
  className,
  ...props
}: RadixDropdown.DropdownMenuSeparatorProps) {
  return <RadixDropdown.Separator className={cn('my-1 h-px bg-border', className)} {...props} />
}
