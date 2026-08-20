import { QueryClientProvider } from '@tanstack/react-query'
import type { CSSProperties } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from '@/app/router'
import { queryClient } from '@/shared/api/queryClient'
import { LanguageProvider } from '@/shared/i18n/LanguageProvider'
import { ThemeProvider, useTheme } from '@/shared/theme/ThemeProvider'
import { toSonnerTheme } from '@/shared/theme/themes'

// Sonner manages its own light/dark palette and doesn't read our theme
// tokens on its own — this keeps toasts in sync with whichever app theme is
// active instead of always rendering its default light (white) card.
function AppToaster() {
  const { theme } = useTheme()
  return (
    <Toaster
      richColors
      position="top-right"
      theme={toSonnerTheme(theme)}
      style={
        {
          '--normal-bg': 'var(--card)',
          '--normal-text': 'var(--card-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--card)',
          '--success-text': 'var(--success)',
          '--success-border': 'var(--border)',
          '--error-bg': 'var(--card)',
          '--error-text': 'var(--danger)',
          '--error-border': 'var(--border)',
          '--warning-bg': 'var(--card)',
          '--warning-text': 'var(--warning)',
          '--warning-border': 'var(--border)',
        } as CSSProperties
      }
    />
  )
}

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <AppToaster />
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
