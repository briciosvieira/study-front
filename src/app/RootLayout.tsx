import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { useSessionBootstrap } from '@/features/auth/useAuth'
import { PageSpinner } from '@/shared/components/Spinner'

function FullScreenSpinner() {
  return (
    <div className="flex h-dvh items-center justify-center">
      <PageSpinner />
    </div>
  )
}

export function RootLayout() {
  const { isBootstrapping } = useSessionBootstrap()

  if (isBootstrapping) {
    return <FullScreenSpinner />
  }

  // one Suspense boundary covers every lazy-loaded route below, so each
  // route module doesn't need its own fallback wiring
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <Outlet />
    </Suspense>
  )
}
