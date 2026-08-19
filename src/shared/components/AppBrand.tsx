import { cn } from '@/shared/utils/cn'

const SIZE = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' }

// StudyJA is a proper name — the product this app ships as — and must
// never be run through t(); it reads the same in every language.
export function AppBrand({
  className,
  size = 'md',
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <span className={cn('font-bold leading-tight text-primary', SIZE[size], className)}>
      StudyJA
    </span>
  )
}
