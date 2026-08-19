import { StaffModuleDetailPage } from '@/pages/shared/StaffModuleDetailPage'

export function ModuleDetailPage() {
  return <StaffModuleDetailPage basePath="/instructor/courses" canDelete={false} />
}
