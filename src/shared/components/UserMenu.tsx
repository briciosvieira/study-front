import * as RadixAvatar from '@radix-ui/react-avatar'
import { LogOut } from 'lucide-react'
import { useAuth, useLogout } from '@/features/auth/useAuth'
import { useTranslation } from '@/shared/i18n/LanguageProvider'
import { cn } from '@/shared/utils/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

export function UserAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <RadixAvatar.Root
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground',
        className,
      )}
    >
      <RadixAvatar.Fallback>{initials(name)}</RadixAvatar.Fallback>
    </RadixAvatar.Root>
  )
}

export function UserMenu() {
  const { user } = useAuth()
  const logout = useLogout()
  const { t } = useTranslation()

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <UserAvatar name={user.name} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout.mutate()}>
          <LogOut size={14} />
          {t('nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
