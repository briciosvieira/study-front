import { StaffUsersPage } from '@/pages/shared/StaffUsersPage'

// Instructors only get password-reset access here (enforced server-side
// regardless) — no create/edit/delete/activate/deactivate.
export function UsersPage() {
  return <StaffUsersPage canManage={false} />
}
