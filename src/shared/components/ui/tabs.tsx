import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '@/shared/utils/cn'

export function Tabs(props: RadixTabs.TabsProps) {
  return <RadixTabs.Root {...props} />
}

export function TabsList({ className, ...props }: RadixTabs.TabsListProps) {
  return (
    <RadixTabs.List
      className={cn(
        'flex items-center gap-1 overflow-x-auto border-b border-border',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: RadixTabs.TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'shrink-0 whitespace-nowrap rounded-t-md border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors',
        'hover:text-foreground',
        'data-[state=active]:border-primary data-[state=active]:bg-accent/50 data-[state=active]:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent(props: RadixTabs.TabsContentProps) {
  return <RadixTabs.Content {...props} />
}
