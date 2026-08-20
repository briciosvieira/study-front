import * as RadixAvatar from '@radix-ui/react-avatar'
import { LogOut, UserCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { homeRouteForRole, useAuth, useLogout } from '@/features/auth/useAuth'
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

export function UserAvatar({
  name,
  avatarUrl,
  className,
}: {
  name: string
  avatarUrl?: string | null
  className?: string
}) {
  return (
    <RadixAvatar.Root
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground',
        className,
      )}
    >
      {/* Radix shows the fallback automatically until the image finishes
          loading, and keeps showing it if the src is missing or fails —
          the existing initials fallback keeps working exactly as before. */}
      {avatarUrl && <RadixAvatar.Image src={avatarUrl} alt="" className="h-full w-full object-cover" />}
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
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={`${homeRouteForRole(user.role)}/profile`}>
            <UserCircle size={14} />
            {t('profile.myProfile')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout.mutate()}>
          <LogOut size={14} />
          {t('nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
