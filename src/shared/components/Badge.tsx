import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      default: 'bg-secondary text-secondary-foreground',
      muted: 'bg-muted text-muted-foreground',
      primary: 'bg-primary/10 text-primary',
      success: 'bg-success/12 text-success',
      warning: 'bg-warning/12 text-warning',
      danger: 'bg-danger/10 text-danger',
    },
  },
  defaultVariants: { variant: 'default' },
})

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
