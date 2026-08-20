import { useAuth } from '@/features/auth/useAuth'
import { PolicyAcceptanceModal } from '@/features/policy/PolicyAcceptanceModal'
import { PolicyDeletionPendingPage } from '@/features/policy/PolicyDeletionPendingPage'
import { PolicyReactivationRequestedPage } from '@/features/policy/PolicyReactivationRequestedPage'
import { PolicyReconsiderationPage } from '@/features/policy/PolicyReconsiderationPage'
import { PolicyReviewHoldPage } from '@/features/policy/PolicyReviewHoldPage'
import { PolicySuspendedPage } from '@/features/policy/PolicySuspendedPage'

// Reachable only while user.accessState is a policy-blocked state (see
// RequireAuth). Branches on the exact state rather than trying to guess it
// from the raw policy/acceptance payload — the backend already computed it.
export function PolicyRequiredPage() {
  const { user } = useAuth()

  if (user?.accessState === 'POLICY_REJECTED_RECOVERABLE') {
    return <PolicyReconsiderationPage />
  }
  if (user?.accessState === 'POLICY_REJECTED_EXPIRED') {
    return <PolicyDeletionPendingPage />
  }
  // Consolidated-account review hold (>= ESTABLISHED_ACCOUNT_DAYS old) —
  // completely separate flow from the short reconsideration/expiry above,
  // never auto-deletes.
  if (user?.accessState === 'POLICY_REVIEW_HOLD') {
    return <PolicyReviewHoldPage />
  }
  if (user?.accessState === 'REACTIVATION_REQUESTED') {
    return <PolicyReactivationRequestedPage />
  }
  if (user?.accessState === 'PENDING_ADMIN_DECISION') {
    return <PolicySuspendedPage />
  }
  return <PolicyAcceptanceModal />
}
