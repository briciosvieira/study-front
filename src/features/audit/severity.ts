import type { AuditSeverity } from '@/shared/types/api.types'

export const SEVERITY_BADGE_VARIANT: Record<AuditSeverity, 'muted' | 'default' | 'warning' | 'danger'> = {
  INFO: 'muted',
  WARNING: 'default',
  HIGH: 'warning',
  CRITICAL: 'danger',
}
