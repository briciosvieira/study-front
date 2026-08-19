import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from '@/app/router'
import { queryClient } from '@/shared/api/queryClient'
import { LanguageProvider } from '@/shared/i18n/LanguageProvider'
import { ThemeProvider } from '@/shared/theme/ThemeProvider'

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
